# Liftr

Offline personal exercise ladder for bench press, deadlift, squat and dips. Each exercise has its own history and Elo. Log total load in kg (for dips, bodyweight + added weight − assistance). The database upgrade assigns pre-existing sets to bench press without changing the raw history.

## Ranking

Epley estimates a one-rep max from every set: `kg × (1 + reps / 30)`, rounded to 0.1 kg. Each new 5 kg benchmark awards one Elo win; repeat and lighter days never lose points. Existing singles now also use Epley, so their recalculated ratings may change.

Add a local ranking profile to see tiers. The best estimated max divided by current profile weight determines Bronze → Silver → Gold → Platinum → Diamond → Titan, each ascending from I to V. The initial game thresholds (not clinical or competition standards) are in `src/engine/ladder.ts`. Divisions evenly subdivide each tier; Titan uses the preceding tier's width and caps at V. Editing the profile recalculates tiers, not Elo. Unlogged exercises remain unranked.

## Run and check

`npm ci` then `npm run dev`. Run `npm run lint && npm run test && npm run build` before shipping. For Cloudflare Pages use build command `npm run build` and output directory `dist`.

For an offline check, install the deployed HTTPS app on the iPhone Home Screen, open it online first, then reopen in airplane mode. Save 60 kg × 5 on bench, return to the ladder, then close and reopen. Bench should show 1247 Elo; previously empty exercises should still be unranked. Data stays on this device; Safari and the installed app may have separate storage.
