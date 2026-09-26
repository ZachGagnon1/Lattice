import React, { useCallback, useMemo } from "react";
import { EMAIL_BLOCK_CLASS_NAME } from "@";
import { ToolItem } from "../ToolItem";
import { useSelectionRange } from "@/adapters/panels/AttributePanel/hooks/useSelectionRange";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";

export interface ItalicProps {
  currentRange: Range | null | undefined;
  onChange: () => void;
}

function getItalicNode(node: Node | null | undefined): Element | null {
  if (!node) {
    return null;
  }
  if ((node as Element).classList?.contains(EMAIL_BLOCK_CLASS_NAME)) {
    return null;
  }
  if ((node as Element).tagName?.toLocaleLowerCase() === "i") {
    return node as Element;
  }
  return getItalicNode(node.parentNode);
}

export function Italic(props: ItalicProps) {
  const { onChange } = props;
  const { setRangeByElement } = useSelectionRange();
  const node = useMemo(() => {
    return getItalicNode(props.currentRange?.commonAncestorContainer);
  }, [props.currentRange]);

  const onClick = useCallback(() => {
    if (node) {
      setRangeByElement(node);
    }
    onChange();
  }, [node, onChange, setRangeByElement]);

  return (
    <ToolItem
      title={t("Italic")}
      isActive={Boolean(node)}
      icon={<FormatItalicIcon />}
      onClick={onClick}
    />
  );
}
