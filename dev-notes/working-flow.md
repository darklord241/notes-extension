### Flow 1: Opening a question page for the first time (fresh page load)
1. user navigates directly to leetcode.com/problems/two-sum/ (typed URL, bookmark, fresh tab — a real page load, not SPA navigation).
2. Chrome loads the page, sees the URL matches content_scripts.matches in manifest.json, and injects content.js (bundled) into the page.
3. At the bottom of content.js, the top-level handleQuestionChange(); call fires immediately as the script loads.
4. Inside handleQuestionChange(): calls leetcodeAdapter.getQuestionInfo() → in leetcode-adapter.js, window.location.pathname is matched against QUESTION_URL_PATTERN, extracting id = "two-sum", then extractTitle() scrapes the DOM for the title text. Returns { isQuestionPage: true, id: "two-sum", title: "Two Sum" }.
5. Back in handleQuestionChange(): info.isQuestionPage is true, info.id differs from currentQuestionId (which starts as null), so it proceeds — sets currentQuestionId = "two-sum".
6. Calls getNote("leetcode", "two-sum") → in notes-store.js, builds the key "dsanotes:leetcode:two-sum", calls chrome.storage.local.get(key). First time ever, so nothing's stored — returns null.
7. Calls renderPanel({ site, questionId, title, note: null, onSave: handleSave }) → in panel.js: ensureShadowHost() creates the shadow host div, attaches shadow root, injects the CSS link — all for the first time. Builds the panel's HTML, textarea shows placeholder text (since note?.content ?? "" → "" because note is null), attaches the save button's click listener, stores panelElements.
8. user sees an empty notes panel floating on the page.

---

### Flow 2: Writing and saving a note
1. user types into the textarea — this is just native browser behavior, no JS involved yet (the DOM element itself holds the typed value in textarea.value).
2. user clicks "Save" → fires the click listener set up in renderPanel.
3. That listener calls onSave(questionId, { title, content: textarea.value, createdAt: note?.createdAt }) — since this is a first save, note was null, so createdAt is undefined.
3. onSave is actually handleSave from content.js (passed down as a callback back in step 7 of Flow 1). Inside handleSave: calls saveNote("leetcode", "two-sum", noteData).
5. In notes-store.js's saveNote(): builds the key again, constructs the full record — createdAt falls back to Date.now() since it was undefined, updatedAt set to Date.now(), tags defaults to []. Calls chrome.storage.local.set({ [key]: record }) — this actually persists it to disk (part of the browser profile's storage). Returns the constructed record.
6. Back in handleSave: calls updatePanel(savedRecord).
7. In panel.js's updatePanel(): sets panelElements.status.textContent = "Saved", then after 1.5s, clears it back to "".

---

### Flow 3: Navigating to a different question (SPA navigation, no full reload)
1. user clicks a "next question" link inside LeetCode's own UI. Their React app intercepts this and updates the URL via pushState — no full page reload, so content.js is not re-injected; the same running instance from Flow 1 stays alive.
2. background.js's chrome.webNavigation.onHistoryStateUpdated listener fires in the background service worker (a completely separate context from the page). Checks details.frameId === 0 (yes, it's the top frame). Tests the new URL against QUESTION_PAGE_PATTERN — matches.
3. Calls chrome.tabs.sendMessage(details.tabId, { type: MESSAGE_TYPES.QUESTION_CHANGED }) — sends a message specifically to that tab.
4. Back in content.js (the same instance, still alive from before): the chrome.runtime.onMessage.addListener callback fires, sees message.type === MESSAGE_TYPES.QUESTION_CHANGED, calls handleQuestionChange() again.
5. Same as steps 4–5 of Flow 1, but now info.id (say, "add-two-numbers") differs from currentQuestionId ("two-sum") — so it doesn't early-return, proceeds to update currentQuestionId.
6. Calls getNote("leetcode", "add-two-numbers"). If this question was never noted before → null → empty panel. If it was noted previously → returns the stored record.
7. Calls renderPanel(...) again → inside, ensureShadowHost() returns the existing shadow root immediately (already created in Flow 1, so it skips the creation branch) — but the panel-building code still runs fresh: finds and removes the old .dsanotes-panel div, builds a brand new one with the new question's data, reattaches listeners, overwrites panelElements.

---

### Flow 4: Navigating away from a question entirely (e.g. back to problem list)
- has to be worked upon 
1. SPA navigation to leetcode.com/problemset/ fires the same onHistoryStateUpdated listener in background.js.
2. QUESTION_PAGE_PATTERN.test(...) fails this time (no /problems/ in the URL) — the if block is skipped entirely, no message is sent.
3. Nothing happens in content.js — it never receives a message, so whatever was last rendered (the previous question's panel) technically stays sitting in the DOM, since nothing told it to remove itself.
