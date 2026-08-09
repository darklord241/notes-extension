# Architecture Changes — Title Removal & Stability Fixes

## Context

After the initial working build, testing across multiple problem→problem SPA navigations surfaced several bugs. Fixing them led to a broader decision: drop DOM-scraped question titles entirely, since they were the root cause of most of the instability.

## Decision: derive title from the slug, don't scrape the DOM

**Before:** `leetcode-adapter.js` scraped `div.text-title-large` for the question title. Because LeetCode is an SPA, the URL updates before the DOM re-renders, so this required a `MutationObserver`-based wait (`waitForTitleElement`) to avoid reading stale or missing text.

**Now:** `panel.js` derives a display title directly from `questionId` (the URL slug) via `slugToTitle()` — `"add-two-numbers"` → `"Add Two Numbers"`.

**Why:** the slug is available synchronously and is never stale (it comes straight from `window.location.pathname`), unlike scraped DOM text. This removes an entire class of timing bugs at the cost of losing the LeetCode problem number prefix (e.g. "2." before the title) — a cosmetic tradeoff, not a functional one.

**Effect on data flow:** `title` is no longer threaded through the pipeline at all.
- `leetcode-adapter.js`'s `getQuestionInfo()` no longer returns a `title` field.
- `content.js` no longer passes `title` into `renderPanel()` or into the `onSave` payload.
- `notes-store.js`'s stored record no longer includes `title` — computed at render time in `panel.js` instead of persisted.
- `panel.js` is now the only file that knows a title is ever displayed — consistent with it being the only file responsible for presentation.

## Bug: `background.js` only messaged content.js when *entering* a question

`onHistoryStateUpdated` fired on every SPA navigation, but the message send was gated behind `QUESTION_PAGE_PATTERN.test(details.url)` — so leaving a question page sent nothing, and `removePanel()` never ran. The old panel stayed orphaned in the DOM.

**Fix:** send the message unconditionally on every navigation. Let `content.js`'s adapter check (`isQuestionPage`) be the single source of
truth for what to do with it — `background.js` doesn't need to duplicate that logic.

## Bug: overlapping async renders from duplicate messages

LeetCode's router sometimes fires more than one `onHistoryStateUpdated` event per navigation. Since `handleQuestionChange()` is `async` and awaits `getNote()` mid-function, a second message could start a second call before the first one finished — two independent render cycles racing on the same shadow root.

**Fix:** `isProcessing` boolean lock in `content.js`. Set synchronously at the top of `handleQuestionChange()` before any `await`, so a second call that arrives mid-flight returns immediately instead of racing. Unset in a `finally` block so it always resets even if an error is thrown mid-render.

Tradeoff: a navigation that arrives while a render is still in progress is silently dropped rather than queued. Acceptable for now — correctness (no duplicate panels) over completeness (never missing an update).

## Bug: `ensureShadowHost()` returned the wrong variable on repeat calls

```js
// before
if (shadowHost) return shadowHost;   // wrong — should return shadowRoot
```

First call: `shadowHost` is `null`, falls through, correctly returns
`shadowRoot`. Every call after that: hits the early return and gives back
`shadowHost` (the plain host div, outside the shadow tree) instead of
`shadowRoot` (the isolated tree everything should render into).

**Effect:** every render after the first appended the panel as a light-DOM sibling under `#dsanotes-host`, bypassing the shadow tree. Cleanup
(`root.querySelector(".dsanotes-panel")`) searched inside the wrong node and never found the previous panel, so panels stacked instead of being replaced.

**Fix:** one-line correction — `return shadowRoot;`.

## Net result

- `content.js`, `leetcode-adapter.js`: smaller — no title extraction, no DOM-waiting logic, no `MutationObserver`.
- `panel.js`: owns the one remaining piece of "make the slug presentable" logic (`slugToTitle`), consistent with its existing responsibility for all presentation concerns.
- `notes-store.js`: smaller stored record (drops `title`).
- Update pipeline (`background.js` → `content.js` → `panel.js`) is now race-safe (`isProcessing` lock) and reliably targets the correct DOM tree (`ensureShadowHost` fix).