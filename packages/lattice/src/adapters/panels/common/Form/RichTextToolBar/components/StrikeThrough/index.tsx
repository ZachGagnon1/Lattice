import React, { useCallback, useMemo } from "react";
import { EMAIL_BLOCK_CLASS_NAME } from "@";
import { ToolItem } from "../ToolItem";
import { useSelectionRange } from "@/adapters/panels/AttributePanel/hooks/useSelectionRange";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";

export interface StrikeThroughProps {
  currentRange: Range | null | undefined;
  onChange: () => void;
}

function getStrikeThroughNode(node: Node | null | undefined): Element | null {
  if (!node) {
    return null;
  }
  if ((node as Element).classList?.contains(EMAIL_BLOCK_CLASS_NAME)) {
    return null;
  }
  if ((node as Element).tagName?.toLocaleLowerCase() === "strike") {
    return node as Element;
  }
  return getStrikeThroughNode(node.parentNode);
}

export function StrikeThrough(props: Readonly<StrikeThroughProps>) {
  const { onChange } = props;
  const { setRangeByElement } = useSelectionRange();
  const node = useMemo(() => {
    return getStrikeThroughNode(props.currentRange?.commonAncestorContainer);
  }, [props.currentRange]);

  const onClick = useCallback(() => {
    if (node) {
      setRangeByElement(node);
    }
    onChange();
  }, [node, onChange, setRangeByElement]);

  return (
    <ToolItem
      title={t("Strikethrough")}
      isActive={Boolean(node)}
      icon={<StrikethroughSIcon />}
      onClick={onClick}
    />
  );
}
