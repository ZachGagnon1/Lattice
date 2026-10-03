import React, { useEffect, useMemo, useRef, useState } from "react";
import mjml from "mjml-browser";
import { getPageIdx, IPage, JsonToMjml } from "@";
import { cloneDeep, isEqual } from "lodash-es";
import { useEditorContext } from "@/application/hooks/useEditorContext";
import { useEditorProps } from "@/application/hooks/useEditorProps";
import { getIframeDocument } from "@/shared/utils";
import { isEditingText } from "@/shared/utils/contenteditable";
import { DATA_RENDER_COUNT, FIXED_CONTAINER_ID } from "@/constants";
import { HtmlStringToReactNodes } from "@/shared/utils/HtmlStringToReactNodes";
import { createPortal } from "react-dom";
import { MJML_PREVIEW_FAILURE_MESSAGE } from "@/shared/utils/editorAccessibility";

let count = 0;
export function MjmlDomRender() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pageData, setPageData] = useState<IPage | null>(null);
  const [isTextFocus, setIsTextFocus] = useState(false);

  const { pageData: content } = useEditorContext();
  const { dashed, variableData, enabledMergeTagsBadge } = useEditorProps();
  const [html, setHtml] = useState<string>("");
  const [previewError, setPreviewError] = useState("");
  const [previewStatus, setPreviewStatus] = useState("");
  const previousErrorRef = useRef("");

  const isTextFocusing = isEditingText(getIframeDocument());

  useEffect(() => {
    // A re-render replaces the text block that has the focus, so wait until the edit ends.
    // Read the focus now. The state can be stale after a move to the toolbar and back.
    const editing = isTextFocus || isEditingText(getIframeDocument());
    if (!editing && !isEqual(content, pageData)) {
      setPageData(cloneDeep(content));
    }
  }, [content, pageData, isTextFocus]);

  useEffect(() => {
    setIsTextFocus(isTextFocusing);
  }, [isTextFocusing]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (getIframeDocument()?.contains(e.target as Node)) {
        return;
      }
      const fixedContainer =
        getIframeDocument()?.getElementById(FIXED_CONTAINER_ID);
      if (fixedContainer?.contains(e.target as Node)) {
        return;
      }
      setIsTextFocus(false);
    };

    getIframeDocument()?.addEventListener("click", onClick);
    return () => {
      getIframeDocument()?.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    const root = getIframeDocument();
    if (!root) return;
    const onClick = (_e: Event) => {
      if (isEditingText(getIframeDocument())) {
        setIsTextFocus(true);
      }
    };

    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    if (!pageData) {
      setHtml("");
      return;
    }

    // Prevents state updates if the component unmounts before compilation finishes
    let isMounted = true;

    const mjmlString = JsonToMjml({
      data: pageData,
      idx: getPageIdx(),
      context: pageData,
      mode: "testing",
      dataSource: cloneDeep(variableData),
    });

    // Call mjml and wait for the Promise to resolve
    mjml(mjmlString)
      .then((result) => {
        if (isMounted) {
          if (previousErrorRef.current) {
            setPreviewStatus(t("Preview errors resolved."));
          } else {
            setPreviewStatus("");
          }
          previousErrorRef.current = "";
          setPreviewError("");
          setHtml(result.html);
        }
      })
      .catch((error) => {
        if (isMounted) {
          console.error("MJML preview compilation failed", error);
          const report = t(MJML_PREVIEW_FAILURE_MESSAGE);
          previousErrorRef.current = report;
          setPreviewError(report);
          setPreviewStatus("");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [variableData, pageData]);

  return useMemo(() => {
    return (
      <div
        {...{
          [DATA_RENDER_COUNT]: count++,
        }}
        data-dashed={dashed}
        ref={ref}
        style={{
          outline: "none",
          position: "relative",
        }}
      >
        {previewError && (
          <div
            role="alert"
            style={{
              padding: 12,
              marginBottom: 12,
              border: "2px solid #b3261e",
              background: "#fff4f2",
              color: "#601410",
              whiteSpace: "pre-wrap",
            }}
          >
            <strong>{t("Preview error")}</strong>
            <div>{previewError}</div>
          </div>
        )}
        {previewStatus && (
          <div
            role="status"
            style={{ position: "absolute", clip: "rect(0 0 0 0)" }}
          >
            {previewStatus}
          </div>
        )}
        {ref.current &&
          createPortal(
            HtmlStringToReactNodes(html, {
              enabledMergeTagsBadge: Boolean(enabledMergeTagsBadge),
            }),
            ref.current,
          )}
      </div>
    );
  }, [dashed, ref, html, enabledMergeTagsBadge, previewError, previewStatus]);
}
