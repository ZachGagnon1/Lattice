import React from "react";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import IconButton from "@mui/material/IconButton";

export function Help(
  props: Omit<React.ComponentProps<typeof Tooltip>, "children"> &
    Partial<{ style: React.CSSProperties }> & {
      title: React.ReactNode;
    },
) {
  const { title, ...otherProps } = props;
  return (
    <Tooltip title={title} {...otherProps}>
      <IconButton
        size="small"
        aria-label={typeof title === "string" ? title : t("Help")}
      >
        <HelpOutlineOutlinedIcon fontSize="small" aria-hidden="true" />
      </IconButton>
    </Tooltip>
  );
}
