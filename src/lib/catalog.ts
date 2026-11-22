function optional(name: string, ...aliases: string[]) {
  return { name, aliases, starter: false };
}
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
  tricepsExtension: optional(
    "Overhead triceps extension",
    "triceps extensions",
    "tricep extension",
  ),
  pushdown: optional("Triceps pushdown", "rope pressdown", "cable pushdown"),
  skullCrusher: optional("Skull crusher", "lying triceps extension"),
  preacherCurl: optional("Preacher curl", "preacher curls", "Scott curl"),
  hammerCurl: optional("Hammer curl", "neutral grip curl"),
  cableCurl: optional("Cable curl", "cable biceps curl"),
  legExtension: optional("Leg extension", "leg extensions", "quad extension"),
  legCurl: optional("Seated leg curl", "leg curls", "hamstring curl"),
  lyingLegCurl: optional("Lying leg curl", "lying leg curls", "prone hamstring curl"),
  legPress: optional("Leg press", "sled press"),
  hackSquat: optional("Hack squat", "machine hack squat"),
  splitSquat: optional("Bulgarian split squat", "rear foot elevated split squat"),
  gobletSquat: optional("Goblet squat", "kettlebell squat"),
  hipThrust: optional("Barbell hip thrust", "hip thrusts"),
  calfRaise: optional("Standing calf raise", "calf raises"),
  latPulldown: optional("Lat pulldown", "lat pull down"),
  seatedRow: optional("Seated cable row", "low row"),
  facePull: optional("Cable face pull", "face pulls"),
  lateralRaise: optional("Lateral raise", "side raises"),
  rearDeltFly: optional("Rear delt fly", "reverse fly", "reverse pec deck"),
  chestFly: optional("Machine chest fly", "pec deck"),
  cableFly: optional("Cable fly", "cable crossover"),
  chestPress: optional("Machine chest press", "chest press machine"),
  shoulderPress: optional("Dumbbell shoulder press", "DB shoulder press"),
  pushUp: optional("Push-ups", "push ups", "pushups", "push-up", "press up"),
  pullUp: optional("Pull ups", "pull-ups", "pullups", "weighted pull ups"),
  chinUp: optional("Chin-ups", "chin ups", "chinups"),
} as const;
export function usesRepsOnly(id: Exercise) {
  return id === "pushUp" || id === "chinUp";
}
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
