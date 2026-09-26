import { Tooltip } from "@mui/material";
import { classnames } from "@/shared/utils/panel/classnames";

export const ToolItem: React.FC<{
  title?: string;
  icon: React.ReactNode;
  onClick?: React.MouseEventHandler<any>;
  trigger?: string;
  style?: React.CSSProperties;
  isActive?: boolean;
}> = (props) => {
  if (!props.title) {
    return (
      <button
        tabIndex={-1}
        className="easy-email-extensions-emailToolItem"
        title={props.title}
        onClick={props.onClick}
        style={props.style}
      >
        {props.icon}
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
        tabIndex={-1}
        className={classnames(
          "easy-email-extensions-emailToolItem",
          props.isActive && "easy-email-extensions-emailToolItem-active",
        )}
        onClick={props.onClick}
        style={props.style}
      >
        {props.icon}
      </button>
    </Tooltip>
  );
};
