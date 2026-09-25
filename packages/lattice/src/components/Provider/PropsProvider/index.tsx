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
  variableData?: Record<string, any>;
  previewOverride?: Record<string, any>;
  onBeforePreview?: (
    html: string,
    variableData:
      | PropsProviderProps["previewOverride"]
      | PropsProviderProps["variableData"],
  ) => string | Promise<string>;
  /**
   * The function runs on the MJML string before mjml() compiles it.
   * Use it to run a template engine, for example Handlebars, to expand
   * the loops and conditions first.
   *
   * For {{#each}}, use this function instead of onBeforePreview.
   * onBeforePreview runs after mjml(). mjml() computes the column widths
   * and MSO conditionals for the unexpanded markup. A loop over columns
   * then renders wrong.
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
