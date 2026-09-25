import { cloneDeep } from "lodash";
import React, { useEffect, useRef } from "react";
import TableColumnTool from "./tableTool";
import {
  BasicType,
  DATA_RENDER_COUNT,
  getIframeDocument,
  useBlock,
  useFocusIdx,
} from "@";

export function TableOperation() {
  const iframeDocument = getIframeDocument();
  const element = iframeDocument?.querySelector(`[${DATA_RENDER_COUNT}]`);
  const { focusIdx } = useFocusIdx();
  const { focusBlock, change } = useBlock();
  const tool = useRef<TableColumnTool | null>(null);

  // Create the four border-highlight divs imperatively so they're available
  // immediately when the effect runs — no React ref timing issues.
  useEffect(() => {
    if (!element) return;
    const iframeDoc = getIframeDocument();
    if (!iframeDoc) return;

    const container = iframeDoc.createElement("div");
    container.style.cssText =
      "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;display:none;";

    const top = iframeDoc.createElement("div");
    const bottom = iframeDoc.createElement("div");
    const left = iframeDoc.createElement("div");
    const right = iframeDoc.createElement("div");
    [top, bottom, left, right].forEach((el) => {
      el.style.pointerEvents = "none";
      container.appendChild(el);
    });
    iframeDoc.body.appendChild(container);

    tool.current = new TableColumnTool({ top, bottom, left, right }, element);

    return () => {
      tool.current?.destroy();
      tool.current = null;
      container.remove();
    };
  }, [element]);

  // Keep tableData and changeTableData in sync with the focused block.
  useEffect(() => {
    if (!tool.current) return;
    tool.current.changeTableData = (data: any[][]) => {
      change(`${focusIdx}.data.value.tableSource`, cloneDeep(data));
    };
    tool.current.tableData = cloneDeep(
      focusBlock?.data?.value?.tableSource || [],
    );
    // Disable selection visuals when we leave a table block.
    if (focusBlock?.type !== BasicType.TABLE) {
      tool.current.visibleBorder(false);
    }
  }, [focusIdx, focusBlock, change]);

  return null;
}
