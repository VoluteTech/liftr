import { expect, test } from "vitest";
import { exerciseIds } from "../lib/catalog";
import { generalElo, isRanked, maxSet, rank } from "./ranking";
test("general Elo averages ranked exercises equally and rounds to whole points", () => {
  expect(generalElo([1247, undefined, 1100, undefined])).toBe(1174);
  expect(generalElo([1247, undefined])).toBe(1247);
  expect(generalElo([undefined, undefined])).toBeNull();
});
test("only five exercises earn ratings", () => {
  expect(exerciseIds.filter(isRanked).sort()).toEqual([
    "bench",
    "deadlift",
    "dips",
    "pullUp",
    "squat",
  ]);
  for (const id of exerciseIds.filter((id) => !isRanked(id)))
    expect(rank([{ kg: 20, reps: 10 }], id)).toEqual([]);
});
test("max uses heaviest recorded set then highest reps at that load", () => {
  expect(
    maxSet([
      { kg: 30, reps: 12 },
      { kg: 35, reps: 4 },
      { kg: 35, reps: 6 },
    ]),
  ).toEqual({ kg: 35, reps: 6 });
  expect(maxSet([])).toBeUndefined();
  expect(
    maxSet([
      { kg: 0, reps: 20 },
      { kg: 0, reps: 12 },
    ])?.reps,
  ).toBe(20);
});
test("legacy pull ups stay unscored without shifting later set numbers", () => {
  expect(
    rank(
      [
        { kg: 0, reps: 18 },
        { kg: 80, reps: 4 },
      ],
      "pullUp",
    ),
  ).toMatchObject([{ set: 2, estimate: 90.7 }]);
});
test("first benchmark is a win against the 5 kg opponent", () => {
  expect(rank([{ kg: 5, reps: 1 }])[0]).toMatchObject({
    estimate: 5.2,
    rating: 1017,
    delta: 17,
    next: 10,
  });
});
test("repeat and light days are neutral; new benchmarks count once", () => {
  const results = rank([60, 60, 40, 65].map((kg) => ({ kg, reps: 5 })));
  expect(results[0].estimate).toBe(70);
  expect(results.slice(1, 3).map((x) => x.delta)).toEqual([0, 0]);
  expect(results[3].delta).toBeGreaterThan(0);
  expect(results[3].rating).toBe(rank([{ kg: 65, reps: 5 }])[0].rating);
});
test.each([
  [0, 5],
  [60, 1.5],
  [NaN, 1],
  [60, 13],
])("rejects invalid set %s × %s", (kg, reps) => expect(() => rank([{ kg, reps }])).toThrow());
