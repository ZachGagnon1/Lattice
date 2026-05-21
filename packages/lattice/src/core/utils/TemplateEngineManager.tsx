import React from "react";

// TemplateEngineManager is kept as a no-op stub for API compatibility.
// Advanced blocks (which used this) have been removed in favor of the
// first-class Condition and ForLoop blocks.

export class TemplateEngineManager {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static setTag(_option: any) {}

  public static generateTagTemplate(_name: string) {
    return (_option: any, content: React.ReactNode) => content;
  }
}
