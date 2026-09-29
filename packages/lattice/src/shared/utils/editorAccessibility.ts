export function getEditorA11yProps(
  label: string,
  descriptionId: string,
  errorId?: string,
) {
  return {
    "aria-label": label,
    "aria-describedby": [descriptionId, errorId].filter(Boolean).join(" "),
    "aria-invalid": errorId ? (true as const) : undefined,
  };
}

export function getMjmlErrorReport(
  errors: Array<{ formattedMessage?: string }> | undefined,
): string {
  return (errors ?? [])
    .map((error) => error.formattedMessage?.trim())
    .filter(Boolean)
    .join("\n");
}
