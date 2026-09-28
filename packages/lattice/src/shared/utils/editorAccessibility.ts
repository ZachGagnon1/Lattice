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

export const MJML_PREVIEW_FAILURE_MESSAGE =
  "The preview cannot update. Undo the last change or restore the affected block.";
