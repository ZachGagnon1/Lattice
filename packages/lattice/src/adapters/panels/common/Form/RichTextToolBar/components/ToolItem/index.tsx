import { Tooltip } from "@mui/material";
import { classnames } from "@/shared/utils/panel/classnames";
import React from "react";

export interface ToolItemProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "title"
> {
  title?: string;
  icon: React.ReactNode;
  trigger?: string;
  isActive?: boolean;
}

export const ToolItem = React.forwardRef<HTMLButtonElement, ToolItemProps>(
  function ToolItem(props, ref) {
    const { title, icon, trigger, isActive, className, ...buttonProps } = props;
    const pressedProps =
      isActive !== undefined && !buttonProps["aria-haspopup"]
        ? { "aria-pressed": isActive }
        : {};
    if (!props.title) {
      return (
        <button
          ref={ref}
          type="button"
          tabIndex={-1}
          className="easy-email-extensions-emailToolItem"
          {...pressedProps}
          {...buttonProps}
        >
          {icon}
        </button>
      );
    }

    return (
      <Tooltip
        placement="bottom"
        title={props.title}
        sx={{
          fontSize: 12,
          padding: "4px 8px",
        }}
        slotProps={{
          popper: {
            sx: { zIndex: 9999 },
          },
        }}
      >
        <button
          ref={ref}
          type="button"
          tabIndex={-1}
          aria-label={title}
          {...pressedProps}
          className={classnames(
            "easy-email-extensions-emailToolItem",
            isActive && "easy-email-extensions-emailToolItem-active",
            className,
          )}
          {...buttonProps}
        >
          {icon}
        </button>
      </Tooltip>
    );
  },
);
