import { Tooltip } from "@mui/material";
import { classnames } from "@/shared/utils/panel/classnames";
import React from "react";

export interface ToolItemProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "title"
> {
  /** The accessible name and the tooltip text. */
  title: string;
  icon: React.ReactNode;
  /** Sets `aria-pressed`. Leave it out for a button that has no on and off state. */
  isActive?: boolean;
}

export const ToolItem = React.forwardRef<HTMLButtonElement, ToolItemProps>(
  function ToolItem(props, ref) {
    const { title, icon, isActive, className, ...buttonProps } = props;

    return (
      <Tooltip
        placement="bottom"
        title={title}
        slotProps={{ popper: { sx: { zIndex: 9999 } } }}
      >
        <button
          ref={ref}
          type="button"
          tabIndex={-1}
          aria-label={title}
          aria-pressed={buttonProps["aria-haspopup"] ? undefined : isActive}
          className={classnames(
            "easy-email-extensions-emailToolItem",
            isActive && "easy-email-extensions-emailToolItem-active",
            className,
          )}
          // A mouse click must keep the focus and the selection in the text.
          onMouseDown={(event) => event.preventDefault()}
          {...buttonProps}
        >
          <span aria-hidden="true" style={{ display: "contents" }}>
            {icon}
          </span>
        </button>
      </Tooltip>
    );
  },
);
