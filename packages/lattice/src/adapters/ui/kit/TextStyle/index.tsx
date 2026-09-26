import React from "react";
import Typography, { TypographyProps } from "@mui/material/Typography";

export interface TextStyleProps {
  children?: React.ReactNode;
  variation?: "strong" | "subdued";
  size?: "largest" | "extraLarge" | "large" | "medium" | "small" | "smallest";
}

// Map your custom sizes to standard MUI Typography variants
const sizeVariantMap: Record<
  NonNullable<TextStyleProps["size"]>,
  TypographyProps["variant"]
> = {
  largest: "h4",
  extraLarge: "h5",
  large: "h6",
  medium: "body1",
  small: "body2",
  smallest: "caption",
};

export const TextStyle: React.FC<TextStyleProps> = (props) => {
  const { variation, size = "small", children } = props;

  return (
    <Typography
      component="span"
      variant={sizeVariantMap[size]}
      sx={{ fontWeight: variation === "strong" ? "bold" : undefined }}
      color={variation === "subdued" ? "text.secondary" : "inherit"}
    >
      {children}
    </Typography>
  );
};
