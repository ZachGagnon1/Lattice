import React, { useContext } from "react";
import { EMPTY_FORMAT_STATE, FormatState } from "./formatState";

export type ExecCommand = (command: string, value?: unknown) => void;

export interface ToolbarContextValue {
  execCommand: ExecCommand;
  format: FormatState;
  /** The text range that the next command applies to. */
  savedRange: Range | null;
  returnToText: () => void;
}

export const ToolbarContext = React.createContext<ToolbarContextValue>({
  execCommand: () => {},
  format: EMPTY_FORMAT_STATE,
  savedRange: null,
  returnToText: () => {},
});

export function useToolbar() {
  return useContext(ToolbarContext);
}
