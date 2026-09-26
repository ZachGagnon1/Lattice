import { IPage } from "@";
import { ReactNode } from "react";

export type {
  ArrayVariablePath,
  InferSchemaOutput,
  LoopItem,
  VariableAt,
  VariableDataOf,
  VariablePath,
} from "./variableData";

export interface IEmailTemplate {
  content: IPage;
  subject: string;
  subTitle: string;
}

declare global {
  function t(key: string): string;
  function t(key: string, placeholder: React.ReactNode): ReactNode;

  interface Window {
    // translation

    t: (key: string, placeholder?: React.ReactNode) => ReactNode;
  }
}
