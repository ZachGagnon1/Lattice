export interface EditorRegionLabels {
  navigation: string;
  blocks: string;
  layers: string;
  canvas: string;
  configuration: string;
}

export function getEditorRegionLabels(
  labels: Partial<EditorRegionLabels> = {},
): EditorRegionLabels {
  return {
    navigation: labels.navigation ?? t("Editor region navigation"),
    blocks: labels.blocks ?? t("Blocks"),
    layers: labels.layers ?? t("Layers"),
    canvas: labels.canvas ?? t("Email canvas"),
    configuration: labels.configuration ?? t("Configuration"),
  };
}

export const SHOW_BLOCK_LAYER_EVENT = "lattice:show-block-layer";

/** The palette is drag-only, so the keyboard path to the blocks goes through the Layer tree. */
export function requestBlockLayer(target: Document = document) {
  target.dispatchEvent(new CustomEvent(SHOW_BLOCK_LAYER_EVENT));
}
