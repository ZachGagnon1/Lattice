import Color from "color";
import { HTML_COLORS } from "./htmlColors";

// The html list joins the words, such as "darkslategray". A screen reader reads the split form better.
const WORDS = [
  "cornflower",
  "cornsilk",
  "aquamarine",
  "chartreuse",
  "burlywood",
  "chocolate",
  "gainsboro",
  "goldenrod",
  "turquoise",
  "blanched",
  "honeydew",
  "lavender",
  "midnight",
  "moccasin",
  "seashell",
  "antique",
  "chiffon",
  "crimson",
  "fuchsia",
  "magenta",
  "thistle",
  "almond",
  "bisque",
  "dodger",
  "floral",
  "flower",
  "forest",
  "indian",
  "indigo",
  "maroon",
  "medium",
  "navajo",
  "orange",
  "orchid",
  "papaya",
  "powder",
  "purple",
  "saddle",
  "salmon",
  "sienna",
  "silver",
  "spring",
  "tomato",
  "violet",
  "yellow",
  "alice",
  "azure",
  "beige",
  "black",
  "blush",
  "brick",
  "brown",
  "cadet",
  "coral",
  "cream",
  "ghost",
  "green",
  "ivory",
  "khaki",
  "lemon",
  "light",
  "linen",
  "misty",
  "olive",
  "peach",
  "royal",
  "sandy",
  "slate",
  "smoke",
  "steel",
  "wheat",
  "white",
  "aqua",
  "blue",
  "corn",
  "cyan",
  "dark",
  "deep",
  "drab",
  "fire",
  "gold",
  "gray",
  "grey",
  "lace",
  "lawn",
  "lime",
  "mint",
  "navy",
  "pale",
  "peru",
  "pink",
  "plum",
  "puff",
  "rose",
  "rosy",
  "silk",
  "snow",
  "teal",
  "whip",
  "dim",
  "hot",
  "old",
  "red",
  "sea",
  "sky",
  "tan",
];

const WORD_PATTERN = new RegExp(`(${WORDS.join("|")})`, "g");

// chroma-js 1.4.1 constants, the Lab math color-namer used. The `color` package rounds differently and changes a few names.
const XN = 0.95047;
const ZN = 1.08883;
const T0 = 0.137931034;
const T2 = 0.12841855;
const T3 = 0.008856452;

function channelToLinear(value: number) {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function xyzToLab(t: number) {
  return t > T3 ? Math.pow(t, 1 / 3) : t / T2 + T0;
}

function rgbToLab([red, green, blue]: number[]): [number, number, number] {
  const r = channelToLinear(red);
  const g = channelToLinear(green);
  const b = channelToLinear(blue);
  const x = xyzToLab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / XN);
  const y = xyzToLab(0.2126729 * r + 0.7151522 * g + 0.072175 * b);
  const z = xyzToLab((0.0193339 * r + 0.119192 * g + 0.9503041 * b) / ZN);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

const HTML_LABS = HTML_COLORS.map(
  ([name, hex]) => [name, rgbToLab(Color(hex).rgb().array())] as const,
);

/** Returns the name of the nearest HTML color, by Euclidean distance in Lab space. */
export function nearestHtmlColorName(hex: string): string {
  const [l, a, b] = rgbToLab(Color(hex).rgb().array());
  let nearest = "";
  let nearestDistance = Infinity;
  for (const [name, lab] of HTML_LABS) {
    const distance = (l - lab[0]) ** 2 + (a - lab[1]) ** 2 + (b - lab[2]) ** 2;
    // A strict compare keeps the first name on a tie, as color-namer's stable sort does.
    if (distance < nearestDistance) {
      nearest = name;
      nearestDistance = distance;
    }
  }
  return nearest;
}

/** Returns a readable name and the hex, such as `dark slate gray (#2F4F4F)`. */
export function describeColor(hex: string): string {
  if (!hex) return "";
  const name = nearestHtmlColorName(hex);
  const words = name.replace(WORD_PATTERN, " $1").trim().replace(/\s+/g, " ");
  return words ? `${words} (${hex.toUpperCase()})` : hex.toUpperCase();
}

/** Returns a hex color, or an empty string for a transparent or invalid value. */
export function toHexColor(value: string | null | undefined) {
  if (!value) return "";
  try {
    const color = Color(value);
    return color.alpha() === 0 ? "" : color.hex();
  } catch {
    return "";
  }
}
