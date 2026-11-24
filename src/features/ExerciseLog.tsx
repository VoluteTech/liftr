import { useState, type FormEvent } from "react";
import ExerciseRankReveal, { type SavedRank } from "../components/ExerciseRankReveal";
import { catalog, usesRepsOnly, type Exercise } from "../lib/catalog";
import { divisionPosition, rankProgress } from "../engine/ladder";
import { LineChart, ResponsiveContainer, Line, YAxis, XAxis, Tooltip } from "recharts";
import { addSet, useSets, useProfile } from "../db/index";
import { estimateMax, isRanked, rank } from "../engine/ranking";

export default function ExerciseLog({ exercise, back }: { exercise: Exercise; back: () => void }) {
  const rows = useSets()?.filter((row) => row.exercise === exercise);
  const repsOnly = usesRepsOnly(exercise);
  const totalLoad = exercise === "dips" || exercise === "pullUp";
  const progress = rank(rows ?? [], exercise);
  const ranked = isRanked(exercise);
  const chart = ranked
    ? progress
    : (rows ?? []).map((row, i) => ({
        set: i + 1,
        estimate: repsOnly ? row.reps : estimateMax(row),
      }));
  const deltas = new Map(progress.map((point) => [point.set, point.delta]));
  const last = progress.at(-1);
  const profile = useProfile();
  const division =
    profile && last ? rankProgress([divisionPosition(exercise, last.best, profile)]) : null;

  const [savedRank, setSavedRank] = useState<SavedRank | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const input = { kg: repsOnly ? 0 : Number(data.get("kg")), reps: Number(data.get("reps")) };
    setBusy(true);

    try {
      if (!repsOnly) estimateMax(input);
      const id = await addSet(exercise, input);
      if (ranked) setSavedRank({ id, before: division });
      setNotice(
        `Saved ${repsOnly ? `${input.reps} reps` : `${input.kg} kg × ${input.reps}`} on this device.`,
      );
    } catch {
      setNotice("Set not saved. Check your inputs and that browser storage is available.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="max-w-xl mx-auto px-4 py-8 space-y-4">
      <button onClick={back}>← All exercises</button>
      <header>
        <small>LIFTR / PERSONAL LADDER</small>
        <h1>{catalog[exercise].name}</h1>
      </header>
      {!ranked ? (
        <section>
          <h3>Tracking only</h3>
          <p>Your sets and history are saved without affecting Elo or rank.</p>
        </section>
      ) : (
        <section>
          <small>EXERCISE RANK</small>
          {division && last ? (
            <ExerciseRankReveal
              division={division}
              elo={last.rating}
              saved={savedRank?.id === rows?.at(-1)?.id ? savedRank : null}
            />
          ) : (
            <h2>
              {!rows || profile === undefined ? "Loading…" : last ? "Profile needed" : "Unranked"}
            </h2>
          )}
          <p>
            {!last
              ? "Start at 1000. Log your first set to earn your first rating."
              : last.delta
                ? `+${last.delta} pts · Your estimated max reached new 5 kg benchmarks.`
                : "±0 pts · No new benchmark. Repeat and lighter sets never cost points."}
          </p>
          <p>Next benchmark: {last?.next ?? 5} kg estimated max.</p>
        </section>
      )}
      <section>
        <h3>Register a lift</h3>
        <form onSubmit={save} className="grid grid-cols-2 gap-3">
          {totalLoad && (
            <p className="col-span-2">
              Enter total load: bodyweight plus added weight, or minus assistance.
            </p>
          )}
          {!repsOnly && (
            <label>
              {totalLoad ? "Total load" : "Weight"} (kg)
              <input
                required
                type="number"
                step="0.1"
                min="0.1"
                max="600"
                name="kg"
                placeholder="60"
              />
            </label>
          )}
          <label>
            Reps
            <input
              required
              type="number"
              min="1"
              max={repsOnly ? undefined : 12}
              name="reps"
              placeholder="5"
            />
          </label>
          <button disabled={busy || !rows} className="col-span-2">
            {busy ? "Saving…" : "Save set"}
          </button>
        </form>
        <p role="status">{notice}</p>
      </section>
      <section>
        <h3>{repsOnly ? "Reps per set" : "Estimated max · kg"}</h3>
        {chart.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chart}>
              <XAxis dataKey="set" tickLine={false} stroke="var(--muted)" />
              <YAxis width={40} stroke="var(--muted)" />
              <Tooltip
                contentStyle={{ background: "var(--canvas)", borderColor: "var(--edge)" }}
              />{" "}
              <Line
                type="linear"
                dataKey="estimate"
                name={repsOnly ? "Reps" : "Estimated max (kg)"}
                stroke="var(--peach)"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>
            {totalLoad
              ? "Log a set with total load to start your trend."
              : "Your trend starts with your first set."}
          </p>
        )}
        {!repsOnly && <small>Estimated max (1–12 reps): weight × (1 + reps / 30).</small>}
      </section>
      <section>
        <h3>Recent sets</h3>
        {!rows ? (
          "Loading…"
        ) : !rows.length ? (
          "No sets yet."
        ) : (
          <ol>
            {rows
              .slice(-10)
              .reverse()
              .map((row, i) => (
                <li key={row.id}>
                  <b>
                    {repsOnly || (exercise === "pullUp" && row.kg === 0)
                      ? `${row.reps} reps`
                      : `${row.kg} kg × ${row.reps}`}
                  </b>{" "}
                  {deltas.has(rows.length - i) && `· +${deltas.get(rows.length - i)} pts`}
                  <br />
                  <small>{new Date(row.time).toLocaleString()}</small>
                </li>
              ))}
          </ol>
        )}
      </section>
      <footer>Local to this browser · No account or cloud backup</footer>
    </main>
  );
}
