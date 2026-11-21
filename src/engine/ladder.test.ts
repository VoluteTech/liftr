import { expect, test } from "vitest";
import { exerciseIds } from "../lib/catalog";
import { divisionPosition, rankProgress, isRanked, tierFor } from "./ladder";
const male = { sex: "male", kg: 100 } as const;
test("overall rank averages fractional divisions before rounding", () => {
  const positions = [50, 57].map((best) => divisionPosition("bench", best, male));
  expect(rankProgress(positions)).toEqual({ label: "Silver V", next: "Silver IV", percent: 50 });
  expect(rankProgress([4.999])).toEqual({ label: "Bronze I", next: "Silver V", percent: 99 });
  expect(rankProgress([5])).toEqual({ label: "Silver V", next: "Silver IV", percent: 0 });
  expect(rankProgress([divisionPosition("bench", 500, male)])).toEqual({
    label: "Titan I",
    next: null,
    percent: 100,
  });
  expect(rankProgress([])).toBeNull();
});
const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Titan"];
const divisions = ["V", "IV", "III", "II", "I"];
test("only calibrated exercises are ranked", () =>
  expect(exerciseIds.filter(isRanked)).toEqual(["bench", "squat", "deadlift", "dips"]));
test.each(exerciseIds.filter(isRanked))(
  "%s exposes all 30 divisions in order for both standards",
  (exercise) => {
    for (const sex of ["male", "female"] as const) {
      const seen = new Set<string>();
      for (let kg = 0; kg <= 400; kg++) seen.add(tierFor(exercise, kg, { kg: 100, sex }));
      expect([...seen]).toEqual(tiers.flatMap((t) => divisions.map((d) => `${t} ${d}`)));
    }
  },
);
test("tier boundaries use relative load and exercise-specific standards", () => {
  expect(tierFor("bench", 49.9, male)).toBe("Bronze I");
  expect(tierFor("bench", 50, male)).toBe("Silver V");
  expect(tierFor("bench", 25, { ...male, kg: 50 })).toBe("Silver V");
  expect(tierFor("deadlift", 50, male)).toBe("Bronze III");
});
