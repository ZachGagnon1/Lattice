import { test } from "node:test";
import assert from "node:assert/strict";
import { findLoop, scoreRun } from "./score.mjs";

const step = (key, focusKey, extra = {}) => ({
  key,
  moved: true,
  announced: [],
  focus: {
    key: focusKey,
    spoken: focusKey,
    named: true,
    visible: true,
    ...extra,
  },
});

test("a reached goal with named and visible stops scores 100", () => {
  const result = scoreRun({
    reached: true,
    steps: [step("Tab", "a"), step("Enter", "b")],
  });
  assert.equal(result.score, 100);
});

test("an unreached goal keeps only the focus points", () => {
  const steps = [step("Tab", "a"), step("Tab", "b", { named: false })];
  const result = scoreRun({ reached: false, steps });
  assert.equal(result.score, 30);
  assert.deepEqual(result.unnamedStops, ["b"]);
});

test("Tab presses that cycle over three stops are a loop", () => {
  const steps = Array.from({ length: 12 }, (_, i) =>
    step("Tab", ["a", "b", "c"][i % 3]),
  );
  assert.equal(findLoop(steps).atStep, 12);
});

test("a cycle that mixes Tab and Enter over four stops is a loop", () => {
  const keys = ["Shift+Tab", "Shift+Tab", "Shift+Tab", "Enter"];
  const steps = Array.from({ length: 12 }, (_, i) =>
    step(keys[i % 4], ["a", "b", "c", "d"][i % 4]),
  );
  assert.equal(findLoop(steps).atStep, 12);
});

test("key presses over many stops are not a loop", () => {
  const steps = Array.from({ length: 12 }, (_, i) => step("Tab", `stop-${i}`));
  assert.equal(findLoop(steps), null);
});

test("a press that moves nothing and announces nothing is wasted", () => {
  const result = scoreRun({
    reached: true,
    steps: [{ ...step("Enter", "a"), moved: false }],
  });
  assert.equal(result.wastedPresses, 1);
});
