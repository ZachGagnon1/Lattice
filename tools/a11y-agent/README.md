# a11y-agent

A local model tests the editor with the keyboard only, the way a blind screen reader user does. It is an experiment, not a CI check.

## How it works

1. Playwright opens the demo in headless Chrome.
2. After each key press, the script reads what a screen reader reports: the role and name of the focused control from the accessibility tree, its region, dialog or menu, its description and shortcut, and new live announcements.
3. The model gets only that text and a goal, for example "Add a Button block to the email". It answers with one key press at a time. Besides the keys, it has `NextLandmark` and `PreviousLandmark`, the region jumps of a screen reader (for example D in NVDA).
4. Code checks the goal after each key press. The score never depends on what the model claims.
5. axe-core runs in real Chromium, so it also checks color contrast, which the jsdom tests cannot.

## Score

Each run scores 60 points when the goal is reached, 20 for the share of focus stops with a name, and 20 for the share of focus stops with a visible focus indicator. The report also lists loops (12 key presses on 4 stops or fewer: a focus trap, or a lost user), wasted key presses (no focus move and no announcement), and the model's short review.

A small model makes mistakes, so run each task several times and read the median. The metrics come from code; the review only explains them.

## Run it

Start the demo first (`pnpm run dev`), and keep the Ollama host running.

```bash
cd tools/a11y-agent
OLLAMA_HOST=http://ai-brain.home:11434 pnpm start
pnpm start --task add-button --runs 5 --headed
```

| Option        | Default                                            |
| ------------- | -------------------------------------------------- |
| `--url`       | `$A11Y_AGENT_URL` or `http://localhost:5173/`      |
| `--host`      | `$OLLAMA_HOST` or `http://localhost:11434`         |
| `--model`     | `nimble:latest`                                    |
| `--runs`      | `3` for each task                                  |
| `--task`      | all: `add-button`, `text-settings`, `color-picker` |
| `--max-steps` | `40` key presses for each run                      |
| `--headed`    | off: show the browser                              |
| `--no-review` | off: skip the model review                         |

The script uses the installed Chrome. Set `A11Y_AGENT_BROWSER_PATH` to use another Chromium build. Reports go to `reports/`, which git ignores.

## Limits

- The visible-focus check reads computed styles (outline, box-shadow) and the MUI focus classes on the element or a wrapper. A focus style that only changes a background color counts as invisible.
- The model is text-only. It cannot judge visual design, and it does not replace a test with a real screen reader. See `packages/lattice/docs/accessibility-checklist.md`.
