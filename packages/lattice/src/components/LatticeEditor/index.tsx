import React, { useMemo } from "react";
import { EmailEditorProvider } from "@/components/Provider/EmailEditorProvider";
import { StandardLayout } from "@/extensions/StandardLayout";
import { EmailEditor } from "@/components/EmailEditor";
import { defaultCategories, defaultFontList } from "./defaults";
import { IEmailTemplate } from "@/typings";
import { FormSpy } from "react-final-form";
import { BasicType } from "@/core/constants";
import { ExtensionProps } from "@/extensions";
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
  height?: string | number;
  /** Include the If Condition block in the Logic palette category. Defaults to false. */
  allowCondition?: boolean;
  /** Include the For Loop block in the Logic palette category. Defaults to false. */
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

    // Strip image blocks when no upload handler is provided
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

    // Filter the Logic category based on allowCondition / allowForLoop
    cats = cats
      .map((category) => {
        if (category.label !== "Logic") return category;
        const blocks = category.blocks.filter((block) => {
          if (!block || typeof block !== "object" || !("type" in block)) return true;
          if (block.type === BasicType.CONDITION) return allowCondition;
          if (block.type === BasicType.FOR_LOOP) return allowForLoop;
          return true;
        });
        return { ...category, blocks };
      })
      .filter((category) => {
        // Drop the Logic category entirely if both flags are off and it would be empty
        if (category.label === "Logic" && category.blocks.length === 0) return false;
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
