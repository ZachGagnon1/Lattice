export interface EditorRegionLabels {
  navigation: string;
  blocks: string;
  canvas: string;
  configuration: string;
}

export function getEditorRegionLabels(
  labels: Partial<EditorRegionLabels> = {},
): EditorRegionLabels {
  return {
    navigation: labels.navigation ?? t("Editor region navigation"),
    blocks: labels.blocks ?? t("Blocks"),
    canvas: labels.canvas ?? t("Email canvas"),
    configuration: labels.configuration ?? t("Configuration"),
  };
}

/** The palette is drag-only, so this hint names the keyboard path to add a block. */
export const PALETTE_HINT_ID = "lattice-palette-hint";
