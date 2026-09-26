/* eslint-disable @typescript-eslint/no-unsafe-call */
import { getIframeDocument } from "@";
import React, { useEffect, useMemo, useState } from "react";

// A focus in a toolbar input, such as the hex field of the color picker, moves
// the selection out of the text. Keep the last text range so the command applies to it.
function isInEditableText(range: Range) {
  const node = range.commonAncestorContainer;
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node.parentElement;
  return element?.isContentEditable === true;
}

export const SelectionRangeContext = React.createContext<{
  selectionRange: Range | null;
  setSelectionRange: React.Dispatch<React.SetStateAction<Range | null>>;
}>({
  selectionRange: null,
  setSelectionRange: () => {},
});

export const SelectionRangeProvider: React.FC<{
  children: React.ReactNode | React.ReactElement;
}> = (props) => {
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  useEffect(() => {
    const onSelectionChange = () => {
      try {
        const range = getIframeDocument()?.getSelection()?.getRangeAt(0);
        if (range && isInEditableText(range)) {
          setSelectionRange(range);
        }
      } catch (error) {}
    };

    getIframeDocument()?.addEventListener("selectionchange", onSelectionChange);

    return () => {
      getIframeDocument()?.removeEventListener(
        "selectionchange",
        onSelectionChange,
      );
    };
  }, []);

  const value = useMemo(() => {
    return {
      selectionRange,
      setSelectionRange,
    };
  }, [selectionRange]);

  return useMemo(() => {
    return (
      <SelectionRangeContext.Provider value={value}>
        {props.children}
      </SelectionRangeContext.Provider>
    );
  }, [props.children, value]);
};
