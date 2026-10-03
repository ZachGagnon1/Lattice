export const EDITOR_SELECTED_COLOR = "#005fcc";
export const EDITOR_HOVER_COLOR = "#0064ad";

function channelToLinear(channel: number) {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
}

export function getContrastRatio(first: string, second: string) {
  const luminance = (color: string) => {
    const channels = color
      .replace("#", "")
      .match(/.{2}/g)!
      .map((value) => channelToLinear(Number.parseInt(value, 16)));
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const firstValue = luminance(first);
  const secondValue = luminance(second);
  return (
    (Math.max(firstValue, secondValue) + 0.05) /
    (Math.min(firstValue, secondValue) + 0.05)
  );
}
