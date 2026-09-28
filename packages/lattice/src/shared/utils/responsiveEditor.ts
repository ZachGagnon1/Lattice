export type EditorRegion = "blocks" | "canvas" | "configuration";
export type NarrowEditorRegion = Exclude<EditorRegion, "blocks">;

export function showEditorRegion(
  isDesktop: boolean,
  activeRegion: EditorRegion,
  region: EditorRegion,
) {
  if (isDesktop) return true;
  if (region === "blocks") return false;
  return activeRegion === region;
}
