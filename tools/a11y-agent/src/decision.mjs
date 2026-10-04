const TIMEOUT_MS = 180_000;

/** Generic descriptions only: a description must not reveal a shortcut that the app itself does not announce. */
export const KEY_OPTIONS = {
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

export async function decide({
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
  if (!response.ok)
    throw new Error(`systemone ${response.status}: ${await response.text()}`);
  return (await response.json()).answers;
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
