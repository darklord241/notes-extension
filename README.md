# DSA Notes Extension

A Chromium browser extension for taking notes on DSA questions (starting with LeetCode). Detects when you're on a single question page, and lets you view/create a note for it that floats on top of the page.

## Requirements

- [Node.js](https://nodejs.org/) (includes npm) — only needed if you want to build from source
- A Chromium-based browser (Chrome, Brave, Edge, etc.)

## Setup (build from source)

```bash
npm install
npm run build
```

This produces a `dist/` folder — the actual loadable extension.

## Loading into the browser

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle, top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. Open a question page, e.g. `https://leetcode.com/problems/two-sum/`

## Development

```bash
npm run dev
```

Runs Vite in watch mode with hot-reload support for the extension. Reload the extension in `chrome://extensions` if changes don't reflect automatically.

## If you don't want to build it yourself

If `dist/` is committed in this repo, you can skip the npm steps entirely — just clone the repo and load the `dist/` folder directly as described above.

## Project structure

```
src/
├── background/     — service worker, detects SPA navigation
├── content/         — injected into the page, renders the notes panel
├── adapters/        — per-site logic (currently: LeetCode)
├── storage/         — note read/write, backed by chrome.storage.local
└── shared/          — shared constants (message types, storage keys)
```

## Status

- [x] Detect LeetCode question pages
- [x] Create / save / load notes (plain text)
- [x] Floating panel UI
- [ ] Drag to reposition
- [ ] Cleanup panel on navigating away from a question
- [ ] Markdown support
- [ ] Additional site adapters (Codeforces, etc.)   