export type EditorRegion = "blocks" | "canvas" | "configuration";

export function showEditorRegion(
  isDesktop: boolean,
  activeRegion: EditorRegion,
  region: EditorRegion,
) {
  return isDesktop || activeRegion === region;
}
