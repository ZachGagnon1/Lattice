// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  isBlockSettingsShortcut,
  getBlockSettingsShortcutLabel,
  requestBlockSettings,
  requestCanvasReturn,
  focusBlockSettings,
  focusBlockSettingsWhenReady,
  isCanvasReturnKey,
  OPEN_BLOCK_SETTINGS_EVENT,
  CLOSE_BLOCK_SETTINGS_EVENT,
} from "./blockSettingsNavigation";

describe("isBlockSettingsShortcut", () => {
  it("returns true for Alt+Enter", () => {
    expect(
      isBlockSettingsShortcut({
        key: "Enter",
        altKey: true,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      }),
    ).toBe(true);
  });

  it("returns false when ctrlKey is true", () => {
    expect(
      isBlockSettingsShortcut({
        key: "Enter",
        altKey: true,
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
      }),
    ).toBe(false);
  });

  it("returns false when altKey is false", () => {
    expect(
      isBlockSettingsShortcut({
        key: "Enter",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      }),
    ).toBe(false);
  });

  it("returns false for F10 with altKey true", () => {
    expect(
      isBlockSettingsShortcut({
        key: "F10",
        altKey: true,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      }),
    ).toBe(false);
  });
});

describe("getBlockSettingsShortcutLabel", () => {
  it("returns the Mac label", () => {
    expect(
      getBlockSettingsShortcutLabel(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      ),
    ).toBe("⌥Enter");
  });

  it("returns the Windows label", () => {
    expect(getBlockSettingsShortcutLabel("Mozilla/5.0 (Windows NT 10.0)")).toBe(
      "Alt+Enter",
    );
  });
});

describe("requestBlockSettings", () => {
  it("dispatches the open event", () => {
    const listener = vi.fn();
    document.addEventListener(OPEN_BLOCK_SETTINGS_EVENT, listener);
    requestBlockSettings(document);
    expect(listener).toHaveBeenCalledTimes(1);
    document.removeEventListener(OPEN_BLOCK_SETTINGS_EVENT, listener);
  });
});

describe("requestCanvasReturn", () => {
  it("dispatches the close event", () => {
    const listener = vi.fn();
    document.addEventListener(CLOSE_BLOCK_SETTINGS_EVENT, listener);
    requestCanvasReturn(document);
    expect(listener).toHaveBeenCalledTimes(1);
    document.removeEventListener(CLOSE_BLOCK_SETTINGS_EVENT, listener);
  });
});

describe("focusBlockSettings", () => {
  it("focuses the first field", () => {
    document.body.innerHTML =
      '<div data-block-settings><button>Open</button><input id="first" /></div>';
    expect(focusBlockSettings(document)).toBe(true);
    expect(document.activeElement?.id).toBe("first");
  });

  it("falls back to a button", () => {
    document.body.innerHTML =
      '<div data-block-settings><button id="only">Open</button></div>';
    expect(focusBlockSettings(document)).toBe(true);
    expect(document.activeElement?.id).toBe("only");
  });

  it("returns false when there is no settings element", () => {
    document.body.innerHTML = "<div><input /></div>";
    expect(focusBlockSettings(document)).toBe(false);
  });
});

describe("isCanvasReturnKey", () => {
  it("returns true for Escape", () => {
    expect(
      isCanvasReturnKey({
        key: "Escape",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        defaultPrevented: false,
      }),
    ).toBe(true);
  });

  it("returns false when defaultPrevented is true", () => {
    expect(
      isCanvasReturnKey({
        key: "Escape",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        defaultPrevented: true,
      }),
    ).toBe(false);
  });

  it("returns true for Alt+Enter", () => {
    expect(
      isCanvasReturnKey({
        key: "Enter",
        altKey: true,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        defaultPrevented: false,
      }),
    ).toBe(true);
  });

  it("returns false for key a", () => {
    expect(
      isCanvasReturnKey({
        key: "a",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        defaultPrevented: false,
      }),
    ).toBe(false);
  });
});

describe("focusBlockSettingsWhenReady", () => {
  it("focuses a field that appears after the request", () => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
    focusBlockSettingsWhenReady(document);
    document.body.innerHTML =
      '<div data-block-settings><input id="late" /></div>';
    vi.advanceTimersToNextFrame();
    expect(document.activeElement?.id).toBe("late");
    vi.useRealTimers();
  });

  it("stops after the given number of attempts", () => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
    focusBlockSettingsWhenReady(document, 2);
    vi.advanceTimersToNextFrame();
    vi.advanceTimersToNextFrame();
    document.body.innerHTML =
      '<div data-block-settings><input id="too-late" /></div>';
    vi.advanceTimersToNextFrame();
    expect(document.activeElement?.id).not.toBe("too-late");
    vi.useRealTimers();
  });
});
