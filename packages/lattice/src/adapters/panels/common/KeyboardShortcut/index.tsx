import React from "react";

export interface KeyboardShortcutProps {
  children: React.ReactNode;
  title: string;
  /** Pick a color with at least 3:1 contrast against the toolbar background. */
  borderColor: string;
  className?: string;
  style?: React.CSSProperties;
}

/** The key badge that the editor toolbars show next to their title. */
export function KeyboardShortcut({
  children,
  title,
  borderColor,
  className,
  style,
}: KeyboardShortcutProps) {
  return (
    <kbd
      title={title}
      className={className}
      style={{
        marginLeft: 8,
        padding: "1px 5px",
        border: `1px solid ${borderColor}`,
        borderRadius: 3,
        fontSize: 11,
        ...style,
      }}
    >
      {children}
    </kbd>
  );
}
