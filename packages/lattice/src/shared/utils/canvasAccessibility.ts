export function getCanvasElementKey(
  key: string | number,
  className?: string,
): string | number {
  return className?.includes("email-block") ? key + className : key;
}
