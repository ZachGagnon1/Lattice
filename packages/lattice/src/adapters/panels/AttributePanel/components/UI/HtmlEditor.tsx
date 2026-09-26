import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Box, Button, Drawer, Stack, Typography } from "@mui/material";
import { useBlock, useEditorContext, useFocusIdx } from "@";
import { BasicType } from "@";
import {
  htmlToTableSource,
  tableSourceToHtml,
} from "@/domain/blocks/standard/Table/tableSource";

const CodeMirrorEditorPromise = import("../../../common/Form/CodemirrorEditor");
const CodeMirrorEditor = React.lazy(() => CodeMirrorEditorPromise);

export const HtmlEditor: React.FC<{
  visible: boolean;
  setVisible: (v: boolean) => void;
}> = (props) => {
  const { visible, setVisible } = props;

  const { focusBlock, setValueByIdx } = useBlock();
  const { pageData } = useEditorContext();
  const { focusIdx } = useFocusIdx();
  const isTable = focusBlock?.type === BasicType.TABLE;
  // A Table block stores a cell grid, so the editor shows its rows as HTML.
  const source: string = isTable
    ? tableSourceToHtml(
        focusBlock.data.value.tableSource || [],
        focusBlock.attributes,
      )
    : (focusBlock?.data.value.content ?? "");
  const [content, setContent] = useState(source);

  useEffect(() => {
    setContent(source);
  }, [source]);

  const onClose = () => {
    setVisible(false);
  };

  const onSave = () => {
    if (!focusBlock) {
      return;
    }
    const value = isTable
      ? {
          ...focusBlock.data.value,
          tableSource: htmlToTableSource(content),
        }
      : { ...focusBlock.data.value, content };
    setValueByIdx(focusIdx, {
      ...focusBlock,
      data: { ...focusBlock.data, value },
    });
    onClose();
  };

  const styles = useMemo(() => {
    if (!focusBlock) {
      return {};
    }
    return {
      backgroundColor: focusBlock.attributes["container-background-color"],
      padding: focusBlock.attributes.padding,
      color: focusBlock.attributes.color,
    };
  }, [focusBlock]);

  return (
    <Drawer
      anchor="right"
      open={visible}
      // Prevents closing by clicking the backdrop or hitting ESC, mimicking your previous setup
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          onClose();
        }
      }}
      slotProps={{
        paper: {
          sx: { width: "100vw", overflow: "hidden" },
        },
      }}
    >
      {/* Header Area */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Html
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={onSave} variant="contained" color="primary">
            Save
          </Button>
        </Stack>
      </Box>

      {/* Body Area */}
      <Box sx={{ display: "flex", height: "calc(100vh - 73px)" }}>
        {/* Left Side: Code Editor */}
        <Box sx={{ flex: 1, height: "100%", bgcolor: "#263238" }}>
          <Suspense
            fallback={
              <Box
                sx={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#263238",
                  color: "#fff",
                  fontSize: 24,
                }}
              >
                {t("Editor Loading...")}
              </Box>
            }
          >
            <CodeMirrorEditor value={content} onChange={setContent} />
          </Suspense>
        </Box>

        {/* Right Side: Preview (ShadowDom Removed) */}
        <Box
          sx={{
            flex: 1,
            height: "100%",
            overflow: "auto",
            bgcolor: "grey.100", // Subtle background to make the email stand out
            p: 2,
          }}
        >
          <Box
            sx={{
              ...styles,
              width: pageData.attributes.width || "600px",
              margin: "0 auto",
              bgcolor: "background.paper", // Ensures the email content has a solid background
              minHeight: "100%", // Ensures it looks like a page
            }}
          >
            {isTable ? (
              <table style={{ width: "100%" }}>
                <tbody dangerouslySetInnerHTML={{ __html: content }} />
              </table>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
