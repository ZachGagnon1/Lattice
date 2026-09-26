import React, { useCallback, useMemo } from "react";
import { EMAIL_BLOCK_CLASS_NAME } from "@";
import { ToolItem } from "../ToolItem";
import { useSelectionRange } from "@/adapters/panels/AttributePanel/hooks/useSelectionRange";
import FormatBoldIcon from "@mui/icons-material/FormatBold";

export interface BoldProps {
  currentRange: Range | null | undefined;
  onChange: () => void;
}

function getBoldNode(node: Node | null | undefined): Element | null {
  if (!node) {
    return null;
  }
  if ((node as Element).classList?.contains(EMAIL_BLOCK_CLASS_NAME)) {
    return null;
  }
  if ((node as Element).tagName?.toLocaleLowerCase() === "b") {
    return node as Element;
  }
  return getBoldNode(node.parentElement);
}

export function Bold(props: BoldProps) {
  const { onChange } = props;
  const { setRangeByElement } = useSelectionRange();
  const node = useMemo(() => {
    return getBoldNode(props.currentRange?.commonAncestorContainer);
  }, [props.currentRange]);

  const onClick = useCallback(() => {
    if (node) {
      setRangeByElement(node);
    }
    onChange();
  }, [node, onChange, setRangeByElement]);

  return (
    <ToolItem
      title={t("Bold")}
      isActive={Boolean(node)}
      icon={<FormatBoldIcon />}
      onClick={onClick}
    />
  );
}
