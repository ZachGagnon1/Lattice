import React, { useContext, useMemo, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { IEmailTemplate } from "@/shared/typings";
import { replaceEqualDeep, toFieldPath } from "@/shared/utils/formValues";

export interface EditorFormHelpers {
  /** Sets the value at a lodash-style path, such as `content.children.[0]`. */
  change: (name: string, value: unknown) => void;
  /** Returns the live values. Do not mutate them: clone first. */
  getValues: () => IEmailTemplate;
  /** Replaces all values. With no argument, it restores the loaded template. */
  reset: (values?: IEmailTemplate) => void;
}

export interface EditorFormState {
  values: IEmailTemplate;
}

const EditorFormContext = React.createContext<{
  formState: EditorFormState;
  formHelpers: EditorFormHelpers;
} | null>(null);

// One subscription for the whole editor, so the identity of each unchanged block is kept in one place.
export function EditorFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Untyped on purpose: the editor writes by runtime paths that no static type can name.
  const { control, setValue, getValues, reset } = useFormContext();
  const watched = useWatch({ control }) as IEmailTemplate;

  const valuesRef = useRef(watched);
  valuesRef.current = replaceEqualDeep(valuesRef.current, watched);
  const values = valuesRef.current;

  const formHelpers = useMemo<EditorFormHelpers>(
    () => ({
      change: (name, value) =>
        setValue(toFieldPath(name), value, { shouldDirty: true }),
      getValues: () => getValues() as IEmailTemplate,
      reset: (nextValues) => reset(nextValues),
    }),
    [getValues, reset, setValue],
  );

  const context = useMemo(
    () => ({ formState: { values }, formHelpers }),
    [values, formHelpers],
  );

  return (
    <EditorFormContext.Provider value={context}>
      {children}
    </EditorFormContext.Provider>
  );
}

export function useEditorForm() {
  const context = useContext(EditorFormContext);
  if (!context) {
    throw new Error("useEditorForm must be used inside EmailEditorProvider.");
  }
  return context;
}
