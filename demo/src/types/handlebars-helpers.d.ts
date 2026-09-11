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

  /**
   * Registers the helper groups on a Handlebars instance.
   *
   * @param groups - One group name, a list of group names, or the options.
   * @param options - The Handlebars instance to register the helpers on.
   * @returns The helper map of that Handlebars instance.
   */
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
