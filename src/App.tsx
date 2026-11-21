import { useState } from "react";
import { useProfile, useSets, useDashboardIds, resetLocalData } from "./db/index";
import AddExercise from "./features/AddExercise";
import { catalog, type Exercise } from "./lib/catalog";
import { divisionPosition, rankProgress, isRanked, tierFor, type Profile } from "./engine/ladder";
import { generalElo, rank } from "./engine/ranking";
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

function Dashboard({
  profile,
  select,
}: {
  profile: Profile;
  select: (exercise: Exercise) => void;
}) {
  const rows = useSets();
  const ids = useDashboardIds();
  const ladder = (ids ?? []).map((id) => ({
    id,
    last: !isRanked(id)
      ? undefined
      : rows && rank(rows.filter((row) => row.exercise === id)).at(-1),
  }));
  const progress = rankProgress(
    ladder.flatMap(({ id, last }) =>
      last && isRanked(id) ? [divisionPosition(id, last.best, profile)] : [],
    ),
  );
  const overall = generalElo(ladder.map(({ last }) => last?.rating));
  return (
    <main className="max-w-xl mx-auto px-4 py-8 space-y-4">
      <header>
        <small>LIFTR / OVERALL RANK</small>
        <h1 className="text-(--peach)">
          {!rows || !ids ? "Loading…" : (progress?.label ?? "Unranked")}
        </h1>
        {overall !== null && <p>{overall} Elo</p>}
        {progress ? (
          <RankBar {...progress} />
        ) : (
          rows && ids && <p>Log a set on a ranked exercise to start ranking.</p>
        )}
      </header>
      <h2 className="text-2xl">Your greatest lifts</h2>
      <div className="exercise-mosaic">
        {ladder.map(({ id, last }) => (
          <button key={id} className="exercise-card" onClick={() => select(id)}>
            <strong>{catalog[id].name}</strong>
            {!rows ? (
              <small>Loading history…</small>
            ) : !isRanked(id) ? (
              <>
                <span>Tracking only</span>
                <small>
                  {rows.some((row) => row.exercise === id)
                    ? "View history →"
                    : "Log your first set →"}
                </small>
              </>
            ) : last ? (
              <>
                <span>{tierFor(id, last.best, profile)}</span>
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
      {ids && <AddExercise active={ids} />}
    </main>
  );
}
