import { useState } from "react";
import { useProfile, useSets, useDashboardIds, resetLocalData } from "./db/index";
import AddExercise from "./features/AddExercise";
import { catalog, type Exercise } from "./lib/catalog";
import {
  divisionPosition,
  rankProgress,
  strongestFirst,
  tierFor,
  type Profile,
} from "./engine/ladder";
import { generalElo, rank, isRanked, maxSet } from "./engine/ranking";
import RankCrest from "./components/RankCrest";
import RankBar from "./components/RankBar";
import ExerciseLog from "./features/ExerciseLog";
import ProfileForm from "./features/ProfileForm";

export default function App() {
  const profile = useProfile();
  const [editing, edit] = useState(false);
  const [selected, select] = useState<Exercise | null>(null);
  const [reset, setReset] = useState(() => new URLSearchParams(location.search).has("reset"));
  const [resetError, setResetError] = useState("");
  const dismissReset = () => {
    const params = new URLSearchParams(location.search);
    params.delete("reset");
    history.replaceState(
      null,
      "",
      location.pathname + (params.size ? `?${params}` : "") + location.hash,
    );
    setReset(false);
  };
  if (reset)
    return (
      <main className="max-w-sm mx-auto px-4 py-8 space-y-4">
        <h1>Reset Liftr?</h1>
        <p>This permanently deletes your profile and all lifts from this installation.</p>
        <button
          onClick={async () => {
            try {
              await resetLocalData();
              dismissReset();
            } catch {
              setResetError("Reset failed. Please try again.");
            }
          }}
        >
          Delete local data
        </button>
        <button onClick={dismissReset}>Cancel</button>
        {resetError && <p role="alert">{resetError}</p>}
      </main>
    );
  if (profile === undefined) return null;
  if (!profile?.name || editing) return <ProfileForm profile={profile} close={() => edit(false)} />;
  return (
    <>
      <header
        className="max-w-xl mx-auto px-4 flex items-center justify-between"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="text-3xl font-bold">Liftr</div>
        <nav aria-label="Account">
          <button
            aria-label={`Edit profile for ${profile.name}`}
            title="Edit profile"
            style={{ width: 44, height: 44, padding: 0, borderRadius: "50%" }}
            onClick={() => edit(true)}
          >
            {Array.from(profile.name)[0].toLocaleUpperCase()}
          </button>
        </nav>
      </header>
      {selected ? (
        <ExerciseLog key={selected} exercise={selected} back={() => select(null)} />
      ) : (
        <Dashboard profile={profile} select={select} />
      )}
    </>
  );
}

function TileRank({ label, elo }: { label: ReturnType<typeof tierFor>; elo: number }) {
  return (
    <span className="flex flex-col items-start gap-1 leading-tight [&>svg]:size-12">
      <RankCrest label={label} compact />
      <span className="text-lg font-bold">{label}</span>
      <b className="text-base tabular-nums text-(--ink)">{elo} Elo</b>
    </span>
  );
}

function Dashboard({
  profile,
  select,
}: {
  profile: Profile;
  select: (exercise: Exercise) => void;
}) {
  const rows = useSets();
  const ids = useDashboardIds();
  const ladder = (ids ?? [])
    .map((id) => {
      const sets = rows?.filter((row) => row.exercise === id) ?? [];
      const last = rank(sets, id).at(-1);
      return {
        id,
        last,
        max: maxSet(sets),
        position: last ? divisionPosition(id, last.best, profile) : null,
      };
    })
    .sort(strongestFirst);
  const progress = rankProgress(
    ladder.flatMap(({ position }) => (position === null ? [] : [position])),
  );
  const overall = generalElo(ladder.map(({ last }) => last?.rating));
  return (
    <main className="max-w-xl mx-auto px-4 py-8 space-y-4">
      <header>
        <small>LIFTR / OVERALL RANK</small>
        <div className="flex items-center gap-3">
          {progress && <RankCrest label={progress.label} />}
          <div>
            <h1 className="text-(--peach)">
              {!rows || !ids ? "Loading…" : (progress?.label ?? "Unranked")}
            </h1>
            {overall !== null && <p>{overall} Elo</p>}
          </div>
        </div>
        {progress ? (
          <RankBar {...progress} />
        ) : (
          rows && ids && <p>Log a set on a ranked exercise to start ranking.</p>
        )}
      </header>
      <h2 className="text-2xl">My lifts</h2>
      <div className="exercise-mosaic">
        {ladder.map(({ id, last, max }) => (
          <button
            key={id}
            className="exercise-card"
            data-tracking={Boolean(rows) && !isRanked(id)}
            onClick={() => select(id)}
          >
            <div className="flex min-w-0 flex-col items-start gap-1">
              <strong>{catalog[id].name}</strong>
              {!rows ? (
                <small>Loading history…</small>
              ) : !isRanked(id) ? (
                <>
                  <span>Tracking only</span>
                  {!max && <small>Log your first set →</small>}
                </>
              ) : last ? (
                <TileRank label={tierFor(id, last.best, profile)} elo={last.rating} />
              ) : (
                <>
                  <span>Unranked</span>
                  <small>
                    {id === "pullUp" && rows.some((row) => row.exercise === id)
                      ? "Log total load to rank →"
                      : "Log your first set →"}
                  </small>
                </>
              )}
            </div>
            <small className="self-center text-right">
              <span className="block">Max</span>
              {max ? (max.kg ? `${max.kg} kg × ${max.reps}` : `${max.reps} reps`) : "—"}
            </small>
          </button>
        ))}
      </div>
      {ids && <AddExercise active={ids} />}
    </main>
  );
}
