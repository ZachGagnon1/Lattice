import { useCallback, useEffect, useMemo, useRef } from "react";
import { debounce } from "lodash-es";
import { MergeTagBadge, useEditorContext, useEditorProps } from "@";

/**
 * Returns a function that writes the text of an editable block to the form, 200 ms after the
 * last call. A call for another block first writes the pending text, so no edit is lost.
 */
export function useTextCommit() {
  const { formHelpers } = useEditorContext();
  const { mergeTagGenerate, enabledMergeTagsBadge } = useEditorProps();
  const pendingNameRef = useRef<string | null>(null);

  const debouncedChange = useMemo(
    () =>
      debounce((name: string, value: string) => {
        pendingNameRef.current = null;
        formHelpers.change(
          name,
          enabledMergeTagsBadge
            ? MergeTagBadge.revert(value, mergeTagGenerate)
            : value,
        );
      }, 200),
    [formHelpers, enabledMergeTagsBadge, mergeTagGenerate],
  );

  useEffect(() => () => debouncedChange.flush(), [debouncedChange]);

  return useCallback(
    (name: string, value: string) => {
      if (pendingNameRef.current && pendingNameRef.current !== name) {
        debouncedChange.flush();
      }
      pendingNameRef.current = name;
      debouncedChange(name, value);
    },
    [debouncedChange],
  );
}
