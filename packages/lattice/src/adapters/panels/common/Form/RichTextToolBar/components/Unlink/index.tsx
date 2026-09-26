import React, { useCallback, useMemo } from "react";
import { EMAIL_BLOCK_CLASS_NAME } from "@";
import { ToolItem } from "../ToolItem";
import LinkOffIcon from "@mui/icons-material/LinkOff";

export interface UnlinkProps {
  currentRange: Range | null | undefined;
  onChange: () => void;
}

function getAnchorElement(node: Node | null): HTMLAnchorElement | null {
  if (!node) {
    return null;
  }
  if ((node as Element).classList?.contains(EMAIL_BLOCK_CLASS_NAME)) {
    return null;
  }
  if ((node as Element).tagName?.toLocaleLowerCase() === "a") {
    return node as HTMLAnchorElement;
  }
  return getAnchorElement(node.parentNode);
}

function getLinkNode(
  currentRange: Range | null | undefined,
): HTMLAnchorElement | null {
  let linkNode: HTMLAnchorElement | null = null;
  if (!currentRange) {
    return null;
  }
  linkNode = getAnchorElement(currentRange.commonAncestorContainer);
  return linkNode;
}

export function Unlink(props: Readonly<UnlinkProps>) {
  const { onChange } = props;
  const linkNode = useMemo(() => {
    return getLinkNode(props.currentRange);
  }, [props.currentRange]);

  const onUnlink = useCallback(() => {
    if (linkNode?.parentNode) {
      linkNode?.replaceWith(...linkNode.childNodes);
      onChange();
    }
  }, [linkNode, onChange]);

  return (
    <ToolItem title={t("Unlink")} icon={<LinkOffIcon />} onClick={onUnlink} />
  );
}
