import { mkdir, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import {
  launch,
  moveToLandmark,
  observeFocus,
  openEditor,
  readAnnouncements,
  runAxe,
} from "./browser.mjs";
import {
  decide,
  DIFFICULTY,
  KEY_OPTIONS,
  sampleChoice,
  seededRandom,
  unload,
} from "./decision.mjs";
import { clipAround, median, scoreRun } from "./score.mjs";
import { TASKS } from "./tasks.mjs";

const { values: options } = parseArgs({
  options: {
    url: {
      type: "string",
      default: process.env.A11Y_AGENT_URL ?? "http://localhost:5173/",
    },
    host: {
      type: "string",
      default: process.env.OLLAMA_HOST ?? "http://localhost:11434",
    },
    model: { type: "string", default: "nimble:latest" },
    runs: { type: "string", default: "3" },
    task: { type: "string", default: TASKS.map((task) => task.id).join(",") },
    "max-steps": { type: "string", default: "40" },
    vision: { type: "string", default: "auto" },
    // A new seed each session explores new paths; the report records it, so --seed repeats a session.
    seed: { type: "string", default: String(Date.now() % 1_000_000_000) },
    headed: { type: "boolean", default: false },
  },
});

// Only Clef and Clef Flash read images.
const seed = Number(options.seed);

const useVision =
  options.vision === "on" ||
  (options.vision === "auto" && options.model.startsWith("clef"));

const RECENT_STEPS = 15;

const ROLE = `You are a blind keyboard user with a screen reader, and you test an email editor web app. You cannot see the screen. You hear what the screen reader reports: the focused control with its role and name, where it is, its description and shortcut if it has them, and new announcements. Descriptions and shortcuts tell you how this app works. Reach the goal with as few key presses as you can.`;

function hear(focus, announced, moved) {
  return {
    focus: focus.spoken,
    inside: focus.context ?? [],
    description: focus.description || undefined,
    shortcut: focus.shortcut || undefined,
    focus_moved: moved,
    announced,
  };
}

async function chooseKey(task, steps, current, random) {
  const answers = await decide({
    host: options.host,
    model: options.model,
    state: {
      role: ROLE,
      goal: task.goal,
      now: current,
      recent_steps: steps
        .slice(-RECENT_STEPS)
        .map((step) => `${step.key} → ${step.focus.spoken}`),
      key_presses_so_far: steps.length,
    },
    questions: {
      next_key: {
        type: "choice",
        instructions:
          "Which key do you press next to reach the goal? Choose finish only when the goal is reached.",
        criteria: KEY_OPTIONS,
      },
    },
  });
  const answer = answers.next_key;
  return {
    key: sampleChoice(answer.probabilities, random),
    favorite: answer.choice,
    confidence: answer.confidence,
  };
}

/** Clef judges the screenshot, which also catches a focus style that is only a background color. */
async function judgeFocusVisible(page, focus) {
  if (focus.key === "body") return null;
  const clip = focus.box && clipAround(focus.box, page.viewportSize());
  const image = (
    await page.screenshot({
      type: "jpeg",
      quality: 70,
      ...(clip ? { clip } : {}),
    })
  ).toString("base64");
  const answers = await decide({
    host: options.host,
    model: options.model,
    images: [image],
    state: `A keyboard user moved the focus. The focused control is: ${focus.spoken}.`,
    questions: {
      visible: {
        type: "noul",
        instructions:
          "Does this screenshot show a clear focus indicator, such as an outline, a ring, or a highlight, on the focused control?",
      },
    },
  });
  return answers.visible.noul;
}

async function rateDifficulty(task, steps, reached) {
  const answers = await decide({
    host: options.host,
    model: options.model,
    state: {
      role: ROLE,
      goal: task.goal,
      goal_reached: reached,
      steps: steps
        .slice(-30)
        .map((step) => `${step.key} → ${step.focus.spoken}`),
    },
    questions: {
      difficulty: {
        type: "score",
        instructions: "How hard was this task for a screen reader user?",
        criteria: DIFFICULTY,
      },
    },
  });
  return Number(answers.difficulty.score.toFixed(2));
}

async function runTask(page, task, run) {
  await openEditor(page, options.url);
  const start = await task.start(page);
  const random = seededRandom(seed + run * 7919);
  const steps = [];
  let previous = await observeFocus(page);
  let heard = new Set(await readAnnouncements(page));
  let current = hear(previous, [], true);
  let reached = false;
  let modelFinished = false;

  while (steps.length < Number(options["max-steps"]) && !reached) {
    const { key, favorite, confidence } = await chooseKey(
      task,
      steps,
      current,
      random,
    );
    if (key === "finish") {
      modelFinished = true;
      break;
    }

    if (key === "NextLandmark" || key === "PreviousLandmark") {
      await moveToLandmark(page, key === "PreviousLandmark");
    } else {
      await page.keyboard.press(key === "Space" ? " " : key);
    }
    // Long enough for a popover or a menu transition to end.
    await page.waitForTimeout(500);

    const focus = await observeFocus(page);
    if (useVision) {
      const seen = await judgeFocusVisible(page, focus);
      if (seen !== null) {
        focus.visibleByCss = focus.visible;
        focus.visible = seen >= 0.5;
        focus.visibleProbability = Number(seen.toFixed(3));
      }
    }
    const all = await readAnnouncements(page);
    const announced = all.filter((text) => !heard.has(text));
    heard = new Set(all);
    const moved = focus.key !== previous.key;
    // A landmark jump moves a screen reader cursor, and the focus stays in that state until it moves.
    focus.viaLandmark =
      key.endsWith("Landmark") || (!moved && Boolean(previous.viaLandmark));
    steps.push({ key, favorite, confidence, focus, announced, moved });
    previous = focus;
    current = hear(focus, announced, moved);
    reached = await task.reached(page, start);

    console.log(
      `  [${task.id} #${run}] ${String(steps.length).padStart(2)} ${key.padEnd(16)} → ${focus.spoken}`,
    );
  }

  return {
    task: task.id,
    run,
    ...scoreRun({ reached, steps }),
    modelFinished,
    difficulty: await rateDifficulty(task, steps, reached),
    steps,
  };
}

function toMarkdown(report) {
  const lines = [
    `# Accessibility agent report`,
    ``,
    `${report.date} · model \`${report.model}\` · ${report.runsPerTask} runs for each task · ${report.url} · focus check: ${report.vision ? "screenshot" : "CSS"} · seed ${report.seed}`,
    ``,
    `**Overall score: ${report.overall} / 100**`,
    ``,
    `| Task | Median score | Goal reached | Median key presses | Wasted presses | Loops | Median difficulty (0–3) |`,
    `| --- | --- | --- | --- | --- | --- | --- |`,
  ];
  for (const summary of report.tasks) {
    lines.push(
      `| ${summary.task} | ${summary.medianScore} | ${summary.reached}/${summary.runs} | ${summary.medianKeyPresses} | ${summary.wastedPresses} | ${summary.loops} | ${summary.medianDifficulty} |`,
    );
  }
  lines.push("", "## Focus problems", "");
  const unnamed = [...new Set(report.runs.flatMap((run) => run.unnamedStops))];
  const invisible = [
    ...new Set(report.runs.flatMap((run) => run.invisibleStops)),
  ];
  lines.push(
    `- Stops with no name: ${unnamed.length ? unnamed.map((s) => `\`${s}\``).join(", ") : "none"}`,
  );
  lines.push(
    `- Stops with no visible focus: ${invisible.length ? invisible.map((s) => `\`${s}\``).join(", ") : "none"}`,
  );
  lines.push("", "## axe-core in Chromium (serious and critical)", "");
  for (const [where, violations] of Object.entries(report.axe)) {
    lines.push(
      `- ${where}: ${violations.length ? violations.map((v) => `${v.id} (${v.count})`).join(", ") : "none"}`,
    );
  }
  lines.push("", "## Paths", "");
  for (const run of report.runs) {
    lines.push(
      `### ${run.task} #${run.run} (${run.reached ? "reached" : "not reached"}, ${run.keyPresses} presses)`,
      "",
      run.steps
        .map((step) => `${step.key} → ${step.focus.spoken}`)
        .join("  \n") || "(no key presses)",
      "",
    );
  }
  return lines.join("\n");
}

async function main() {
  const tasks = TASKS.filter((task) =>
    options.task.split(",").includes(task.id),
  );
  const runsPerTask = Number(options.runs);
  const { browser, page } = await launch({
    url: options.url,
    headed: options.headed,
  });
  try {
    const axe = await runAxe(page);
    const runs = [];
    for (const task of tasks) {
      for (let run = 1; run <= runsPerTask; run++) {
        console.log(`${task.id}, run ${run} of ${runsPerTask}`);
        runs.push(await runTask(page, task, run));
      }
    }

    const summaries = tasks.map((task) => {
      const taskRuns = runs.filter((run) => run.task === task.id);
      return {
        task: task.id,
        runs: taskRuns.length,
        reached: taskRuns.filter((run) => run.reached).length,
        medianScore: median(taskRuns.map((run) => run.score)),
        medianKeyPresses: median(taskRuns.map((run) => run.keyPresses)),
        wastedPresses: taskRuns.reduce(
          (sum, run) => sum + run.wastedPresses,
          0,
        ),
        loops: taskRuns.filter((run) => run.loop).length,
        medianDifficulty: median(taskRuns.map((run) => run.difficulty)),
      };
    });
    const report = {
      date: new Date().toISOString(),
      url: options.url,
      model: options.model,
      vision: useVision,
      seed,
      runsPerTask,
      overall: Math.round(
        summaries.reduce((sum, s) => sum + s.medianScore, 0) /
          (summaries.length || 1),
      ),
      tasks: summaries,
      axe,
      runs,
    };

    const directory = new URL(
      `../reports/${report.date.replace(/[:.]/g, "-")}-${options.model.replace(/[^a-z0-9]/gi, "-")}/`,
      import.meta.url,
    );
    await mkdir(directory, { recursive: true });
    await writeFile(
      new URL("report.json", directory),
      JSON.stringify(report, null, 2),
    );
    await writeFile(new URL("report.md", directory), toMarkdown(report));
    console.log(`\nOverall score: ${report.overall} / 100`);
    console.log(`Report: ${new URL("report.md", directory).pathname}`);
  } finally {
    await browser.close();
    await unload(options.host, options.model);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
