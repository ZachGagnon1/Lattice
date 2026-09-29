export function getImageControlLabels(label: string) {
  return {
    upload: `Upload ${label}`,
    preview: `Preview ${label}`,
    remove: `Remove ${label}`,
    mergeTag: `Select a merge tag for ${label}`,
    suggestion: `Select a suggested value for ${label}`,
  };
}

export function getColorControlLabel(label: string | undefined, value: string) {
  const name = label || "Color";
  const currentValue = value || "transparent";
  return `${name}: ${currentValue}`;
}
