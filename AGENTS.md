# Brou-Kit — Agent Context

## Instructions for agents

- All code, UI text, comments, identifiers, and commit messages must be in **English**.
- `AGENTS.md` is the single source of truth for this project. **Any change that affects conventions, architecture, file structure, or approach must update this file as part of the same task** — not as an afterthought. If you added a feature, update the Features section. If you changed a convention, update the Code conventions section. Treat `AGENTS.md` as living documentation that stays in sync with the codebase at all times.

Brou-Kit is a Chrome/Brave browser extension that bundles multiple browser utilities into a single popup. It is the extension itself — not a container of sub-extensions.

## Project structure

```
brou-kit/
├── manifest.json       # Manifest V3
├── popup.html          # Popup UI — tab navigation + panel sections
├── popup.css           # Styles
├── popup.js            # Entry point — initNav() + imports feature modules
├── zoom.js             # Feature: zoom control
├── tabs.js             # Feature: open tabs listing
├── search.js           # Feature: in-page text search (popup side)
├── content.js          # Content script — runs in page, handles highlighting
├── icons/              # icon16.png, icon48.png, icon128.png
├── .clang-format       # WebKit style — JS only, never run on CSS
├── LICENSE             # AGPL-3.0
├── README.md
└── AGENTS.md           # This file
```

## Architecture

- **Manifest V3** — no background service worker unless strictly needed.
- **ES modules** — `popup.js` is the entry point loaded with `<script type="module">`. Each feature lives in its own file and exports an `init*()` function.
- **Content script** — `content.js` is declared in `manifest.json` and injected into all pages. It listens for messages from the popup via `chrome.runtime.onMessage`. Features that need DOM access communicate through it.
- **Permissions in use**: `tabs`, `activeTab`, `windows`, `storage`.

### Adding a new feature

1. Create `featurename.js` at the root with `export function initFeatureName() { ... }`.
2. Add a nav tab button in `popup.html`: `<button class="nav-tab" data-panel="featurename">Label</button>`.
3. Add a panel section in `popup.html`: `<section id="panel-featurename" class="panel">...</section>`.
4. Import and call it in `popup.js`.
5. Add styles in `popup.css`.

## Features

### Zoom (`zoom.js`)
- Controls the zoom level of the active tab only.
- UI: large zoom display, range slider (25%–500%, step 5), preset buttons (50%–200%), reset button.
- Slider `input` event updates UI live; `change` event (on release) calls the Chrome API.
- Caches the active tab ID on load to avoid repeated `chrome.tabs.query` calls.

### Tabs (`tabs.js`)
- Lists all open tabs across all windows.
- Shows favicon (with fallback), title, and highlights the current tab with a left border.
- Clicking a tab switches to it and focuses its window.

### Search (`search.js` + `content.js`)
- Searches for text in the active tab's visible DOM.
- The popup sends `{ type: "SEARCH", query }` to the content script via `chrome.tabs.sendMessage`.
- `content.js` wraps matches in `<mark class="brou-kit-mark">` elements with inline highlight style (`#fbbf24` yellow). Returns match count.
- Sending `{ type: "CLEAR_SEARCH" }` removes all marks and normalizes text nodes.
- Shows "Not available — reload the page" if the content script is not yet injected (e.g. pages open before extension load).

### Nav (`popup.js` — `initNav`)
- Tab navigation between panels.
- Persists the last active panel in `chrome.storage.local` (key: `activePanel`, default: `"zoom"`).

## Code conventions

- **No comments** in source code.
- **English only** — UI labels, strings, identifiers.
- **No inline styles** — all styling in `popup.css`.
- Functions are grouped by feature in their respective module file.
- No global variables — all state is scoped inside `init*()` functions.

## Formatting

- `.clang-format` uses **WebKit style** for JavaScript (`IndentWidth: 4`, `ColumnLimit: 100`).
- Run with: `clang-format -i popup.js zoom.js tabs.js`
- **Never run `clang-format` on `.css` files** — it destroys CSS syntax (adds spaces around hyphens in property names, breaks hex colors, breaks selectors).

## UI / Design

- Dark theme: background `#1a1a2e`, accent `#7c3aed` (purple).
- Popup width: `300px`.
- Panel `#panel-tabs` scrolls vertically up to `380px`.
- Current tab in the tabs list is marked with a `2px solid #7c3aed` left border.

## Chrome / Brave compatibility

- Requires Chrome 88+ or Brave equivalent (Manifest V3 support).
- Load unpacked via `brave://extensions` or `chrome://extensions` with Developer mode enabled.
