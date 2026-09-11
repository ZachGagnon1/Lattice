import React, { useMemo } from "react";
import { EmailEditorProvider } from "@/components/Provider/EmailEditorProvider";
import { StandardLayout } from "@/extensions/StandardLayout";
import { EmailEditor } from "@/components/EmailEditor";
import { defaultCategories, defaultFontList } from "./defaults";
import { IEmailTemplate } from "@/typings";
import { FormSpy } from "react-final-form";
import { BasicType } from "@/core/constants";
import { ExtensionProps } from "@/extensions";
import { PropsProviderProps } from "@/components/Provider/PropsProvider";
import { useDebouncedCallback } from "use-debounce";

export interface LatticeEditorConfig {
  showSourceCode?: boolean;
  mjmlReadOnly?: boolean;
  showBlockLayer?: boolean;
  dashed?: boolean;
  compact?: boolean;
}

export interface LatticeEditorProps {
  data: IEmailTemplate;
  onChange?: (values: IEmailTemplate) => void;
  onUploadImage?: (file: Blob) => Promise<string>;
  components?: ExtensionProps["categories"];
  config?: LatticeEditorConfig;
  fontList?: { label: string; value: string }[];
  mergeTags?: Record<string, any>;
  /** Data injected into the preview instead of `mergeTags`. */
  previewInjectData?: PropsProviderProps["previewInjectData"];
  /** Runs on the preview HTML after mjml() compiles it. */
  onBeforePreview?: PropsProviderProps["onBeforePreview"];
  /** Runs on the MJML string before mjml() compiles it. */
  onBeforeMjmlCompile?: PropsProviderProps["onBeforeMjmlCompile"];
  /** Formats a merge tag path into the placeholder text. Defaults to `{{path}}`. */
  mergeTagGenerate?: PropsProviderProps["mergeTagGenerate"];
  height?: string | number;
  /** Add the If Condition block to the Logic category. Default is false. */
  allowCondition?: boolean;
  /** Add the For Loop block to the Logic category. Default is false. */
  allowForLoop?: boolean;
}

export function LatticeEditor(props: LatticeEditorProps) {
  const {
    data,
    onChange,
    onUploadImage,
    components = defaultCategories,
    config = {},
    fontList = defaultFontList,
    mergeTags,
    previewInjectData,
    onBeforePreview,
    onBeforeMjmlCompile,
    mergeTagGenerate,
    height = "calc(100vh - 108px)",
    allowCondition = false,
    allowForLoop = false,
  } = props;

  const {
    showSourceCode = false,
    mjmlReadOnly = false,
    showBlockLayer = true,
    dashed = false,
    compact = false,
  } = config;

  const activeComponents = useMemo(() => {
    let cats = components;

    // Image blocks require an upload handler.
    if (!onUploadImage) {
      cats = cats.map((category) => ({
        ...category,
        blocks: category.blocks.filter((block) => {
          if (block && typeof block === "object" && "type" in block) {
            return block.type !== BasicType.IMAGE;
          }
          return true;
        }),
      })) as ExtensionProps["categories"];
    }

    cats = cats
      .map((category) => {
        if (category.label !== "Logic") return category;
        const blocks = category.blocks.filter((block) => {
          if (!block || typeof block !== "object" || !("type" in block))
            return true;
          if (block.type === BasicType.CONDITION) return allowCondition;
          if (block.type === BasicType.FOR_LOOP) return allowForLoop;
          return true;
        });
        return { ...category, blocks };
      })
      .filter((category) => {
        // Remove an empty Logic category.
        if (category.label === "Logic" && category.blocks.length === 0)
          return false;
        return true;
      }) as ExtensionProps["categories"];

    return cats;
  }, [components, onUploadImage, allowCondition, allowForLoop]);

  const onValueChange = (values: IEmailTemplate) => {
    if (onChange) {
      onChange(values);
    }
  };

  const debouncedOnChange = useDebouncedCallback(onValueChange, 200);

  return (
    <EmailEditorProvider
      data={data}
      height={typeof height === "string" ? height : `${height}px`}
      onUploadImage={onUploadImage}
      dashed={dashed}
      compact={compact}
      mergeTags={mergeTags}
      previewInjectData={previewInjectData}
      onBeforePreview={onBeforePreview}
      onBeforeMjmlCompile={onBeforeMjmlCompile}
      mergeTagGenerate={mergeTagGenerate}
      fontList={fontList}
    >
      {() => (
        <>
          {onChange && (
            <FormSpy
              subscription={{ values: true }}
              onChange={(state) =>
                debouncedOnChange(state.values as IEmailTemplate)
              }
            />
          )}
          <StandardLayout
            categories={activeComponents}
            showSourceCode={showSourceCode}
            mjmlReadOnly={mjmlReadOnly}
            showBlockLayer={showBlockLayer}
          >
            <EmailEditor />
          </StandardLayout>
        </>
      )}
    </EmailEditorProvider>
  );
}
