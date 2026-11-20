# Liftr

An offline bench log with a personal, Elo-inspired ladder. Each new 5 kg estimated-max benchmark counts as one win against a virtual opponent rated `1000 + 4 × benchmarkKg` (standard Elo expectation, K=32, rounded points). The same best always earns the same rating. Raw sets live in IndexedDB; clearing site data removes them.

## Run

`npm ci`, then `npm run dev`. Use `npm test` for ranking tests. For Cloudflare Pages, select build command `npm run build` and output directory `dist`.

## Offline acceptance check

Use `npm run build && npm run preview` on localhost, or open the deployed HTTPS site on your phone (plain LAN HTTP cannot register a service worker). Load once online and wait for the service worker to activate, then reload. Switch to airplane mode, log 60 kg × 5, and close and reopen the app offline. Expect a 70 kg estimated max, a positive rating change, and the set still in history. Repeat the set: expect zero extra points. Logging 65 kg × 5 should then earn points again.
