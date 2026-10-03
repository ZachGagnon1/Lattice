import Color from "color";
import namer from "color-namer";

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

/** Returns a readable name and the hex, such as `dark slate gray (#2F4F4F)`. */
export function describeColor(hex: string): string {
  if (!hex) return "";
  const name = namer(hex, { pick: ["html"] }).html[0]?.name ?? "";
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
