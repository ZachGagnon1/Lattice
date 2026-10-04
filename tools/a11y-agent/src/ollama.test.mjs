import { test } from "node:test";
import assert from "node:assert/strict";
import { parseKeyFromText } from "./ollama.mjs";

test("reads a bare key", () => {
  assert.equal(parseKeyFromText("Tab"), "Tab");
});

test("reads the longer key first", () => {
  assert.equal(parseKeyFromText("Shift+Tab"), "Shift+Tab");
  assert.equal(parseKeyFromText("I press Alt+Enter now."), "Alt+Enter");
});

test("reads a key in a sentence, in any case", () => {
  assert.equal(parseKeyFromText("press enter to open it"), "Enter");
});

test("returns null when no key is named", () => {
  assert.equal(parseKeyFromText("I am not sure."), null);
  assert.equal(parseKeyFromText(""), null);
});

test("does not read a key inside a longer word", () => {
  assert.equal(parseKeyFromText("Tables are hard"), null);
});
