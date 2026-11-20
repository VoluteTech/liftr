import Dexie, { type EntityTable } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import type { Exercise, Profile } from "../engine/ladder";
import type { SetInput } from "../engine/ranking";
interface Lift extends SetInput {
  id: number;
  exercise: Exercise;
  time: number;
}
const db = new Dexie("liftr") as Dexie & {
  sets: EntityTable<Lift, "id">;
  profiles: EntityTable<Profile & { id: number }, "id">;
};
db.version(1).stores({ sets: "++id" });
db.version(2)
  .stores({ sets: "++id,exercise", profiles: "id" })
  .upgrade((tx) => tx.table("sets").toCollection().modify({ exercise: "bench" }));
export const useSets = () => useLiveQuery(() => db.sets.orderBy("id").toArray());
export const useProfile = () => useLiveQuery(async () => (await db.profiles.get(1)) ?? null);
export const saveProfile = (profile: Profile) => db.profiles.put({ ...profile, id: 1 });
export const addSet = (exercise: Exercise, input: SetInput) =>
  db.sets.add({ ...input, exercise, time: Date.now() });
