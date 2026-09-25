/**
 * Minimal types for `handlebars-helpers`.
 *
 * The package ships no declarations and no `@types` package exists for it.
 * The demo only calls the default export, so this declaration stays small.
 */
declare module "handlebars-helpers" {
  import type Handlebars from "handlebars";

  interface HelperOptions {
    handlebars?: typeof Handlebars;
    hbs?: typeof Handlebars;
  }

  /** @param options - The Handlebars instance to register on, despite its name. */
  function helpers(
    groups: string | string[] | HelperOptions,
    options?: HelperOptions,
  ): Record<string, unknown>;

  export = helpers;
}

declare module "handlebars-helpers/lib/comparison" {
  const comparisonHelpers: Record<string, (...args: any[]) => unknown>;
  export = comparisonHelpers;
}
