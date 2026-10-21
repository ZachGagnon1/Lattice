import React, { createContext, useContext } from "react";
import "./tokens.scss";

export type ColorScheme = "light" | "dark" | "system";

const ColorSchemeContext = createContext<ColorScheme>("light");

/** The color scheme of the nearest ThemeRoot. A portaled popup reads it to keep the tokens. */
export const useColorScheme = () => useContext(ColorSchemeContext);

/** Props that put the token scope on an element, for a popup that renders outside the root. */
export const themeScopeProps = (colorScheme: ColorScheme) => ({
  className: "lattice-theme",
  "data-lattice-color-scheme": colorScheme,
});

export interface ThemeRootProps {
  colorScheme?: ColorScheme;
  children?: React.ReactNode;
}

/** The element that holds the --lattice-* tokens for the editor. */
export function ThemeRoot({ colorScheme = "light", children }: ThemeRootProps) {
  return (
    <ColorSchemeContext.Provider value={colorScheme}>
      <div {...themeScopeProps(colorScheme)}>{children}</div>
    </ColorSchemeContext.Provider>
  );
}
