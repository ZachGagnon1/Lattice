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
  const visible = ratio(stops.filter((step) => step.focus.visible).length);
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
        stops.filter((s) => !s.focus.visible).map((s) => s.focus.spoken),
      ),
    ],
    loop: findLoop(steps),
  };
}
