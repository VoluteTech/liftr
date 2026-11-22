import type { Exercise } from "../lib/catalog";
export type Profile = { kg: number; sex: "male" | "female" };
const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Titan"] as const;
export type Tier = (typeof tiers)[number];
const divisions = ["V", "IV", "III", "II", "I"];

// Initial game calibration, not population percentiles. Each entry is the
// e1RM/bodyweight threshold for division V of the corresponding tier.
const standards = {
  bench: { male: [0, 0.5, 0.85, 1.15, 1.5, 1.85], female: [0, 0.3, 0.55, 0.8, 1, 1.25] },
  deadlift: { male: [0, 1, 1.5, 2, 2.5, 3], female: [0, 0.75, 1.15, 1.55, 2, 2.5] },
  squat: { male: [0, 0.75, 1.15, 1.55, 2, 2.5], female: [0, 0.55, 0.85, 1.2, 1.6, 2] },
  dips: { male: [0, 1, 1.2, 1.4, 1.65, 1.9], female: [0, 0.85, 1, 1.2, 1.4, 1.65] },
};
type RankedExercise = keyof typeof standards;
export function isRanked(exercise: Exercise): exercise is RankedExercise {
  return Object.hasOwn(standards, exercise);
}
// A position is measured in divisions: 0 = Bronze V, 5 = Silver V.
export function divisionPosition(exercise: RankedExercise, best: number, profile: Profile) {
  const ratio = best / profile.kg;
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

export function tierFor(exercise: RankedExercise, best: number, profile: Profile) {
  return rankProgress([divisionPosition(exercise, best, profile)])!.label;
}
