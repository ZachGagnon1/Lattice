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
import { chat, parseKeyFromText, TOOLS, unload } from "./ollama.mjs";
import { scoreRun } from "./score.mjs";
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
    headed: { type: "boolean", default: false },
    "no-review": { type: "boolean", default: false },
  },
});

const SYSTEM_PROMPT = `You test an email editor web app as a blind keyboard user with a screen reader. You cannot see the screen.
After each key press you hear what the screen reader reports: the focused control with its role and name, where it is, its description and shortcut if it has them, and new announcements.
Reach the goal with as few key presses as you can. Call press_key with exactly one key in each turn.
Tab and Shift+Tab move between controls. Enter or Space activates a control. Arrow keys move inside menus, toolbars, trees, and lists. Escape closes a menu or a dialog.
NextLandmark and PreviousLandmark jump between the regions of the page, like the landmark keys of a screen reader.
Listen to descriptions and shortcuts: they tell you how this app works.
Call finish when the goal is reached, or when you are sure that it cannot be reached.`;

function describe(focus, announced, moved) {
  const lines = [`Focus: ${focus.spoken}`];
  if (focus.context?.length) lines.push(`Inside: ${focus.context.join(", ")}`);
  if (focus.description) lines.push(`Description: ${focus.description}`);
  if (focus.shortcut) lines.push(`Shortcut: ${focus.shortcut}`);
  if (!moved) lines.push("The focus did not move.");
  if (announced.length)
    lines.push(`Announced: ${announced.map((text) => `"${text}"`).join(", ")}`);
  return lines.join("\n");
}

async function runTask(page, task, run) {
  await openEditor(page, options.url);
  const start = await task.start(page);
  const steps = [];
  let previous = await observeFocus(page);
  let heard = new Set(await readAnnouncements(page));
  let reached = false;
  let finish = null;
  let silentTurns = 0;
  const ignoredReplies = [];

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Goal: ${task.goal}\nThe editor has loaded.\n${describe(previous, [], true)}`,
    },
  ];

  for (
    let turn = 0;
    turn < Number(options["max-steps"]) && !reached && !finish;
    turn++
  ) {
    const reply = await chat({
      host: options.host,
      model: options.model,
      messages,
      tools: TOOLS,
    });
    messages.push(reply);
    const toolCalled = Boolean(reply.tool_calls?.length);
    const textKey = toolCalled ? null : parseKeyFromText(reply.content);
    const call =
      reply.tool_calls?.[0]?.function ??
      (textKey && {
        name: "press_key",
        arguments: { key: textKey, reason: "" },
      });

    if (!call) {
      ignoredReplies.push(reply.content ?? "");
      // A turn with no tool call is lost, and three in a row end the run.
      if (++silentTurns >= 3) break;
      messages.push({
        role: "user",
        content: "Answer with exactly one tool call: press_key or finish.",
      });
      continue;
    }
    silentTurns = 0;

    if (call.name === "finish") {
      finish = call.arguments;
      break;
    }

    const key = call.arguments?.key;
    if (key === "NextLandmark" || key === "PreviousLandmark") {
      await moveToLandmark(page, key === "PreviousLandmark");
    } else {
      await page.keyboard.press(key === "Space" ? " " : key);
    }
    await page.waitForTimeout(250);

    const focus = await observeFocus(page);
    const all = await readAnnouncements(page);
    const announced = all.filter((text) => !heard.has(text));
    heard = new Set(all);
    const moved = focus.key !== previous.key;
    steps.push({
      key,
      reason: call.arguments?.reason ?? "",
      focus,
      announced,
      moved,
    });
    previous = focus;
    reached = await task.reached(page, start);

    console.log(
      `  [${task.id} #${run}] ${String(steps.length).padStart(2)} ${key.padEnd(10)} → ${focus.spoken}`,
    );
    messages.push({
      role: toolCalled ? "tool" : "user",
      content: describe(focus, announced, moved),
    });
  }

  let review = "";
  if (!options["no-review"]) {
    messages.push({
      role: "user",
      content: `The run is over. The goal was ${reached ? "reached" : "not reached"}. In at most three short bullet points, say what made this task hard or easy for a screen reader user. Do not call a tool.`,
    });
    review =
      (
        await chat({
          host: options.host,
          model: options.model,
          messages,
          tools: [],
        })
      ).content?.trim() ?? "";
  }

  return {
    task: task.id,
    run,
    ...scoreRun({ reached, steps }),
    modelFinish: finish,
    ignoredReplies,
    review,
    steps,
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
}

function toMarkdown(report) {
  const lines = [
    `# Accessibility agent report`,
    ``,
    `${report.date} · model \`${report.model}\` · ${report.runsPerTask} runs for each task · ${report.url}`,
    ``,
    `**Overall score: ${report.overall} / 100**`,
    ``,
    `| Task | Median score | Goal reached | Median key presses | Wasted presses | Loops |`,
    `| --- | --- | --- | --- | --- | --- |`,
  ];
  for (const summary of report.tasks) {
    lines.push(
      `| ${summary.task} | ${summary.medianScore} | ${summary.reached}/${summary.runs} | ${summary.medianKeyPresses} | ${summary.wastedPresses} | ${summary.loops} |`,
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
  lines.push("", "## Model reviews", "");
  for (const run of report.runs) {
    if (run.review)
      lines.push(
        `### ${run.task} #${run.run} (${run.reached ? "reached" : "not reached"})`,
        "",
        run.review,
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
      };
    });
    const report = {
      date: new Date().toISOString(),
      url: options.url,
      model: options.model,
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
      `../reports/${report.date.replace(/[:.]/g, "-")}/`,
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
