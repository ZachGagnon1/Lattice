import { exportToHtml } from "@/shared/utils/export";
import type { IEmailTemplate } from "@/shared/typings";

/** The helpers that the compiler emits. `OPERATOR_HELPER_NAMES` lists the operator for each one. */
export const LOGIC_HELPERS = {
  eq: (a: unknown, b: unknown) => a === b,
  // Handlebars passes strings or numbers. JavaScript compares both.
  gt: (a: unknown, b: unknown) => (a as number) > (b as number),
  lt: (a: unknown, b: unknown) => (a as number) < (b as number),
  not: (v: unknown) => !v,
  contains: (haystack: unknown, needle: unknown) => {
    if (Array.isArray(haystack)) {
      return haystack.includes(needle);
    }
    if (typeof haystack === "string") {
      return haystack.includes(needle as string);
    }
    return false;
  },
  // Handlebars appends an options object as the last argument.
  and: (...args: unknown[]) => args.slice(0, -1).every(Boolean),
  or: (...args: unknown[]) => args.slice(0, -1).some(Boolean),
};

type HandlebarsEnv = ReturnType<(typeof import("handlebars"))["create"]>;

let envPromise: Promise<HandlebarsEnv> | undefined;

// handlebars is an optional peer, so a static import would break a consumer without it.
async function createEnv(): Promise<HandlebarsEnv> {
  let mod: typeof import("handlebars");
  try {
    mod = await import("handlebars");
  } catch (error: unknown) {
    throw new Error(
      "lattice-editor/handlebars needs the handlebars package. Install it with: npm install handlebars",
      { cause: error },
    );
  }

  // handlebars is CommonJS, so a bundler can put the API on `default` or on the module.
  const handlebars = (mod as { default?: typeof mod }).default ?? mod;
  // An isolated environment keeps the helpers out of the consumer's global Handlebars.
  const env = handlebars.create();
  env.registerHelper(LOGIC_HELPERS);
  return env;
}

async function loadEnv(): Promise<HandlebarsEnv> {
  // A failed load clears the cache, so a later call can retry.
  envPromise ??= createEnv().catch((error: unknown) => {
    envPromise = undefined;
    throw error;
  });
  return envPromise;
}

/** Evaluates the Handlebars in an MJML string against `data`. */
export async function renderMjml(
  mjml: string,
  data: Record<string, unknown>,
): Promise<string> {
  const env = await loadEnv();
  return env.compile(mjml)(data);
}

/** Renders a template to HTML, with its Condition and For Loop blocks evaluated against `data`. */
export async function renderToHtml(
  template: IEmailTemplate,
  data: Record<string, unknown>,
): Promise<string> {
  return exportToHtml(template, {
    transformMjml: (mjml) => renderMjml(mjml, data),
  });
}
