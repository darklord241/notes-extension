### background 
web based software can import a parser library via npm and pass the user input strings through the library functions and output the resulting HTML string into DOM 

### options for parsing
1. `EasyMDE` : popular, lightweight, allows for very easy integration into this extension as it can use the existing textarea element but it adds on much more extra options and is considered heavy in terms of this extension (~150-200KB, bundles CodeMirror). Adds its own UI/toolbar which can cause problems and provide unnecessary options for a small notes panel.
2. native method : using a `<div>` element with `contenteditable` attribute but it requires manual conversion to HTML tags and there is also checking required on what is typed in this — rejected, too much manual work for little benefit.
3. `marked` + `DOMPurify` : much more lightweight as compared to EasyMDE (~50KB combined). `marked` only renders markdown → HTML string, no editor UI baggage. `DOMPurify` sanitizes that HTML before it touches the DOM, since raw parsed markdown could contain unsafe tags — needed because `marked.parse()` output goes straight into `innerHTML`.

**Decision: went with `marked` + `DOMPurify`.**

### architecture decision: edit/preview toggle, not always-on rendering
Kept the raw `textarea` for editing and added a separate `previewDiv`, toggling `display` between the two rather than replacing the textarea outright — markdown notes still need to be editable as raw text, so both elements exist in the DOM at all times, only one visible at a time.

### mode-switching logic (in `renderPanel`, panel.js)
- No manual "preview" button — instead, reused the existing autosave debounce pattern.
- Two independent timers, both reset on every keystroke:
  - `autosaveTimer` (1000ms) → triggers `doSave()`
  - `previewTimer` (2000ms) → triggers `showPreviewMode()`
- Because the preview delay is longer than the save delay, by the time preview renders, the content is guaranteed to already be saved.
- `previewTimer` is scheduled unconditionally on every input (not gated behind the `isUpdated` check like `autosaveTimer` is) — otherwise, typing back down to exactly the last-saved content would leave the user stuck in edit mode with no way to trigger preview.
- Any keystroke (`textarea` input event) immediately calls `showEditMode()` first — this guards against the case where a user starts typing again while a stale preview is still showing (e.g. reopening a panel that auto-rendered on load).
- Clicking anywhere on `previewDiv` flips back to edit mode and refocuses the textarea (cursor placed at end of text) — this is what makes the automatic (button-less) flip-to-preview safe/non-jarring, since undoing it is a single click.
- `showPreviewMode()` guards against empty content (`if (!textarea.value.trim()) return`) so an empty note never renders as a blank preview box that looks broken.

### first-load preview
Bug caught during testing: on first `renderPanel()` call with an existing saved note, textarea was populated correctly but nothing triggered `showPreviewMode()` — user would see raw markdown syntax until they typed and paused. Fixed by calling `showPreviewMode()` near the end of `renderPanel()` (after `previewDiv` and related elements are queried/wired up) when `note?.content` is present.

### rendering function
```js
function renderMarkdownSafely(text) {
  return DOMPurify.sanitize(marked.parse(text));
}
```
Only one function needed — `marked.parse()` converts markdown text to an HTML string, `DOMPurify.sanitize()` strips anything unsafe before it's assigned to `previewDiv.innerHTML`.

### known gaps / not yet done
- feature toggle (on/off switch so markdown parsing code isn't loaded for users who don't want it) — deferred; current `import { marked } from 'marked'` and `import DOMPurify from 'dompurify'` are static imports at the top of panel.js, always bundled into the content script. Plan: convert to dynamic `import()` calls gated behind a settings flag (stored via `chrome.storage.local`) once markdown itself is confirmed stable. Dynamic-imported chunks from a content script need to be declared under `web_accessible_resources` in `manifest.json`, or Chrome blocks the fetch.
- syntax highlighting for code blocks (`highlight.js` or similar) — future enhancement, not in scope for this pass.
