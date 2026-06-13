# DELIVERY — how to make sure you're playing HEAD, not a cached/old bundle

**Why this doc exists:** Van played build `7d43c721` and saw old-state symptoms (backward
char-select, detached kid hair, no sell mode, no menu) for features whose fixes were ALREADY
in that commit's source. Root cause was a **stale client**, not lost code: a long-lived browser
tab / disk cache served pre-fix JS modules under a fresh index.html, and a stale committed
`dist/` (Jun-8, pre-everything) was a second landmine. The source was never wrong.

## The two ways to run, and which stamp you get
- **`npm run dev`** (port **5273**) — the dev server. The build stamp (bottom-left on screen,
  and `window.__BUILD__` in the console) is read FRESH from `git HEAD` on every HTML request.
  This is what Van plays. **Use this.**
- **`npm run build` → `npm run preview`** (port 4273) — a production bundle in `dist/`. The
  stamp is baked at build time. Only for shipping checks. `dist/` is gitignored (never committed).

## The stale-client tells (now built in)
1. **On-screen stamp** (bottom-left, green): `build <hash> · <date time>`. Confirm `<hash>`
   matches `git rev-parse --short HEAD` in the repo. If it doesn't match → you're stale.
2. **Console at boot**: a green `[EMBERFALL] build <hash>` line. If instead you see a **red
   `STALE CLIENT — no build stamp`** error AND a red top banner on screen, you are running a
   cached pre-stamp bundle (e.g. the old dist). Reset (below).

## EXACT RESET — do this if the stamp is wrong or you see the red banner
1. **Stop any running dev server** (Ctrl+C in its terminal).
2. **Delete any local production build** (it can be served stale by `preview`):
   - PowerShell: `Remove-Item -Recurse -Force dist` (ignore "not found").
3. **Restart the dev server fresh**: `npm run dev` — it pins port **5273** (fails loudly if
   taken; if so, kill whatever holds 5273 rather than letting it hop).
4. **In the browser, hard-reload to bypass disk cache**: `Ctrl+Shift+R`
   (or open DevTools → Network → tick **Disable cache**, then reload).
5. **Confirm the stamp** (bottom-left) equals `git rev-parse --short HEAD`. Green console line,
   no red banner = you are on HEAD.

## If it STILL shows old state after a clean reset
Then it's a real source bug, not delivery — file it with the on-screen stamp so we know the
exact commit. (The stamp is the source of truth for "what code is this?".)
