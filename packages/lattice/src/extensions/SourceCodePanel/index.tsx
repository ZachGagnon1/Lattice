import {
  BasicType,
  BlockManager,
  getPageIdx,
  getParentByIdx,
  IBlockData,
  JsonToMjml,
  useBlock,
  useEditorContext,
  useEditorProps,
  useFocusIdx,
} from "@";
import { cloneDeep } from "lodash-es";
import React, { useCallback, useEffect, useState } from "react";
import { MjmlToJson } from "@/extensions";
import { CollapsableItem } from "@/extensions/components/Collapse/CollapsableItem";

import { Box, Button, Stack } from "@mui/material";

const CodeMirrorEditorPromise = import("../components/Form/CodemirrorEditor");
const CodeMirrorEditor = React.lazy(() => CodeMirrorEditorPromise);

// Note: Ensure `t` is imported or available in your scope if you use i18n
declare const t: (key: string) => string;

export function SourceCodePanel({
  jsonReadOnly,
  mjmlReadOnly,
}: Readonly<{
  jsonReadOnly: boolean;
  mjmlReadOnly: boolean;
}>) {
  const { setValueByIdx, focusBlock, values } = useBlock();
  const { focusIdx } = useFocusIdx();

  const [codeError, setCodeError] = useState<string>();
  const [mjmlError, setMjmlError] = useState<string>();

  const [mjmlText, setMjmlText] = useState("");
  const [codeText, setCodeText] = useState("");

  const [dirtyMode, setDirtyMode] = useState<"json" | "mjml" | null>(null);

  const { pageData } = useEditorContext();
  const { variableData } = useEditorProps();

  const onChangeCodeText = useCallback(
    (value: string) => {
      setCodeText(value);
      if (!dirtyMode) setDirtyMode("json");
    },
    [dirtyMode],
  );

  const onChangeMjmlText = useCallback(
    (value: string) => {
      setMjmlText(value);
      if (!dirtyMode) setDirtyMode("mjml");
    },
    [dirtyMode],
  );

  const onSaveJson = useCallback(() => {
    if (jsonReadOnly) return;
    try {
      const parseValue = JSON.parse(
        JSON.stringify(window.eval("(" + codeText + ")")),
      ) as IBlockData;

      const block = BlockManager.getBlockByType(parseValue.type);
      if (!block) throw new Error(t("Invalid content"));

      if (
        !parseValue.data?.value ||
        !parseValue.attributes ||
        !Array.isArray(parseValue.children)
      ) {
        throw new Error(t("Invalid content format"));
      }

      setValueByIdx(focusIdx, parseValue);
      setDirtyMode(null);
      setCodeError(undefined);
    } catch (error: any) {
      setCodeError((error?.message || error) as string);
    }
  }, [codeText, focusIdx, jsonReadOnly, setValueByIdx]);

  const onSaveMjml = useCallback(async () => {
    if (mjmlReadOnly) return;
    try {
      const parseValue = await MjmlToJson(mjmlText);
      if (parseValue.type !== BasicType.PAGE) {
        const parentBlock = getParentByIdx(values, focusIdx)!;
        const parseBlock = BlockManager.getBlockByType(parseValue.type);

        if (
          !parseBlock ||
          !BlockManager.isValidParent(parseBlock, parentBlock.type)
        ) {
          throw new Error(t("Invalid child block for this parent"));
        }
      } else if (focusIdx !== getPageIdx()) {
        throw new Error(t("Invalid page index"));
      }

      setValueByIdx(focusIdx, parseValue);
      setDirtyMode(null);
      setMjmlError(undefined);
    } catch (error: any) {
      setMjmlError(error?.message || t("Invalid MJML syntax"));
    }
  }, [mjmlText, focusIdx, mjmlReadOnly, setValueByIdx, values]);

  const onCancel = useCallback(() => {
    if (focusBlock) {
      setMjmlText(
        JsonToMjml({
          idx: focusIdx,
          data: focusBlock,
          context: pageData,
          mode: "production",
          dataSource: cloneDeep(variableData),
          beautify: true,
        }),
      );
      setCodeText(JSON.stringify(focusBlock, null, 2) || "");
    }
    setDirtyMode(null);
    setCodeError(undefined);
    setMjmlError(undefined);
  }, [focusBlock, focusIdx, pageData, variableData]);

  useEffect(() => {
    onCancel();
  }, [focusBlock, focusIdx, pageData, variableData, onCancel]);

  if (!focusBlock) return null;

  return (
    <>
      <CollapsableItem title={t("Json source")}>
        <Box
          sx={{
            opacity: dirtyMode === "mjml" || jsonReadOnly ? 0.6 : 1,
            pointerEvents:
              dirtyMode === "mjml" || jsonReadOnly ? "none" : "auto",
          }}
        >
          <CodeMirrorEditor
            mode="javascript"
            value={codeText}
            onChange={onChangeCodeText}
          />
          {codeError && (
            <Box sx={{ color: "error.main", fontSize: "12px", mt: 0.5 }}>
              {codeError}
            </Box>
          )}

          {dirtyMode === "json" && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={onSaveJson}
                disableElevation
              >
                {t("Save")}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={onCancel}
              >
                {t("Cancel")}
              </Button>
            </Stack>
          )}
        </Box>
      </CollapsableItem>

      <CollapsableItem title={t("MJML source")}>
        <Box
          sx={{
            opacity: dirtyMode === "json" || mjmlReadOnly ? 0.6 : 1,
            pointerEvents:
              dirtyMode === "json" || mjmlReadOnly ? "none" : "auto",
          }}
        >
          <CodeMirrorEditor
            mode="xml"
            value={mjmlText}
            onChange={onChangeMjmlText}
          />
          {mjmlError && (
            <Box sx={{ color: "error.main", fontSize: "12px", mt: 0.5 }}>
              {mjmlError}
            </Box>
          )}

          {dirtyMode === "mjml" && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={onSaveMjml}
                disableElevation
              >
                {t("Save")}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={onCancel}
              >
                {t("Cancel")}
              </Button>
            </Stack>
          )}
        </Box>
      </CollapsableItem>
    </>
  );
}
