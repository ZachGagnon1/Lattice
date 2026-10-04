const TIMEOUT_MS = 180_000;

/** Generic descriptions only: a description must not reveal a shortcut that the app itself does not announce. */
const BASIC_KEY_OPTIONS = {
  Tab: "Move to the next control",
  "Shift+Tab": "Move to the previous control",
  Enter: "Activate the focused control",
  Space: "Activate or toggle the focused control",
  Escape: "Close a menu or a dialog, or leave the current part",
  ArrowUp: "Move up inside a menu, list, tree, or toolbar",
  ArrowDown: "Move down inside a menu, list, tree, or toolbar",
  ArrowLeft: "Move left inside a toolbar, tab list, or menu bar",
  ArrowRight: "Move right inside a toolbar, tab list, or menu bar",
  Home: "Move to the first item inside a list or toolbar",
  End: "Move to the last item inside a list or toolbar",
  "Alt+Enter": "Press Alt and Enter together",
  "Alt+F10": "Press Alt and F10 together",
  "Shift+F10": "Open the context menu of the focused control",
  NextLandmark: "Jump to the next region of the page",
  PreviousLandmark: "Jump to the previous region of the page",
  finish: "Stop: the goal is reached",
};

/** What each key does and when to use it. Still generic: no text names a shortcut that only this app uses. */
const RICH_KEY_OPTIONS = {
  Tab: "Move forward to the next control. Use it to explore the page one control at a time.",
  "Shift+Tab": "Move back to the previous control.",
  Enter:
    "Activate the focused control: press a button, follow a link, or choose a menu item.",
  Space: "Press the focused button, or toggle a checkbox or a switch.",
  Escape:
    "Close the open menu, popup, or dialog, or step out of the current part and return to where you came from.",
  ArrowUp:
    "Move to the previous item inside a menu, list, tree, or vertical toolbar. Tab leaves the group instead.",
  ArrowDown:
    "Move to the next item inside a menu, list, tree, or vertical toolbar. Tab leaves the group instead.",
  ArrowLeft:
    "Move to the previous item inside a toolbar, tab list, or menu bar. Tab leaves the group instead.",
  ArrowRight:
    "Move to the next item inside a toolbar, tab list, or menu bar. Tab leaves the group instead.",
  Home: "Jump to the first item inside the current menu, list, or toolbar.",
  End: "Jump to the last item inside the current menu, list, or toolbar.",
  "Alt+Enter":
    "Press Alt and Enter together. Use it when an announcement names this shortcut.",
  "Alt+F10":
    "Press Alt and F10 together. Use it when an announcement names this shortcut.",
  "Shift+F10": "Open the context menu of the focused control, if it has one.",
  NextLandmark:
    "Jump to the next region of the page, such as a navigation, a panel, or the main content. Fast for big moves.",
  PreviousLandmark:
    "Jump to the previous region of the page. Fast for big moves.",
  finish:
    "Stop. Choose it only when you heard proof that the goal is reached, such as an announcement or the focus on the result.",
};

export function keyOptions(style) {
  return style === "rich" ? RICH_KEY_OPTIONS : BASIC_KEY_OPTIONS;
}

export const DIFFICULTY = [
  "Easy: the path was clear",
  "Some confusion, but the path was found",
  "Hard: the user got lost often",
  "Impossible: the user could not find the way",
];

/** Sharpness above 1 keeps the favorite most likely, but a deterministic model can still leave a loop. */
export function sampleChoice(probabilities, random, sharpness = 2) {
  const weights = Object.entries(probabilities).map(([key, p]) => [
    key,
    p ** sharpness,
  ]);
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  let left = random() * total;
  for (const [key, weight] of weights) {
    left -= weight;
    if (left <= 0) return key;
  }
  return weights.at(-1)[0];
}

/** A seeded generator, so a run can be repeated. */
export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function requestDecision({
  host,
  model,
  state,
  questions,
  images,
  keepAlive,
}) {
  const response = await fetch(`${host}/v1/systemone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      state,
      questions,
      ...(images?.length ? { images } : {}),
      ...(keepAlive !== undefined ? { keep_alive: keepAlive } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    const error = new Error(
      `systemone ${response.status}: ${await response.text()}`,
    );
    error.status = response.status;
    throw error;
  }
  return (await response.json()).answers;
}

const RETRIES = 3;

/** A hung host times out, and it often answers again after a short wait. An HTTP error does not retry. */
export async function decide(params) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await requestDecision(params);
    } catch (error) {
      if (error.status || attempt >= RETRIES) throw error;
      console.warn(
        `decision request failed (${error.message}), retry ${attempt} of ${RETRIES - 1}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 15_000 * attempt));
    }
  }
}

/** A decision model has no generate route, so a last tiny question with keep_alive 0 unloads it. */
export async function unload(host, model) {
  await decide({
    host,
    model,
    state: "unload",
    keepAlive: 0,
    questions: { ok: { type: "noul", instructions: "Is this a test?" } },
  }).catch(() => {});
}
