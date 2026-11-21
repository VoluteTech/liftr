import { useState } from "react";
import { saveProfile, type UserProfile } from "../db/index";

export default function ProfileForm({
  profile,
  close,
}: {
  profile: UserProfile | null;
  close: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <main className="max-w-sm mx-auto px-4 py-8">
      <section>
        <small>LIFTR / RANKING PROFILE</small>
        <h1>{profile ? "Your profile" : "Welcome to Liftr"}</h1>
        <p>Your strength rank uses your current bodyweight and sex.</p>
        <form
          className="grid gap-3 mt-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (busy) return;
            const data = new FormData(event.currentTarget);
            const name = String(data.get("name") ?? "").trim();
            if (!name) {
              setError("Enter your name to continue.");
              return;
            }
            const sex = data.get("sex");
            if (sex !== "male" && sex !== "female") return;
            setBusy(true);
            setError("");
            try {
              await saveProfile({ name, kg: Number(data.get("kg")), sex });
              close();
            } catch {
              setError("Could not save your profile on this device. Please try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Name
            <input
              name="name"
              autoComplete="name"
              required
              maxLength={80}
              defaultValue={profile?.name ?? ""}
            />
          </label>
          <label>
            Bodyweight (kg)
            <input
              name="kg"
              type="number"
              min="1"
              max="600"
              step="0.1"
              required
              defaultValue={profile?.kg}
            />
          </label>
          <label>
            Sex
            <select name="sex" required defaultValue={profile?.sex ?? ""}>
              <option disabled value="">
                Choose sex
              </option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </label>
          <button disabled={busy}>
            {busy ? "Saving…" : profile ? "Save changes" : "Continue"}
          </button>
          {profile?.name && (
            <button type="button" disabled={busy} onClick={close}>
              Cancel
            </button>
          )}
          {error && <p role="alert">{error}</p>}
        </form>
      </section>
    </main>
  );
}
