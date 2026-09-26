import React from "react";

export const FullHeightOverlayScrollbars: React.FC<{
  children: React.ReactNode | React.ReactElement;
  height: string | number;
}> = (props) => {
  return (
    <div style={{ height: props.height, overflow: "auto" }}>
      {props.children}
    </div>
  );
};
