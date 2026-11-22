import { usesRepsOnly, type Exercise } from "../lib/catalog";
export type Profile = { kg: number; sex: "male" | "female" };
const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Titan"] as const;
export type Tier = (typeof tiers)[number];
const divisions = ["V", "IV", "III", "II", "I"];

// Initial game calibration, not population percentiles. Each entry is the
// e1RM/bodyweight threshold for division V of the corresponding tier.
// Provisional game standards: scale accessory ladders from their Gold V targets.
function targets(male: number, female: number) {
  const scale = (gold: number) => [0, 0.55, 1, 1.35, 1.7, 2.1].map((n) => n * gold);
  return { male: scale(male), female: scale(female) };
}
const standards = {
  bench: { male: [0, 0.5, 0.85, 1.15, 1.5, 1.85], female: [0, 0.3, 0.55, 0.8, 1, 1.25] },
  deadlift: { male: [0, 1, 1.5, 2, 2.5, 3], female: [0, 0.75, 1.15, 1.55, 2, 2.5] },
  squat: { male: [0, 0.75, 1.15, 1.55, 2, 2.5], female: [0, 0.55, 0.85, 1.2, 1.6, 2] },
  dips: { male: [0, 1, 1.2, 1.4, 1.65, 1.9], female: [0, 0.85, 1, 1.2, 1.4, 1.65] },
  overheadPress: targets(0.55, 0.33),
  inclineBench: targets(0.72, 0.46),
  frontSquat: targets(0.95, 0.7),
  romanianDeadlift: targets(1.2, 0.9),
  barbellRow: targets(0.8, 0.55),
  barbellCurl: targets(0.4, 0.25),
  tricepsExtension: targets(0.32, 0.2),
  pushdown: targets(0.48, 0.32),
  skullCrusher: targets(0.38, 0.24),
  preacherCurl: targets(0.32, 0.2),
  hammerCurl: targets(0.2, 0.13),
  cableCurl: targets(0.38, 0.24),
  legExtension: targets(0.9, 0.65),
  legCurl: targets(0.65, 0.48),
  lyingLegCurl: targets(0.6, 0.45),
  legPress: targets(2, 1.5),
  hackSquat: targets(1.35, 1),
  splitSquat: targets(0.6, 0.45),
  gobletSquat: targets(0.55, 0.4),
  hipThrust: targets(1.5, 1.3),
  calfRaise: targets(1.2, 0.9),
  latPulldown: targets(0.85, 0.62),
  seatedRow: targets(0.8, 0.6),
  facePull: targets(0.34, 0.24),
  lateralRaise: targets(0.13, 0.09),
  rearDeltFly: targets(0.15, 0.1),
  chestFly: targets(0.65, 0.4),
  cableFly: targets(0.24, 0.15),
  chestPress: targets(0.85, 0.55),
  shoulderPress: targets(0.29, 0.18),
  pullUp: targets(1.35, 1.13),
  // For reps-only movements the performance measure is repetitions, not kilograms.
  pushUp: { male: [0, 8, 18, 32, 48, 65], female: [0, 4, 10, 20, 32, 46] },
  chinUp: { male: [0, 3, 7, 12, 18, 26], female: [0, 2, 4, 7, 12, 18] },
} satisfies Record<Exercise, { male: number[]; female: number[] }>;
export function strongestFirst(a: { position: number | null }, b: { position: number | null }) {
  return (b.position ?? -1) - (a.position ?? -1);
}
// A position is measured in divisions: 0 = Bronze V, 5 = Silver V.
export function divisionPosition(exercise: Exercise, best: number, profile: Profile) {
  const ratio = usesRepsOnly(exercise) ? best : best / profile.kg;
  const thresholds = standards[exercise][profile.sex];
  let position = 0;
  for (let i = 0; i < thresholds.length; i++) {
    const width = (thresholds[i + 1] ?? 2 * thresholds[i] - thresholds[i - 1]) - thresholds[i];
    if (ratio >= thresholds[i]) position = (i + (ratio - thresholds[i]) / width) * divisions.length;
  }
  return Math.min(position, tiers.length * divisions.length - 1);
}

const levels = tiers.flatMap((tier) => divisions.map((division) => `${tier} ${division}` as const));

export function rankProgress(positions: readonly number[]) {
  if (!positions.length) return null;
  const mean = positions.reduce((sum, value) => sum + value, 0) / positions.length;
  const index = Math.floor(mean + 1e-10);
  const next = levels[index + 1] ?? null;
  return {
    label: levels[index],
    next,
    percent: next ? Math.min(99, Math.floor((mean - index) * 100 + 1e-8)) : 100,
  };
}

export function tierFor(exercise: Exercise, best: number, profile: Profile) {
  return rankProgress([divisionPosition(exercise, best, profile)])!.label;
}
