import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AvailableTools,
  getIframeDocument,
  MergeTagBadge,
  useEditorProps,
  useFocusBlockLayout,
} from "@";
import { RICH_TEXT_TOOL_BAR } from "@/adapters/panels/constants";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatStrikethroughIcon from "@mui/icons-material/FormatStrikethrough";
import FormatClearIcon from "@mui/icons-material/FormatClear";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import { ToolItem } from "../ToolItem";
import { BasicTools } from "../BasicTools";
import { FontFamily } from "../FontFamily";
import { FontSize } from "../FontSize";
import { MergeTags } from "../MergeTags";
import { ColorTool } from "../ColorTool";
import { getLinkNode, Link, LinkParams, Unlink } from "../Link";
import {
  EMPTY_FORMAT_STATE,
  FormatState,
  readFormatState,
} from "../../formatState";
import {
  focusText,
  getEditableFromRange,
  getNextIndex,
  getToolbarItems,
  keepScrollPosition,
  rememberToolbarFocus,
  selectRange,
  setRovingItem,
  takeToolbarFocus,
} from "../../focus";
import {
  restoreSelection,
  saveSelection,
  SavedSelection,
} from "../../savedSelection";
import {
  ExecCommand,
  ToolbarContext,
  ToolbarContextValue,
} from "../../ToolbarContext";

export interface ToolsProps {
  onChange: (content: string) => void;
}

const DEFAULT_TOOLS = [
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

const TOGGLE_TOOLS: Partial<
  Record<
    AvailableTools,
    {
      command: string;
      title: string;
      icon: React.ReactNode;
      state: keyof FormatState;
    }
  >
> = {
  [AvailableTools.Bold]: {
    command: "bold",
    title: "Bold",
    icon: <FormatBoldIcon />,
    state: "bold",
  },
  [AvailableTools.Italic]: {
    command: "italic",
    title: "Italic",
    icon: <FormatItalicIcon />,
    state: "italic",
  },
  [AvailableTools.StrikeThrough]: {
    command: "strikeThrough",
    title: "Strikethrough",
    icon: <FormatStrikethroughIcon />,
    state: "strikeThrough",
  },
  [AvailableTools.Underline]: {
    command: "underline",
    title: "Underline",
    icon: <FormatUnderlinedIcon />,
    state: "underline",
  },
};

const COMMAND_TOOLS: Partial<
  Record<
    AvailableTools,
    Array<{ command: string; title: string; icon: React.ReactNode }>
  >
> = {
  [AvailableTools.Justify]: [
    {
      command: "justifyLeft",
      title: "Align left",
      icon: <FormatAlignLeftIcon />,
    },
    {
      command: "justifyCenter",
      title: "Align center",
      icon: <FormatAlignCenterIcon />,
    },
    {
      command: "justifyRight",
      title: "Align right",
      icon: <FormatAlignRightIcon />,
    },
  ],
  [AvailableTools.Lists]: [
    {
      command: "insertOrderedList",
      title: "Numbered list",
      icon: <FormatListNumberedIcon />,
    },
    {
      command: "insertUnorderedList",
      title: "Bulleted list",
      icon: <FormatListBulletedIcon />,
    },
  ],
  [AvailableTools.HorizontalRule]: [
    {
      command: "insertHorizontalRule",
      title: "Horizontal line",
      icon: <HorizontalRuleIcon />,
    },
  ],
  [AvailableTools.RemoveFormat]: [
    {
      command: "removeFormat",
      title: "Remove format",
      icon: <FormatClearIcon />,
    },
  ],
};

function runCommand(
  document: Document,
  command: string,
  value: unknown,
  range: Range,
  enabledMergeTagsBadge: boolean | undefined,
) {
  const id = Date.now().toString();

  if (command === "createLink") {
    const { link, blank, underline, linkNode } = value as LinkParams;
    let anchor = linkNode;
    if (!anchor) {
      // The browser creates the anchor. A unique href finds it again.
      document.execCommand("createLink", false, id);
      anchor = document.querySelector<HTMLAnchorElement>(`a[href="${id}"]`);
    }
    if (!anchor) return;
    if (blank) anchor.setAttribute("target", "_blank");
    else anchor.removeAttribute("target");
    anchor.style.color = "inherit";
    anchor.style.textDecoration = underline ? "underline" : "none";
    anchor.setAttribute("href", link.trim());
    return;
  }

  if (command === "insertHTML") {
    const html = enabledMergeTagsBadge
      ? MergeTagBadge.transform(value as string, id)
      : (value as string);
    document.execCommand("insertHTML", false, html);
    // Select the new badge, so the merge tag prompt opens on it.
    const badge = document.getElementById(id);
    if (badge) {
      const badgeRange = document.createRange();
      badgeRange.selectNode(badge);
      selectRange(badgeRange);
    }
    return;
  }

  document.execCommand(command, false, value as string | undefined);

  if (command === "foreColor") {
    // A link keeps its own color unless it inherits the new one.
    const linkNode = getLinkNode(range);
    if (linkNode) linkNode.style.color = "inherit";
  }
}

export function Tools({ onChange }: Readonly<ToolsProps>) {
  const { variableData, enabledMergeTagsBadge, toolbar } = useEditorProps();
  const { focusBlockNode } = useFocusBlockLayout();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [format, setFormat] = useState<FormatState>(EMPTY_FORMAT_STATE);
  // The commands read the selection from a ref, so `execCommand` stays stable for `toolbar.suffix`.
  const savedSelectionRef = useRef<SavedSelection | null>(null);

  /**
   * Keeps the caret of the text block.
   * Only a selection made in the text counts. The browser can move the selection while a toolbar button has the focus.
   * `fromCommand` also accepts the selection that a command leaves.
   */
  const captureSelection = useCallback(
    (fromCommand = false) => {
      const document = getIframeDocument();
      const selection = document?.getSelection();
      if (!document || !selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const editable = getEditableFromRange(range);
      if (!editable || !focusBlockNode?.contains(editable)) return;
      if (!fromCommand && document.activeElement !== editable) return;

      const saved = saveSelection(range, editable);
      savedSelectionRef.current = saved;
      setSavedRange(saved.range);
      setFormat(readFormatState(range, editable));
    },
    [focusBlockNode],
  );

  useEffect(() => {
    const document = getIframeDocument();
    const onSelectionChange = () => captureSelection();
    onSelectionChange();
    document?.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document?.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [captureSelection]);

  const getSavedRange = useCallback(() => {
    const document = getIframeDocument();
    const saved = savedSelectionRef.current;
    return document && saved ? restoreSelection(document, saved) : null;
  }, []);

  const returnToText = useCallback(() => {
    focusText(getSavedRange(), focusBlockNode);
  }, [focusBlockNode, getSavedRange]);

  const execCommand = useCallback<ExecCommand>(
    (command, value) => {
      const document = getIframeDocument();
      const range = getSavedRange();
      const editable = getEditableFromRange(range);
      if (!document || !range || !editable) return;

      const toolbarButton = toolbarRef.current?.contains(document.activeElement)
        ? (document.activeElement as HTMLElement)
        : null;
      if (!toolbarButton && document.activeElement !== editable) {
        editable.focus({ preventScroll: true });
      }
      keepScrollPosition(editable, () => {
        selectRange(range);
        if (command) {
          runCommand(document, command, value, range, enabledMergeTagsBadge);
        }
      });
      onChange(editable.innerHTML);
      // A command on an empty caret changes no selection, so no selectionchange event comes.
      captureSelection(true);
      toolbarButton?.focus({ preventScroll: true });
    },
    [captureSelection, enabledMergeTagsBadge, getSavedRange, onChange],
  );

  // Keep exactly one item in the Tab order.
  useLayoutEffect(() => {
    const items = getToolbarItems(toolbarRef.current);
    const current = items.find((item) => item.tabIndex === 0);
    if (!current && items[0]) setRovingItem(items, items[0]);
  });

  // A re-render can replace the toolbar. Give the focus back to the same item.
  useLayoutEffect(() => {
    const toolbarElement = toolbarRef.current;
    if (!toolbarElement) return;
    const document = toolbarElement.ownerDocument;
    const index = takeToolbarFocus(document);
    const items = getToolbarItems(toolbarElement);
    const lostFocus =
      !document.activeElement || document.activeElement === document.body;
    if (index !== undefined && lostFocus && items[index]) {
      setRovingItem(items, items[index]);
      items[index].focus({ preventScroll: true });
    }
    return () => {
      const lastIndex = getToolbarItems(toolbarElement).indexOf(
        document.activeElement as HTMLButtonElement,
      );
      if (lastIndex >= 0) rememberToolbarFocus(document, lastIndex);
    };
  }, []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = getToolbarItems(toolbarRef.current);
    const index = items.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;

    if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      returnToText();
      return;
    }

    const next = items[getNextIndex(event.key, index, items.length)];
    if (!next) return;
    event.preventDefault();
    setRovingItem(items, next);
    next.focus({ preventScroll: true });
  };

  const onFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const items = getToolbarItems(toolbarRef.current);
    const item = event.target as Element as HTMLButtonElement;
    if (items.includes(item)) setRovingItem(items, item);
  };

  const context = useMemo<ToolbarContextValue>(
    () => ({ execCommand, format, savedRange, returnToText }),
    [execCommand, format, savedRange, returnToText],
  );

  const tools = (toolbar?.tools ?? DEFAULT_TOOLS).flatMap((tool) => {
    const toggle = TOGGLE_TOOLS[tool];
    if (toggle) {
      return [
        <ToolItem
          key={tool}
          title={t(toggle.title)}
          icon={toggle.icon}
          isActive={Boolean(format[toggle.state])}
          onClick={() => execCommand(toggle.command)}
        />,
      ];
    }

    const commands = COMMAND_TOOLS[tool];
    if (commands) {
      return commands.map((item) => (
        <ToolItem
          key={item.command}
          title={t(item.title)}
          icon={item.icon}
          onClick={() => execCommand(item.command)}
        />
      ));
    }

    switch (tool) {
      case AvailableTools.MergeTags:
        return variableData ? [<MergeTags key={tool} />] : [];
      case AvailableTools.FontFamily:
        return [<FontFamily key={tool} />];
      case AvailableTools.FontSize:
        return [<FontSize key={tool} />];
      case AvailableTools.IconFontColor:
        return [<ColorTool key={tool} kind="text" />];
      case AvailableTools.IconBgColor:
        return [<ColorTool key={tool} kind="background" />];
      case AvailableTools.Link:
        return [<Link key="link" />, <Unlink key="unlink" />];
      default:
        throw new Error(`Not existing tool ${tool}`);
    }
  });

  return (
    <ToolbarContext.Provider value={context}>
      <div
        ref={toolbarRef}
        id={RICH_TEXT_TOOL_BAR}
        role="toolbar"
        aria-label={t("Text formatting")}
        aria-description={t(
          "Use the arrow keys to move between the tools. Press Escape or Tab to return to the text.",
        )}
        aria-keyshortcuts="Alt+F10"
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        style={{ display: "flex", flexWrap: "nowrap", alignItems: "center" }}
      >
        <BasicTools />
        {tools.map((tool, index) => (
          <React.Fragment key={index}>
            {tool}
            <div className="easy-email-extensions-divider" aria-hidden="true" />
          </React.Fragment>
        ))}
        {toolbar?.suffix?.(execCommand)}
      </div>
    </ToolbarContext.Provider>
  );
}
