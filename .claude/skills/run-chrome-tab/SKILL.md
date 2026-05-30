---
name: run-chrome-tab
description: Start the dev server and drive the Chrome Tab app via Playwright. Use when asked to run, start, screenshot, or test this Vite + Vue 3 SPA.
---

Start the Vite dev server, then drive the SPA via a Playwright driver
at `.claude/skills/run-chrome-tab/driver.mjs` — it opens the home page,
navigates to feature pages, takes screenshots, and verifies UI interactions.

All paths below are relative to the repo root (`e:\Demo\chorme-tab`).

## Prerequisites

```bash
cd "e:/Demo/chorme-tab"
npm install
```

Requires Google Chrome installed at `C:/Program Files/Google/Chrome/Application/chrome.exe`.
Playwright (installed by `npm install` above) will use it automatically.

## Run the app + driver (agent path)

Start the dev server, wait for it, then run the driver which takes
screenshots and verifies the UI:

```bash
# 1. Start Vite dev server in background
npx vite --port 520 &
echo $! > /tmp/vite.pid

# 2. Wait for server to be ready
timeout 30 bash -c 'until curl -sf http://localhost:520 >/dev/null 2>&1; do sleep 1; done'

# 3. Run the driver
node .claude/skills/run-chrome-tab/driver.mjs

# 4. Stop the server
kill $(cat /tmp/vite.pid) 2>/dev/null
```

The driver script (`.claude/skills/run-chrome-tab/driver.mjs`) performs:

| Step | What it does |
|------|-------------|
| Home page | Navigates to `/#/`, takes `01-home.png` |
| Tasks page | Navigates to `/#/tasks`, takes `02-tasks.png` |
| Filter test | Applies urgency filter, takes `03-filters.png` |
| Add dialog | Opens add-task dialog, takes `04-add-dialog.png` |
| Reset | Resets all filters, takes `05-reset.png` |

Screenshots land in `C:/Users/dell/AppData/Local/Temp/chrome-tab-shots/`.

To run specific steps only, open `driver.mjs` and comment out the ones
you don't need.

## Run (human path)

```bash
cd "e:/Demo/chorme-tab"
npm run dev
# → opens http://localhost:520 in development mode
# Ctrl-C to stop
```

## Build for production

```bash
cd "e:/Demo/chorme-tab"
npm run build
# → output in dist/
```

## Gotchas

- **Vite pre-bundle cache**: After changing dependencies or adding new
  Node modules, delete `node_modules/.vite/` before starting the dev
  server, or you'll see 504 errors for stale optimized deps:
  `rm -rf node_modules/.vite && npx vite --port 520`
- **Hash router**: This app uses Vue Router hash mode. All internal URLs
  start with `/#/`. Direct `goto` to `http://localhost:520/#/tasks` works.
- **NPM install dependency conflicts**: When installing new packages,
  `@vitejs/plugin-vue@5.2.0` requires Vite 5.x but the project uses
  Vite 4.x. Use `npm install --legacy-peer-deps` if you hit peer
  dependency conflicts.

## Troubleshooting

- **`connect ETIMEDOUT` when Playwright downloads Chromium**: You have
  system Chrome instead. The driver uses `executablePath` pointing to
  `C:/Program Files/Google/Chrome/Application/chrome.exe` — it doesn't
  need Playwright's bundled browser.
- **`504 Outdated Optimize Dep`** in console: Vite pre-bundle is stale.
  Delete `node_modules/.vite/` and restart.
- **Page shows `<!---->`**: Vue Router couldn't match the route.
  Verify the route exists in `src/router/index.js` and the hash URL is
  correct.
