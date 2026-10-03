declare module "color-namer" {
  export interface ColorName {
    name: string;
    hex: string;
    distance: number;
  }
  export type ColorList =
    "roygbiv" | "basic" | "html" | "x11" | "pantone" | "ntc";
  export default function namer(
    color: string,
    options?: { pick?: ColorList[]; omit?: ColorList[] },
  ): Record<ColorList, ColorName[]>;
}
