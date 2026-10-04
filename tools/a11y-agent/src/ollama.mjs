const TIMEOUT_MS = 180_000;

export const KEYS = [
  "Tab",
  "Shift+Tab",
  "Enter",
  "Space",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "Alt+Enter",
  "Alt+F10",
  "Shift+F10",
  "NextLandmark",
  "PreviousLandmark",
];

export const TOOLS = [
  {
    type: "function",
    function: {
      name: "press_key",
      description: "Press one key or one key combination.",
      parameters: {
        type: "object",
        properties: {
          key: { type: "string", enum: KEYS },
          reason: { type: "string", description: "Why, in a few words." },
        },
        required: ["key", "reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "finish",
      description:
        "Stop. Call it when the goal is reached, or when you are sure that it cannot be reached.",
      parameters: {
        type: "object",
        properties: {
          done: {
            type: "boolean",
            description: "True when the goal is reached.",
          },
          summary: { type: "string" },
        },
        required: ["done", "summary"],
      },
    },
  },
];

/** Some models answer with the key as plain text instead of a tool call. The longest names go first, so "Shift+Tab" does not read as "Tab". */
export function parseKeyFromText(content) {
  const text = (content ?? "").trim();
  if (!text) return null;
  const byLength = [...KEYS].sort((a, b) => b.length - a.length);
  return (
    byLength.find((key) =>
      new RegExp(
        `(^|[^A-Za-z+])${key.replace("+", "\\+")}($|[^A-Za-z])`,
        "i",
      ).test(text),
    ) ?? null
  );
}

async function post(host, path, body) {
  const response = await fetch(`${host}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok)
    throw new Error(
      `Ollama ${path} ${response.status}: ${await response.text()}`,
    );
  return response.json();
}

/** Same as `ollama stop`. A hung model answers again after an unload. */
export async function unload(host, model) {
  await post(host, "/api/generate", { model, keep_alive: 0 }).catch(() => {});
}

export async function chat({ host, model, messages, tools }) {
  const body = {
    model,
    messages,
    tools,
    stream: false,
    think: false,
    options: { temperature: 0.2, num_ctx: 32_768 },
  };
  try {
    return (await post(host, "/api/chat", body)).message;
  } catch (error) {
    console.warn(`chat failed, unload and retry once: ${error.message}`);
    await unload(host, model);
    return (await post(host, "/api/chat", body)).message;
  }
}
