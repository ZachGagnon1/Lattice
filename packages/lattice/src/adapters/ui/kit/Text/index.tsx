import React from "react";
import { classnames } from "@/shared/utils/classnames";
import styles from "./Text.module.scss";

export type SpaceToken = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TextProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "style" | "color"
> {
  /** The element to render. Default is `span`. */
  as?: React.ElementType;
  /** xs 12px, sm 14px, md 16px, lg 20px. Default is `sm`. */
  size?: "xs" | "sm" | "md" | "lg";
  weight?: "regular" | "medium" | "bold";
  /** Default is `inherit`, like the parent color. */
  tone?: "default" | "muted" | "primary" | "inherit";
  /** A --lattice-space-* index. */
  mt?: SpaceToken;
  mb?: SpaceToken;
  /** Show the element as a block, for example a link on its own line. */
  block?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

/** Text in the type scale of the theme tokens. */
export function Text({
  as: Component = "span",
  size = "sm",
  weight = "regular",
  tone = "inherit",
  mt,
  mb,
  block,
  className,
  ...rest
}: TextProps) {
  return (
    <Component
      className={classnames(
        styles.text,
        styles[`size-${size}`],
        styles[`weight-${weight}`],
        styles[`tone-${tone}`],
        mt !== undefined && styles[`mt-${mt}`],
        mb !== undefined && styles[`mb-${mb}`],
        block && styles.block,
        className,
      )}
      {...rest}
    />
  );
}
