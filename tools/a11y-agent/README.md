# a11y-agent

A local decision model tests the editor with the keyboard only, the way a blind screen reader user does. It is an experiment, not a CI check.

## How it works

1. Playwright opens the demo in headless Chrome.
2. After each key press, the script reads what a screen reader reports: the role and name of the focused control from the accessibility tree, its region, dialog or menu, its description and shortcut, and new live announcements.
3. A [decision model](https://docs.ollama.com/capabilities/decision) such as Nimble or Clef gets that text, the goal, and the last 15 steps. It answers one `choice` question through `POST /v1/systemone`: which key to press next. The options are the keys, `NextLandmark` and `PreviousLandmark` (the region jumps of a screen reader), and `finish`. Their descriptions are generic, so they reveal no shortcut that the app does not announce itself.
4. The script samples the key from the returned probabilities, sharpened toward the favorite, with a seed for each run. A deterministic model can then still leave a loop, and the runs differ. Each session gets a new seed, so it explores new paths.
5. Code checks the goal after each key press. The score never depends on what the model claims.
6. axe-core runs in real Chromium, so it also checks color contrast, which the jsdom tests cannot.

With a Clef model, a second question judges a screenshot after each key press: does it show a clear focus indicator? The key choice itself stays blind.

## Score

Each run scores 60 points when the goal is reached, 20 for the share of focus stops with a name, and 20 for the share of focus stops with a visible focus indicator. The report also lists loops (12 key presses on 4 stops or fewer: a focus trap, or a lost user), wasted key presses (no focus move and no announcement), the model's difficulty score (0 easy to 3 impossible), and each path.

A model makes mistakes, so run each task several times and read the median.

## Run it

Start the demo first (`pnpm run dev`), and keep the Ollama host running. Load one model at a time: unload other models first.

```bash
cd tools/a11y-agent
OLLAMA_HOST=http://ai-brain.home:11434 pnpm start
pnpm start --model clef:latest --task add-button --runs 5
```

| Option        | Default                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `--url`       | `$A11Y_AGENT_URL` or `http://localhost:5173/`                                                   |
| `--host`      | `$OLLAMA_HOST` or `http://localhost:11434`                                                      |
| `--model`     | `nimble:latest`                                                                                 |
| `--runs`      | `3` for each task                                                                               |
| `--task`      | all ten; see `src/tasks.mjs`. A comma list picks some, for example `reach-canvas,open-settings` |
| `--max-steps` | `40` key presses for each run                                                                   |
| `--vision`    | `auto`: on for Clef models. `on` or `off` to force it                                           |
| `--seed`      | a new seed from the clock. The report records it; pass it again to repeat a session             |
| `--headed`    | off: show the browser                                                                           |

The script uses the installed Chrome. Set `A11Y_AGENT_BROWSER_PATH` to use another Chromium build. Reports go to `reports/`, which git ignores.

## Limits

- Without vision, the visible-focus check reads computed styles (outline, box-shadow) and the MUI focus classes on the element or a wrapper. A focus style that only changes a background color counts as invisible.
- The model does not replace a test with a real screen reader. See `packages/lattice/docs/accessibility-checklist.md`.
