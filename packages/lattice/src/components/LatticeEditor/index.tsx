import React, { useEffect, useMemo } from "react";
import { EmailEditorProvider } from "@/components/Provider/EmailEditorProvider";
import { StandardLayout } from "@/extensions/StandardLayout";
import { EmailEditor } from "@/components/EmailEditor";
import { defaultCategories, defaultFontList } from "./defaults";
import { IEmailTemplate } from "@/typings";
import { useEditorContext } from "@/hooks/useEditorContext";
import { BasicType } from "@/core/constants";
import { ExtensionProps } from "@/extensions";
import { PropsProviderProps } from "@/components/Provider/PropsProvider";
import { useDebouncedCallback } from "use-debounce";
import { toVariableSample } from "@/utils/variableSchema";
import { VariableDataOf } from "@/typings/variableData";

/** Layout and panel switches for the editor user interface. */
export interface LatticeEditorConfig {
  showSourceCode?: boolean;
  mjmlReadOnly?: boolean;
  showBlockLayer?: boolean;
  dashed?: boolean;
  compact?: boolean;
}

/**
 * The props of {@link LatticeEditor}.
 *
 * The consumer passes `variableData` with the type `TVar`. This type is a
 * plain sample object type or a schema type. `VariableDataOf<TVar>`
 * resolves both types to the data shape. So each data prop uses
 * `VariableDataOf<TVar>`, never `TVar`.
 *
 * @typeParam TVar - The `variableData` value type. The default keeps every
 *   existing consumer source compatible. It widens a path to `string`.
 */
export interface LatticeEditorProps<TVar = Record<string, any>> {
  data: IEmailTemplate;
  onChange?: (values: IEmailTemplate) => void;
  onUploadImage?: (file: Blob) => Promise<string>;
  components?: ExtensionProps["categories"];
  config?: LatticeEditorConfig;
  fontList?: { label: string; value: string }[];
  /**
   * The variable data a template can read.
   *
   * Pass a plain sample object, or pass a zod schema. The editor converts a
   * schema to sample data at this boundary. A schema has no values, so each
   * leaf is a string placeholder. Pass `previewOverride` to add real values to
   * the preview.
   */
  variableData?: TVar;
  /** Data merged over `variableData` in the preview. */
  previewOverride?: Partial<VariableDataOf<TVar>>;
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

/**
 * The complete editor: the provider, the standard layout, and the canvas.
 *
 * @typeParam TVar - The `variableData` value type. See
 *   {@link LatticeEditorProps}.
 */
export function LatticeEditor<TVar = Record<string, any>>(
  props: LatticeEditorProps<TVar>,
) {
  const {
    data,
    onChange,
    onUploadImage,
    components = defaultCategories,
    config = {},
    fontList = defaultFontList,
    variableData,
    previewOverride,
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

  /**
   * The resolved sample data.
   *
   * `toVariableSample` returns a plain object unchanged. It walks a schema into
   * a new object. The memo fixes the object identity across renders.
   * `PreviewEmailProvider` builds `injectData` with
   * `useMemo(..., [variableData, previewOverride])`. Its preview effect depends
   * on `injectData`. Without the memo, a new identity on every render rebuilds
   * the MJML preview on every keystroke.
   *
   * The generic stops here. React context cannot be generic per consumer. So
   * `PropsProvider` keeps a plain `variableData?: Record<string, any>`. It
   * holds this resolved sample. Do not pass `TVar` through the context.
   */
  const resolvedVariableData = useMemo(
    () => toVariableSample(variableData),
    [variableData],
  );

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
      variableData={resolvedVariableData}
      previewOverride={previewOverride as PropsProviderProps["previewOverride"]}
      onBeforePreview={onBeforePreview}
      onBeforeMjmlCompile={onBeforeMjmlCompile}
      mergeTagGenerate={mergeTagGenerate}
      fontList={fontList}
    >
      {() => (
        <>
          {onChange && <ValuesListener onChange={debouncedOnChange} />}
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

function ValuesListener({
  onChange,
}: {
  onChange: (values: IEmailTemplate) => void;
}) {
  const {
    formState: { values },
  } = useEditorContext();

  useEffect(() => {
    onChange(values);
  }, [onChange, values]);

  return null;
}
