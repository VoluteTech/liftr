import { type Exercise } from "../lib/catalog";
export interface SetInput {
  kg: number;
  reps: number;
}

export function isRanked(id: Exercise) {
  return id === "bench" || id === "deadlift" || id === "squat" || id === "pullUp" || id === "dips";
}
export function maxSet(sets: readonly SetInput[]) {
  return sets.reduce<SetInput | undefined>(
    (best, set) =>
      !best || set.kg > best.kg || (set.kg === best.kg && set.reps > best.reps) ? set : best,
    undefined,
  );
}
export function generalElo(ratings: readonly (number | undefined)[]) {
  const ranked = ratings.filter((rating): rating is number => rating !== undefined);
  return ranked.length
    ? Math.round(ranked.reduce((sum, rating) => sum + rating, 0) / ranked.length)
    : null;
}

export function estimateMax({ kg, reps }: SetInput) {
  if (
    !Number.isFinite(kg) ||
    kg <= 0 ||
    kg > 600 ||
    !Number.isInteger(reps) ||
    reps < 1 ||
    reps > 12
  )
    throw new Error("Invalid set");
  return Math.round(10 * kg * (1 + reps / 30)) / 10;
}
// Each 5 kg benchmark is a virtual opponent. Defeat each at most once.
export function rank(sets: SetInput[], exercise: Exercise = "bench") {
  if (!isRanked(exercise)) return [];
  const step = 5;
  let best = 0,
    rating = 1000;
  return sets.flatMap((input, i) => {
    // Historical pull ups without total load cannot be scored reliably.
    if (exercise === "pullUp" && input.kg === 0) return [];
    const estimate = estimateMax(input);
    const previous = rating;
    for (let target = step * (1 + Math.floor(best / step)); target <= estimate; target += step) {
      const expected = 1 / (1 + 10 ** ((1000 + target * 4 - rating) / 400));
      rating += Math.round(32 * (1 - expected));
    }
    best = Math.max(best, estimate);
    return {
      set: i + 1,
      estimate,
      best,
      rating,
      delta: rating - previous,
      next: step * (1 + Math.floor(best / step)),
    };
  });
}
