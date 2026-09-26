import React, { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { xml } from "@codemirror/lang-xml";
import { material } from "@uiw/codemirror-theme-material";
import { EditorView } from "@codemirror/view";

export default function CodemirrorEditor(
  props: Readonly<{
    value: string;
    onChange(val: string): void;
    mode?: "xml" | "javascript";
    maxHeight?: string;
  }>,
) {
  const { value, onChange, mode = "xml", maxHeight = "350px" } = props;

  const extensions = useMemo(() => {
    const langExtension =
      mode === "javascript"
        ? javascript({ jsx: false, typescript: false })
        : xml();

    return [langExtension, EditorView.lineWrapping];
  }, [mode]);

  return (
    <CodeMirror
      value={value}
      maxHeight={maxHeight}
      theme={material}
      extensions={extensions}
      onChange={(val) => onChange(val)}
      basicSetup={{
        lineNumbers: true,
        autocompletion: true,
        foldGutter: true,
        highlightActiveLine: true,
        tabSize: 2,
      }}
    />
  );
}
