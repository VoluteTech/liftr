import { useState } from "react";
import { useProfile, useSets, saveProfile } from "./db/index";
import {
  exercises,
  exerciseIds,
  divisionPosition,
  rankProgress,
  tierFor,
  type Exercise,
} from "./engine/ladder";
import { generalElo, rank } from "./engine/ranking";
import RankBar from "./components/RankBar";
import ExerciseLog from "./features/ExerciseLog";

export default function App() {
  const [selected, select] = useState<Exercise | null>(null);
  const [message, setMessage] = useState("");
  const rows = useSets(),
    profile = useProfile();

  if (selected) return <ExerciseLog key={selected} exercise={selected} back={() => select(null)} />;
  const ladder = exerciseIds.map((id) => ({
    id,
    last: rows && rank(rows.filter((row) => row.exercise === id)).at(-1),
  }));
  const progress = rankProgress(
    ladder.flatMap(({ id, last }) =>
      profile && last ? [divisionPosition(id, last.best, profile)] : [],
    ),
  );
  const overall = generalElo(ladder.map(({ last }) => last?.rating));
  return (
    <main className="max-w-xl mx-auto px-4 py-8 space-y-4">
      <header>
        <small>LIFTR / OVERALL RANK</small>
        <h1 className="text-[var(--peach)]">
          {!rows || profile === undefined
            ? "Loading…"
            : (progress?.label ?? (overall === null ? "Unranked" : "Profile needed"))}
        </h1>
        {overall !== null && <p>{overall} Elo</p>}
        {progress ? (
          <RankBar {...progress} />
        ) : (
          rows &&
          profile !== undefined && (
            <p>
              {overall === null
                ? "Log your first set to start ranking."
                : "Add your bodyweight and strength standard under Ranking profile to reveal your rank."}
            </p>
          )
        )}
      </header>
      <h2 className="text-2xl">Your exercises</h2>
      <div className="exercise-mosaic">
        {ladder.map(({ id, last }) => (
          <button key={id} className="exercise-card" onClick={() => select(id)}>
            <strong>{exercises[id]}</strong>
            {!rows ? (
              <small>Loading history…</small>
            ) : last ? (
              <>
                <span>{profile ? tierFor(id, last.best, profile) : "Profile needed"}</span>
                <small>{last.rating} Elo</small>
              </>
            ) : (
              <>
                <span>Unranked</span>
                <small>Log your first set →</small>
              </>
            )}
          </button>
        ))}
      </div>
      {profile !== undefined && (
        <details>
          <summary>Ranking profile{profile ? ` · ${profile.kg} kg` : " · Not set"}</summary>
          <p>
            Elo rewards new strength benchmarks. Your tier compares your best estimated max with
            standards for your exercise, sex and current bodyweight.
          </p>
          <form
            className="grid gap-3 mt-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const sex = data.get("sex");
              if (sex !== "male" && sex !== "female") return;
              try {
                await saveProfile({ kg: Number(data.get("kg")), sex });
                setMessage("Profile saved. Tiers updated.");
              } catch {
                setMessage("Could not save profile on this device.");
              }
            }}
          >
            <label>
              Bodyweight (kg)
              <input
                name="kg"
                required
                type="number"
                min="1"
                max="600"
                step="0.1"
                defaultValue={profile?.kg}
              />
            </label>
            <label>
              Strength standard{" "}
              <select name="sex" required defaultValue={profile?.sex ?? ""}>
                <option value="" disabled>
                  Choose standard
                </option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
            <button>Save ranking profile</button>
            <p role="status">{message}</p>
          </form>
        </details>
      )}
    </main>
  );
}
