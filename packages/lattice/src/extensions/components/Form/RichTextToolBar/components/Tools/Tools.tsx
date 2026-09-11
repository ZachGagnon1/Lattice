import React, { useCallback } from "react";
import { ToolItem } from "../ToolItem";
import { getLinkNode, Link, LinkParams } from "../Link";
import {
  AvailableTools,
  getIframeDocument,
  MergeTagBadge,
  useEditorProps,
  useFocusBlockLayout,
} from "@";
import { FontFamily } from "../FontFamily";
import { MergeTags } from "../MergeTags";
import { useSelectionRange } from "@/extensions/AttributePanel/hooks/useSelectionRange";
import { IconBgColor } from "./IconBgColor";
import { IconFontColor } from "./IconFontColor";
import { BasicTools } from "../BasicTools";
import { Unlink } from "../Unlink";
import { StrikeThrough } from "../StrikeThrough";
import { Underline } from "../Underline";
import { Italic } from "../Italic";
import { Bold } from "../Bold";
import { FontSize } from "../FontSize";
import { RICH_TEXT_TOOL_BAR } from "@/extensions/constants";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";

export interface ToolsProps {
  onChange: (content: string) => any;
}

export function Tools(props: ToolsProps) {
  const { variableData, enabledMergeTagsBadge, toolbar } = useEditorProps();
  const { focusBlockNode } = useFocusBlockLayout();
  const { selectionRange, restoreRange, setRangeByElement } =
    useSelectionRange();

  const execCommand = useCallback(
    (cmd: string, val?: any) => {
      const iframeWindow = getIframeDocument()?.defaultView;
      const liveSelection = iframeWindow?.getSelection();

      const activeRange =
        liveSelection && liveSelection.rangeCount > 0
          ? liveSelection.getRangeAt(0)
          : selectionRange;

      if (!activeRange) {
        console.error("No selectionRange");
        return;
      }

      if (!focusBlockNode?.contains(activeRange.commonAncestorContainer)) {
        console.error("Not commonAncestorContainer");
        return;
      }

      restoreRange(activeRange); // Use the live range!
      const uuid = (+new Date()).toString();

      if (cmd === "createLink") {
        const linkData = val as LinkParams;
        const target = linkData.blank ? "_blank" : "";
        let link: HTMLAnchorElement;

        if (linkData.linkNode) {
          link = linkData.linkNode;
        } else {
          getIframeDocument()?.execCommand(cmd, false, uuid);
          link = getIframeDocument()?.body?.querySelector(`a[href="${uuid}"]`)!;
        }

        if (target) {
          link.setAttribute("target", target);
        }
        link.style.color = "inherit";
        link.style.textDecoration = linkData.underline ? "underline" : "none";
        link.setAttribute("href", linkData.link.trim());
      } else if (cmd === "insertHTML") {
        let newContent = val;
        if (enabledMergeTagsBadge) {
          newContent = MergeTagBadge.transform(val, uuid);
        }

        getIframeDocument()?.execCommand(cmd, false, newContent);
        const insertMergeTagEle = getIframeDocument()?.getElementById(uuid);
        if (insertMergeTagEle) {
          insertMergeTagEle.focus();
          setRangeByElement(insertMergeTagEle);
        }
      } else if (cmd === "foreColor") {
        getIframeDocument()?.execCommand(cmd, false, val);
        const linkNode: HTMLAnchorElement | null = getLinkNode(activeRange); // Use activeRange!
        if (linkNode) {
          linkNode.style.color = "inherit";
        }
      } else {
        getIframeDocument()?.execCommand(cmd, false, val);
      }

      const contenteditableElement = getIframeDocument()?.activeElement;
      if (contenteditableElement?.getAttribute("contenteditable") === "true") {
        const html = getIframeDocument()?.activeElement?.innerHTML || "";
        props.onChange(html);
      }
    },
    [
      enabledMergeTagsBadge,
      focusBlockNode,
      props,
      restoreRange,
      selectionRange,
      setRangeByElement,
    ],
  );

  const execCommandWithRange = useCallback(
    (cmd: string, val?: any) => {
      getIframeDocument()?.execCommand(cmd, false, val);
      const contenteditableElement = getIframeDocument()?.getSelection()
        ?.focusNode as HTMLElement | null;
      if (
        contenteditableElement?.getAttribute &&
        contenteditableElement?.getAttribute("contenteditable") === "true"
      ) {
        const html = contenteditableElement.innerHTML ?? "";
        props.onChange(html);
      }
    },
    [props.onChange],
  );

  const getPopoverMountNode = () =>
    getIframeDocument()?.getElementById(RICH_TEXT_TOOL_BAR)!;

  const enabledTools = toolbar?.tools ?? [
    AvailableTools.MergeTags,
    AvailableTools.FontFamily,
    AvailableTools.FontSize,
    AvailableTools.Bold,
    AvailableTools.Italic,
    AvailableTools.StrikeThrough,
    AvailableTools.Underline,
    AvailableTools.IconFontColor,
    AvailableTools.IconBgColor,
    AvailableTools.Link,
    AvailableTools.Justify,
    AvailableTools.Lists,
    AvailableTools.HorizontalRule,
    AvailableTools.RemoveFormat,
  ];

  const tools = enabledTools.flatMap((tool) => {
    switch (tool) {
      case AvailableTools.MergeTags:
        if (!variableData) {
          return [];
        }
        return [
          <MergeTags
            key={tool}
            execCommand={execCommand}
            selectionRange={selectionRange}
          />,
        ];
      case AvailableTools.FontFamily:
        return [
          <FontFamily
            key={tool}
            execCommand={execCommand}
            selectionRange={selectionRange}
          />,
        ];
      case AvailableTools.FontSize:
        return [
          <FontSize
            key={tool}
            execCommand={execCommand}
            selectionRange={selectionRange}
          />,
        ];
      case AvailableTools.Bold:
        return [
          <Bold
            key={tool}
            currentRange={selectionRange}
            onChange={() => execCommandWithRange("bold")}
          />,
        ];
      case AvailableTools.Italic:
        return [
          <Italic
            key={tool}
            currentRange={selectionRange}
            onChange={() => execCommandWithRange("italic")}
          />,
        ];
      case AvailableTools.StrikeThrough:
        return [
          <StrikeThrough
            key={tool}
            currentRange={selectionRange}
            onChange={() => execCommandWithRange("strikeThrough")}
          />,
        ];
      case AvailableTools.Underline:
        return [
          <Underline
            key={tool}
            currentRange={selectionRange}
            onChange={() => execCommandWithRange("underline")}
          />,
        ];
      case AvailableTools.IconFontColor:
        return [
          <IconFontColor
            key={tool}
            selectionRange={selectionRange}
            execCommand={execCommand}
          />,
        ];
      case AvailableTools.IconBgColor:
        return [
          <IconBgColor
            key={tool}
            selectionRange={selectionRange}
            execCommand={execCommand}
          />,
        ];
      case AvailableTools.Link:
        return [
          <Link
            key={`${tool}-link`}
            currentRange={selectionRange}
            onChange={(values) => execCommand("createLink", values)}
          />,
          <Unlink
            key={`${tool}-unlink`}
            currentRange={selectionRange}
            onChange={() => execCommand("")}
          />,
        ];
      case AvailableTools.Justify:
        return [
          <ToolItem
            key={`${tool}-justify-left`}
            onClick={() => execCommand("justifyLeft")}
            icon={<FormatAlignLeftIcon />}
            title={t("Align left")}
          />,
          <ToolItem
            key={`${tool}-justify-center`}
            onClick={() => execCommand("justifyCenter")}
            icon={<FormatAlignCenterIcon />}
            title={t("Align center")}
          />,
          <ToolItem
            key={`${tool}-justify-right`}
            onClick={() => execCommand("justifyRight")}
            icon={<FormatAlignRightIcon />}
            title={t("Align right")}
          />,
        ];
      case AvailableTools.Lists:
        return [
          <ToolItem
            key={`${tool}-ordered-list`}
            onClick={() => execCommand("insertOrderedList")}
            icon={<FormatListNumberedIcon />}
            title={t("Orderlist")}
          />,
          <ToolItem
            key={`${tool}-unordered-list`}
            onClick={() => execCommand("insertUnorderedList")}
            icon={<FormatListBulletedIcon />}
            title={t("Unorderlist")}
          />,
        ];
      case AvailableTools.HorizontalRule:
        return [
          <ToolItem
            key={tool}
            onClick={() => execCommand("insertHorizontalRule")}
            icon={<HorizontalRuleIcon />}
            title={t("Line")}
          />,
        ];
      case AvailableTools.RemoveFormat:
        return [
          <ToolItem
            key={tool}
            onClick={() => execCommandWithRange("removeFormat")}
            icon={<FormatClearIcon />}
            title={t("Remove format")}
          />,
        ];
      default:
        console.error("Not existing tool", tool);
        throw new Error(`Not existing tool ${tool}`);
    }
  });

  return (
    <div
      id={RICH_TEXT_TOOL_BAR}
      style={{ display: "flex", flexWrap: "nowrap" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <BasicTools />
        {tools.flatMap((tool, index) => [
          tool,
          <div
            className="easy-email-extensions-divider"
            key={`divider-${index}`}
          />,
        ])}
      </div>
      {toolbar?.suffix?.(execCommand)}
    </div>
  );
}
