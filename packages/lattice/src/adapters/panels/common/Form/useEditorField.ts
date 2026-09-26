import { useMemo } from "react";
import { useController } from "react-hook-form";
import { toFieldPath } from "@/shared/utils/formValues";
import type { FieldAdapter } from "./enhancer";

/** The event shape of a MUI input or select. */
type ValueEvent = { target: { value: unknown } };

export interface EditorFieldInput<T> {
  value: T;
  // An event too, so a caller can spread `input` into a MUI input, as with final-form.
  onChange: (valueOrEvent: T | ValueEvent) => void;
  onBlur: () => void;
}

function isValueEvent(value: unknown): value is ValueEvent {
  return typeof value === "object" && value !== null && "target" in value;
}

/** Binds one value of the nearest form. `name` is a lodash-style path, such as `content.children.[0]`. */
export function useEditorField<T = unknown>(
  name: string,
  adapter?: FieldAdapter,
): { input: EditorFieldInput<T> } {
  const {
    field: { value, onChange, onBlur },
  } = useController({ name: toFieldPath(name) });
  const format = adapter?.format;
  const parse = adapter?.parse;

  // A stable input, so a caller can memoize a debounce on it.
  const input = useMemo<EditorFieldInput<T>>(
    () => ({
      value: (format ? format(value) : value) as T,
      onChange: (valueOrEvent) => {
        const next = isValueEvent(valueOrEvent)
          ? valueOrEvent.target.value
          : valueOrEvent;
        onChange(parse ? parse(next) : next);
      },
      onBlur,
    }),
    [format, onBlur, onChange, parse, value],
  );

  return { input };
}
