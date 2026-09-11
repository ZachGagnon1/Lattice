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
import { toVariableSample } from "@/utils/variableSchema";
import { VariableDataOf } from "@/typings/variableData";

/** Layout and panel switches for the editor chrome. */
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
 * `TVar` is the type of the value the consumer passes as `variableData`. It is
 * either a plain sample object type or a schema type. `VariableDataOf<TVar>`
 * resolves both of them to the data shape, so every prop that speaks in terms
 * of the DATA uses `VariableDataOf<TVar>` and never `TVar`.
 *
 * @typeParam TVar - The `variableData` value type. The default keeps every
 *   existing consumer source compatible, and widens a path to `string`.
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
   * Pass a plain sample object, or pass a zod schema. The editor normalises a
   * schema into sample data at this boundary. A schema carries no values, so
   * every generated leaf is a string placeholder. Supply `previewOverride` to
   * put real values into the preview.
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
 * @param props - The editor props.
 * @returns The editor element.
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
   * `toVariableSample` returns a plain object unchanged, and it walks a schema
   * into a FRESH object. The memo pins that new object identity across
   * renders. `PreviewEmailProvider` builds `injectData` with
   * `useMemo(..., [variableData, previewOverride])`, and its preview effect
   * depends on `injectData`. A new identity on every render therefore rebuilds
   * the MJML preview on every keystroke.
   *
   * The generic stops here. React context cannot be generic per consumer, so
   * `PropsProvider` keeps a plain, non generic
   * `variableData?: Record<string, any>`, which holds this RESOLVED sample.
   * Do not try to thread `TVar` through the context.
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
      compact={compact}
      variableData={resolvedVariableData}
      previewOverride={previewOverride as PropsProviderProps["previewOverride"]}
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
