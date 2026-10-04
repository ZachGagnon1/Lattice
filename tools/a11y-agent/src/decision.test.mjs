import { test } from "node:test";
import assert from "node:assert/strict";
import { KEY_OPTIONS, sampleChoice, seededRandom } from "./decision.mjs";

test("a low random value picks the first option", () => {
  assert.equal(
    sampleChoice({ Tab: 0.5, Enter: 0.5 }, () => 0),
    "Tab",
  );
});

test("sharpening makes the favorite more likely", () => {
  const random = seededRandom(1);
  const picks = Array.from({ length: 1000 }, () =>
    sampleChoice({ Tab: 0.7, Enter: 0.3 }, random),
  );
  const share = picks.filter((key) => key === "Tab").length / picks.length;
  assert.ok(share > 0.8, `share ${share}`);
});

test("the same seed gives the same sequence", () => {
  const first = seededRandom(7);
  const second = seededRandom(7);
  assert.deepEqual([first(), first(), first()], [second(), second(), second()]);
});

test("the options fit the choice limit and name no app shortcut", () => {
  const keys = Object.keys(KEY_OPTIONS);
  assert.ok(keys.length >= 2 && keys.length <= 26);
  assert.ok(
    !Object.values(KEY_OPTIONS).some((text) =>
      /settings|toolbar shortcut/i.test(text),
    ),
  );
});
