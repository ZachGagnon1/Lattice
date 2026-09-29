import { ConditionIssue } from "@/domain/compile/handlebars";

export type RuleControl = "field" | "operator" | "value" | "group";

export function getRulePath(fieldName: string): string {
  return fieldName
    .replace(/^rulesTree\.?/, "")
    .replaceAll("[", ".")
    .replaceAll("]", "")
    .replace(/^\./, "");
}

export function getRuleLabel(fieldName: string): string {
  const positions = getRulePath(fieldName)
    .split(".")
    .filter((part) => /^\d+$/.test(part))
    .map((part) => Number(part) + 1);

  return positions.length ? `Rule ${positions.join(".")}` : "Rule group";
}

export function getRuleControlId(
  fieldName: string,
  control: RuleControl,
): string {
  const path = getRulePath(fieldName).replaceAll(".", "-") || "root";
  return `condition-${path}-${control}`;
}

export function getIssueControl(issue: ConditionIssue): RuleControl {
  if (issue.code === "MISSING_FIELD") return "field";
  if (issue.code === "MISSING_VALUE") return "value";
  if (issue.code === "EMPTY_GROUP") return "group";
  return "operator";
}

export function getIssueControlId(issue: ConditionIssue): string {
  return getRuleControlId(`rulesTree.${issue.path}`, getIssueControl(issue));
}
