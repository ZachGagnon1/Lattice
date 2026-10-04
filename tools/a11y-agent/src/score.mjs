const LOOP_WINDOW = 12;
const LOOP_MAX_STOPS = 4;

/** Twelve key presses that keep landing on the same few stops: a focus trap, or a user who is lost. */
export function findLoop(steps) {
  for (let end = LOOP_WINDOW; end <= steps.length; end++) {
    const window = steps.slice(end - LOOP_WINDOW, end);
    const stops = new Set(window.map((step) => step.focus.key));
    if (stops.size <= LOOP_MAX_STOPS) {
      return {
        atStep: end,
        stops: [...new Set(window.map((s) => s.focus.spoken))],
      };
    }
  }
  return null;
}

/** 60 points for the goal, 20 for named focus stops, 20 for visible focus. */
export function scoreRun({ reached, steps }) {
  const stops = steps.filter((step) => step.focus.key !== "body");
  const ratio = (count) => (stops.length ? count / stops.length : 1);
  const named = ratio(stops.filter((step) => step.focus.named).length);
  // A landmark jump moves a screen reader cursor, which shows no focus ring in a real browser either.
  const focusStops = stops.filter((step) => !step.key.endsWith("Landmark"));
  const visible = focusStops.length
    ? focusStops.filter((step) => step.focus.visible).length / focusStops.length
    : 1;
  const wasted = steps.filter(
    (step) => !step.moved && step.announced.length === 0,
  ).length;
  return {
    score: Math.round((reached ? 60 : 0) + 20 * named + 20 * visible),
    reached,
    keyPresses: steps.length,
    namedRatio: Number(named.toFixed(2)),
    visibleRatio: Number(visible.toFixed(2)),
    wastedPresses: wasted,
    unnamedStops: [
      ...new Set(
        stops.filter((s) => !s.focus.named).map((s) => s.focus.spoken),
      ),
    ],
    invisibleStops: [
      ...new Set(
        focusStops.filter((s) => !s.focus.visible).map((s) => s.focus.spoken),
      ),
    ],
    loop: findLoop(steps),
  };
}

/** With an even count, the mean of the two middle values, so one good run does not set the result. */
export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[middle];
  return Math.round(((sorted[middle - 1] + sorted[middle]) / 2) * 100) / 100;
}

/** A crop around the focused control, so a small focus ring is readable for a vision model. */
export function clipAround(box, viewport, padding = 40) {
  const x = Math.max(0, box.x - padding);
  const y = Math.max(0, box.y - padding);
  const width = Math.min(viewport.width - x, box.width + 2 * padding);
  const height = Math.min(viewport.height - y, box.height + 2 * padding);
  return width > 0 && height > 0 ? { x, y, width, height } : null;
}
