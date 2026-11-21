import Dexie, { type EntityTable } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import type { Exercise, Profile } from "../engine/ladder";
import type { SetInput } from "../engine/ranking";

export type UserProfile = Profile & { name: string };

interface Lift extends SetInput {
  id: number;
  exercise: Exercise;
  time: number;
}

const db = new Dexie("liftr") as Dexie & {
  sets: EntityTable<Lift, "id">;
  profiles: EntityTable<UserProfile & { id: number }, "id">;
};

db.version(1).stores({ sets: "++id" });
db.version(2)
  .stores({ sets: "++id,exercise", profiles: "id" })
  .upgrade((tx) => tx.table("sets").toCollection().modify({ exercise: "bench" }));

db.version(3)
  .stores({ profiles: "id" })
  .upgrade((tx) => tx.table("profiles").toCollection().modify({ name: "" }));

export const useSets = () => useLiveQuery(() => db.sets.orderBy("id").toArray());
export const useProfile = () => useLiveQuery(async () => (await db.profiles.get(1)) ?? null);
export const saveProfile = (profile: UserProfile) => db.profiles.put({ ...profile, id: 1 });

// Explicit local test reset; never clear data on an ordinary app launch.
export const resetLocalData = () =>
  db.transaction("rw", db.sets, db.profiles, async () => {
    await db.sets.clear();
    await db.profiles.clear();
  });

export const addSet = (exercise: Exercise, input: SetInput) =>
  db.sets.add({ ...input, exercise, time: Date.now() });
