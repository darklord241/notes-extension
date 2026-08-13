# DSA Notes Extension

A Chromium browser extension for taking notes on DSA questions <br>
Detects when you're on a single question page (LeetCode or Codeforces) <br> 

## Requirements

- [Node.js](https://nodejs.org/) (includes npm) — only needed if you want to build from source
- A Chromium-based browser (Chrome, Brave, Edge, etc.)

## Setup (build from source)

```bash
npm install
npm run build
```

This produces a `dist/` folder — the actual loadable extension.

## Installing without building

If you'd rather not build from source, download a pre-built zip from the
[Releases page](<br>/<br>/releases):

1. Download the zip for the version you want (e.g. `dsa-notes-v2.zip`)
2. Extract it:
   - **Windows**: right-click the zip → **Extract All**
   - **macOS**: double-click the zip — Finder extracts it into a new folder automatically
   - **Linux**: `unzip dsa-notes-v2.zip -d dsa-notes-v2` (a plain `unzip` with no `-d` extracts loose files into your current folder instead of a new one, so `-d` is worth using)

## Loading into the browser

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle, top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder or unzipped folder 
5. Open a question page, e.g. `https://leetcode.com/problems/two-sum/`
   or `https://codeforces.com/problemset/problem/2256/A`

## Versions

**v1** : 
LeetCode only <br>
Detects question pages, floating panel with plain-text notes <br>
Manual save, `chrome.storage.local` for storage <br> 

**v2** : 
Adds Codeforces support via a per-site adapter pattern <br>
Storage moved to IndexedDB, centralized in the background service worker <br> 
Autosave with a debounced save-on-pause plus a live unsaved/saved status indicator <br>
Panel is now draggable, resizable, and collapsible (collapsed by default), with a keyboard shortcut (Alt+L) to toggle it <br> 

## Inspecting stored notes

Notes are stored in IndexedDB, owned by the extension's background
service worker

1. Go to `chrome://extensions`
2. Click the **"service worker"** link on this extension's card
3. In the DevTools window that opens, go to **Application → IndexedDB → DsaNotesDB → notes**

You will **not** see note data under a LeetCode or Codeforces tab's own
Application panel — IndexedDB opened from a page is scoped to that page's
origin, not the extension. The service worker is the one place with a
consistent view of all stored notes across every supported site.

## Project structure

```
src/
├── background/   — service worker: owns IndexedDB, detects SPA navigation,
│                   handles the keyboard shortcut, answers storage requests
│                   from content scripts via message passing
├── content/      — injected into the page; orchestrates which adapter is
│                   active and renders the notes panel
├── adapters/     — per-site logic: LeetCode, Codeforces (URL parsing,
│                   question ID extraction)
├── storage/      — Dexie/IndexedDB access (background-only) and the
│                   one-time migration from the old per-site local storage
└── shared/       — shared constants (message types)
```

## Status

- [x] Detect LeetCode and Codeforces question pages
- [x] Create / save / load notes (plain text), autosave with debounce
- [x] Floating, draggable, resizable, collapsible panel
- [x] Keyboard shortcut to toggle the panel
- [x] IndexedDB storage, centralized in the background service worker
- [ ] Delete-note UI (storage function exists, not yet wired to a button)
- [ ] Export notes to JSON
- [ ] Markdown support
- [ ] Cross-device sync
