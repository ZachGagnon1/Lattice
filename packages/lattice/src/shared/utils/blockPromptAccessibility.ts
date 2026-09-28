export function shouldShowHoverPrompt(
  focusId: string,
  hoverId: string,
  isDragging: boolean,
) {
  return Boolean(hoverId) && (isDragging || focusId !== hoverId);
}

export function getBlockStateOutline(
  state: "hover" | "selected",
  color: string,
) {
  return `${state === "selected" ? 2 : 1}px ${state === "selected" ? "solid" : "dashed"} ${color}`;
}
