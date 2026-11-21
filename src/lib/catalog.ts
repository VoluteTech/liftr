export const catalog = {
  bench: { name: "Bench press", aliases: ["barbell bench"], starter: true },
  squat: { name: "Squat", aliases: ["back squat"], starter: true },
  deadlift: { name: "Deadlift", aliases: ["conventional deadlift"], starter: true },
  dips: {
    name: "Dips",
    aliases: ["weighted dip", "parallel bar dip", "bodyweight dip"],
    starter: false,
  },
  overheadPress: { name: "Overhead press", aliases: ["OHP", "strict press"], starter: false },
  inclineBench: { name: "Incline barbell bench press", aliases: ["incline bench"], starter: false },
  frontSquat: { name: "Front squat", aliases: ["barbell front squat"], starter: false },
  romanianDeadlift: { name: "Romanian deadlift", aliases: ["RDL"], starter: false },
  barbellRow: { name: "Barbell row", aliases: ["bent over row"], starter: false },
  barbellCurl: { name: "Barbell curl", aliases: ["biceps curl"], starter: false },
} as const;
export type Exercise = keyof typeof catalog;
export const exerciseIds = Object.keys(catalog) as Exercise[];
export function dashboardIds(added: readonly Exercise[]) {
  return exerciseIds.filter((id) => catalog[id].starter || added.includes(id));
}
export function searchAvailable(query: string, active: readonly Exercise[]) {
  const term = query.trim().toLowerCase();
  return exerciseIds.filter(
    (id) =>
      !active.includes(id) &&
      [catalog[id].name, ...catalog[id].aliases].some((text) => text.toLowerCase().includes(term)),
  );
}
