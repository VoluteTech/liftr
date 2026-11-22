import { expect, test } from "vitest";
import { dashboardIds, exerciseIds, searchAvailable } from "./catalog";
test("starter dashboard contains the three compounds; additions are unique", () => {
  expect(dashboardIds([])).toEqual(["bench", "squat", "deadlift"]);
  expect(dashboardIds(["dips", "dips"])).toEqual(["bench", "squat", "deadlift", "dips"]);
});
test("offline search matches names and aliases but excludes current tiles", () => {
  const defaults = dashboardIds([]);
  expect(searchAvailable("  PARALLEL bar ", defaults)).toEqual(["dips"]);
  expect(searchAvailable("dip", defaults)).toEqual(["dips"]);
  expect(searchAvailable("", exerciseIds)).toEqual([]);
  expect(searchAvailable("curl", defaults)).toEqual(
    expect.arrayContaining(["barbellCurl", "preacherCurl", "legCurl"]),
  );
  for (const term of ["push ups", "pushups", "push-ups"])
    expect(searchAvailable(term, defaults)).toContain("pushUp");
  expect(searchAvailable("triceps extensions", defaults)).toContain("tricepsExtension");
  expect(searchAvailable("leg extensions", defaults)).toContain("legExtension");
  expect(searchAvailable(" OhP ", defaults)).toEqual(["overheadPress"]);
  expect(searchAvailable("rdl", defaults)).toEqual(["romanianDeadlift"]);
  expect(searchAvailable("unknown", defaults)).toEqual([]);
});
