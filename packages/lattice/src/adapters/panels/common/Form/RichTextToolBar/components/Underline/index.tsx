import React, { useCallback, useMemo } from "react";
import { EMAIL_BLOCK_CLASS_NAME } from "@";
import { ToolItem } from "../ToolItem";
import { useSelectionRange } from "@/adapters/panels/AttributePanel/hooks/useSelectionRange";
import FormatUnderlinedOutlinedIcon from "@mui/icons-material/FormatUnderlinedOutlined";

export interface UnderlineProps {
  currentRange: Range | null | undefined;
  onChange: () => void;
}

function getUnderlineNode(node: Node | null | undefined): Element | null {
  if (!node) {
    return null;
  }
  if ((node as Element).classList?.contains(EMAIL_BLOCK_CLASS_NAME)) {
    return null;
  }
  if ((node as Element).tagName?.toLocaleLowerCase() === "u") {
    return node as Element;
  }
  return getUnderlineNode(node.parentNode);
}

export function Underline(props: UnderlineProps) {
  const { onChange } = props;
  const { setRangeByElement } = useSelectionRange();
  const node = useMemo(() => {
    return getUnderlineNode(props.currentRange?.commonAncestorContainer);
  }, [props.currentRange]);

  const onClick = useCallback(() => {
    if (node) {
      setRangeByElement(node);
    }
    onChange();
  }, [node, onChange, setRangeByElement]);

  return (
    <ToolItem
      title={t("Underline")}
      isActive={Boolean(node)}
      icon={<FormatUnderlinedOutlinedIcon />}
      onClick={onClick}
    />
  );
}
