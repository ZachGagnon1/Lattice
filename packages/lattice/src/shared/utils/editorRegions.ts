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

/** The canvas hint says how to get from the canvas region to the blocks. */
export const CANVAS_HINT_ID = "lattice-canvas-hint";

/** A visible hint for keyboard users. It shows only in keyboard mode, and screen readers read it in any mode. */
export const KEYBOARD_HINT_CLASS = "lattice-keyboard-hint";
