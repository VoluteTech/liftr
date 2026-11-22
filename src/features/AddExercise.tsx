import { useRef, useState } from "react";
import { addExercise } from "../db/index";
import { catalog, searchAvailable, type Exercise } from "../lib/catalog";
import "./picker.css";

export default function AddExercise({ active }: { active: Exercise[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState(""),
    [initial, setInitial] = useState<Exercise[]>([]),
    [added, setAdded] = useState<Exercise[]>([]),
    [busy, setBusy] = useState<Exercise | null>(null),
    [message, setMessage] = useState("");
  const matches = searchAvailable(query, initial);
  const shown = query.trim() ? matches : matches.slice(0, 4);
  async function add(id: Exercise) {
    setBusy(id);
    setMessage("");
    try {
      await addExercise(id);
      setAdded((prev) => [...prev, id]);
      setMessage(`${catalog[id].name} added.`);
    } catch {
      setMessage("Could not add exercise. Try again.");
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <button
        aria-haspopup="dialog"
        onClick={() => {
          setInitial(active);
          setAdded([]);
          setMessage("");
          setQuery("");
          dialog.current?.showModal();
        }}
      >
        + Add exercise
      </button>
      <dialog ref={dialog} aria-labelledby="picker-title" className="exercise-picker">
        <header>
          <div>
            <small>LIFTR / CATALOG</small>
            <h2 id="picker-title">Find an exercise</h2>
          </div>
          <button
            className="picker-icon"
            aria-label="Close exercise search"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </header>
        <input
          type="search"
          aria-label="Search exercises"
          placeholder="Search by name or alias…"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <h3>{query.trim() ? "Search results" : "Suggested exercises"}</h3>
        <ul>
          {shown.map((id) => {
            const done = added.includes(id) || active.includes(id);
            return (
              <li key={id}>
                <div>
                  <strong>{catalog[id].name}</strong>
                  <small>Ranked</small>
                </div>
                <button
                  className="picker-icon"
                  aria-label={`${done ? "Added" : "Add"} ${catalog[id].name}`}
                  disabled={done || busy !== null}
                  onClick={() => void add(id)}
                >
                  {done ? "✓" : busy === id ? "…" : "+"}
                </button>
              </li>
            );
          })}
        </ul>
        {!shown.length && (
          <p>
            {searchAvailable("", initial).length
              ? "No matches. Try another name or alias."
              : "Every catalog exercise is already on your dashboard."}
          </p>
        )}
        <p role="status">{message}</p>
      </dialog>
    </>
  );
}
