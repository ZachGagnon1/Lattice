import { IBlockData } from "@";
import React, { useMemo } from "react";

export interface CollectedBlock {
  label: string;
  helpText: string;
  thumbnail: string;
  data: IBlockData;
  id: string;
}

export interface BlockGroup {
  title: string;
  blocks: Array<CollectedBlock>;
}

export enum AvailableTools {
  MergeTags = "mergeTags",
  FontFamily = "fontFamily",
  FontSize = "fontSize",
  Bold = "bold",
  Italic = "italic",
  StrikeThrough = "strikeThrough",
  Underline = "underline",
  IconFontColor = "iconFontColor",
  IconBgColor = "iconBgColor",
  Link = "link",
  Justify = "justify",
  Lists = "lists",
  HorizontalRule = "horizontalRule",
  RemoveFormat = "removeFormat",
}

export interface PropsProviderProps {
  children?: React.ReactNode;
  height: string;
  fontList?: { value: string; label: string }[];
  onAddCollection?: (payload: CollectedBlock) => void;
  onRemoveCollection?: (payload: { id: string }) => void;
  onUploadImage?: (data: Blob) => Promise<string>;
  interactiveStyle?: {
    hoverColor?: string;
    selectedColor?: string;
    dragoverColor?: string;
    tangentColor?: string;
  };
  autoComplete?: boolean;
  dashed?: boolean;
  socialIcons?: Array<{ content: string; image: string }>;

  mergeTagGenerate?: (m: string) => string;
  onChangeMergeTag?: (ptah: string, val: any) => any;
  renderMergeTagContent?: (props: {
    onChange: (val: string) => void;
    isSelect: boolean;
    value: string;
  }) => React.ReactNode;
  enabledMergeTagsBadge?: boolean;
  mergeTags?: Record<string, any>;
  previewInjectData?: Record<string, any>;
  onBeforePreview?: (
    html: string,
    mergeTags:
      | PropsProviderProps["previewInjectData"]
      | PropsProviderProps["mergeTags"],
  ) => string | Promise<string>;
  /**
   * Runs on the MJML string BEFORE mjml() compiles it. Use it to evaluate a
   * template engine (e.g. Handlebars) so loops and conditions expand first.
   *
   * Prefer this over onBeforePreview for {{#each}}: onBeforePreview runs AFTER
   * mjml(), by which point column widths and MSO conditionals were already
   * computed for the unexpanded markup, so a loop over columns renders wrong.
   */
  onBeforeMjmlCompile?: (
    mjml: string,
    data: Record<string, any>,
  ) => string | Promise<string>;
  locale?: Record<string, string>;

  toolbar?: {
    tools?: AvailableTools[];
    suffix?: (
      execCommand: (cmd: string, value?: any) => void,
    ) => React.ReactNode;
  };
}

const defaultMergeTagGenerate = (m: string) => `{{${m}}}`;

export const EditorPropsContext = React.createContext<
  PropsProviderProps & {
    mergeTagGenerate: Required<PropsProviderProps["mergeTagGenerate"]>;
  }
>({
  children: null,
  height: "100vh",
  fontList: [],
  onAddCollection: undefined,
  onRemoveCollection: undefined,
  onUploadImage: undefined,
  autoComplete: false,
  dashed: true,
  mergeTagGenerate: defaultMergeTagGenerate,
});

export const PropsProvider: React.FC<PropsProviderProps> = (props) => {
  const { dashed = true, mergeTagGenerate = defaultMergeTagGenerate } = props;
  const formatProps = useMemo(() => {
    return {
      ...props,
      mergeTagGenerate,
      dashed,
    };
  }, [mergeTagGenerate, props, dashed]);

  return (
    <EditorPropsContext.Provider value={formatProps}>
      {props.children}
    </EditorPropsContext.Provider>
  );
};
