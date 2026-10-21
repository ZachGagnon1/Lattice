import { test } from "node:test";
import assert from "node:assert/strict";
import { clipAround, findLoop, median, scoreRun } from "./score.mjs";

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

test("the median of an even count is the mean of the two middle values", () => {
  assert.equal(median([99, 39]), 69);
  assert.equal(median([1, 2, 3]), 2);
  assert.equal(median([]), 0);
});

test("a landmark jump does not count toward the visible focus", () => {
  const steps = [
    step("Tab", "a"),
    {
      ...step("NextLandmark", "region"),
      focus: {
        key: "region",
        spoken: "region",
        named: true,
        visible: false,
        viaLandmark: true,
      },
    },
  ];
  assert.equal(scoreRun({ reached: true, steps }).visibleRatio, 1);
});

test("a key press that stays on a landmark does not count toward the visible focus", () => {
  const landmark = {
    key: "nav",
    spoken: "navigation",
    named: true,
    visible: false,
    viaLandmark: true,
  };
  const steps = [
    step("Tab", "a"),
    { ...step("NextLandmark", "nav"), focus: landmark },
    { ...step("ArrowDown", "nav"), moved: false, focus: landmark },
  ];
  const result = scoreRun({ reached: true, steps });
  assert.equal(result.visibleRatio, 1);
  assert.deepEqual(result.invisibleStops, []);
});

test("the crop pads the box and stays inside the viewport", () => {
  const viewport = { width: 1440, height: 900 };
  assert.deepEqual(
    clipAround({ x: 100, y: 100, width: 20, height: 20 }, viewport),
    {
      x: 60,
      y: 60,
      width: 100,
      height: 100,
    },
  );
  assert.equal(
    clipAround({ x: 0, y: 2000, width: 20, height: 20 }, viewport),
    null,
  );
});
