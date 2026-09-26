import { classnames } from "@/adapters/panels/AttributePanel/utils/classnames";
import { getNodeIdxClassName, getNodeTypeClassName } from "@";

export function getPreviewClassName(idx: string | null, type: string) {
  return classnames(
    "email-block",
    idx && getNodeIdxClassName(idx),
    getNodeTypeClassName(type),
  );
}
