import React, { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { xml } from "@codemirror/lang-xml";
import { material } from "@uiw/codemirror-theme-material";
import { EditorView } from "@codemirror/view";
import { Box } from "@mui/material";
import { getEditorA11yProps } from "@/shared/utils/editorAccessibility";

export default function CodemirrorEditor(
  props: Readonly<{
    value: string;
    onChange(val: string): void;
    mode?: "xml" | "javascript";
    maxHeight?: string;
    label: string;
    description: string;
    readOnly?: boolean;
    errorId?: string;
  }>,
) {
  const {
    value,
    onChange,
    mode = "xml",
    maxHeight = "350px",
    label,
    description,
    readOnly = false,
    errorId,
  } = props;
  const descriptionId = React.useId();
  const a11yProps = getEditorA11yProps(label, descriptionId, errorId);

  const extensions = useMemo(() => {
    const langExtension =
      mode === "javascript"
        ? javascript({ jsx: false, typescript: false })
        : xml();

    return [langExtension, EditorView.lineWrapping];
  }, [mode]);

  return (
    <Box>
      <Box
        id={descriptionId}
        sx={{ position: "absolute", clip: "rect(0 0 0 0)" }}
      >
        {description}
      </Box>
      <CodeMirror
        {...a11yProps}
        value={value}
        maxHeight={maxHeight}
        theme={material}
        extensions={extensions}
        editable={!readOnly}
        readOnly={readOnly}
        onChange={(val) => onChange(val)}
        basicSetup={{
          lineNumbers: true,
          autocompletion: true,
          foldGutter: true,
          highlightActiveLine: true,
          tabSize: 2,
        }}
      />
    </Box>
  );
}
