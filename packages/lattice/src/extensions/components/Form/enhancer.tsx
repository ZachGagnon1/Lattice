import { useController } from "react-hook-form";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRefState } from "@";
import { debounce } from "lodash-es";
import { toFieldPath } from "@/utils/formValues";

/** Maps between the stored value and the value that the input shows. */
export interface FieldAdapter {
  // Method syntax on purpose: it lets an adapter declare a narrower parameter, such as `string`.
  format?(value: unknown): unknown;
  parse?(value: unknown): unknown;
}

export interface EnhancerProps {
  name: string;
  onChangeAdapter?(value: unknown): unknown;
  /** Returns an error message, or `undefined` when the value is valid. */
  validate?(value: unknown): string | undefined | Promise<string | undefined>;
  config?: FieldAdapter;
  changeOnBlur?: boolean;
  label?: React.ReactNode;
  required?: boolean;
  autoComplete?: "on" | "off";
  style?: React.CSSProperties;
  helpText?: React.ReactNode;
  debounceTime?: number;
  labelHidden?: boolean;
}

// final-form showed an undefined value as "", so a controlled input never became uncontrolled.
const defaultFormat = (value: unknown) => (value === undefined ? "" : value);

export default function enhancer<
  P extends { onChange?: (...rest: any) => any },
>(
  Component: React.FC<any>,
  changeAdapter: (args: Parameters<NonNullable<P["onChange"]>>) => any,
  option?: { debounceTime: number },
) {
  type FieldProps = EnhancerProps & Omit<P, "value" | "onChange" | "mutators">;

  function BoundField(props: FieldProps) {
    const {
      name,
      validate,
      onChangeAdapter,
      changeOnBlur,
      label,
      required,
      style,
      helpText,
      autoComplete,
      labelHidden,
      config,
      debounceTime: debounceTimeProp,
      ...rest
    } = props;

    const debounceTime = debounceTimeProp || option?.debounceTime || 300;

    const { field, fieldState, formState } = useController({
      name: toFieldPath(name),
      rules: validate
        ? { validate: async (value) => (await validate(value)) ?? true }
        : undefined,
    });

    const format = config?.format ?? defaultFormat;
    const parse = config?.parse;
    const formatted = format(field.value);

    const [currentValue, setCurrentValue] = useState(formatted);
    const currentValueRef = useRefState(currentValue);

    useEffect(() => {
      setCurrentValue(formatted);
    }, [formatted]);

    const { onChange, onBlur } = field;
    const commit = useCallback(
      (value: unknown) => {
        onChange(parse ? parse(value) : value);
        onBlur();
      },
      [onBlur, onChange, parse],
    );

    const debouncedCommit = useMemo(
      () => debounce(commit, debounceTime),
      [commit, debounceTime],
    );
    // A focus change unmounts the field. Flush, so the last keystrokes still reach the form.
    useEffect(() => () => debouncedCommit.flush(), [debouncedCommit]);

    const onFieldChange = useCallback(
      (...args: Parameters<NonNullable<P["onChange"]>>) => {
        const adapted = changeAdapter(args[0]);
        const newValue = onChangeAdapter ? onChangeAdapter(adapted) : adapted;
        setCurrentValue(newValue);
        if (!changeOnBlur) {
          debouncedCommit(newValue);
        }
      },
      [changeOnBlur, debouncedCommit, onChangeAdapter],
    );

    const onFieldBlur = useCallback(() => {
      if (changeOnBlur) {
        commit(currentValueRef.current);
      }
    }, [changeOnBlur, commit, currentValueRef]);

    // final-form marked every field touched on submit. react-hook-form does not, so check the submit too.
    const isError = Boolean(
      fieldState.error && (fieldState.isTouched || formState.isSubmitted),
    );

    return (
      <Component
        autoComplete={autoComplete}
        {...rest}
        name={name}
        checked={currentValue}
        value={currentValue}
        onChange={onFieldChange}
        onBlur={onFieldBlur}
        label={labelHidden ? undefined : label}
        error={isError}
        helperText={isError ? fieldState.error?.message : helpText}
        required={required}
        style={style}
      />
    );
  }

  return function EnhancedField(props: FieldProps) {
    // A new name is a new field. The key resets the local value and the pending debounce.
    return <BoundField key={props.name} {...props} />;
  };
}
