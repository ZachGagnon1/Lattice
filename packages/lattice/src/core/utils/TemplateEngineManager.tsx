import React from "react";

// This stub does nothing. It stays so that old imports still compile.
// Condition and ForLoop replace the advanced blocks that used it.

export class TemplateEngineManager {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static setTag(_option: any) {}

  public static generateTagTemplate(_name: string) {
    return (_option: any, content: React.ReactNode) => content;
  }
}
