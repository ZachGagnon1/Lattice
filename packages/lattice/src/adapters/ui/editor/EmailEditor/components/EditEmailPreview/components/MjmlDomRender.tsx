import React, { useEffect, useMemo, useRef, useState } from "react";
import mjml from "mjml-browser";
import { getPageIdx, IPage, JsonToMjml } from "@";
import { cloneDeep, isEqual } from "lodash-es";
import { useEditorContext } from "@/application/hooks/useEditorContext";
import { useEditorProps } from "@/application/hooks/useEditorProps";
import { getIframeDocument } from "@/shared/utils";
import { DATA_RENDER_COUNT, FIXED_CONTAINER_ID } from "@/constants";
import { HtmlStringToReactNodes } from "@/shared/utils/HtmlStringToReactNodes";
import { createPortal } from "react-dom";
import { getMjmlErrorReport } from "@/shared/utils/editorAccessibility";

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

  const isTextFocusing =
    getIframeDocument()?.activeElement?.getAttribute("contenteditable") ===
    "true";

  useEffect(() => {
    if (!isTextFocus && !isEqual(content, pageData)) {
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
      const isFocusing =
        getIframeDocument()?.activeElement?.getAttribute("contenteditable") ===
        "true";
      if (isFocusing) {
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
        // MJML still renders on a soft error, so without this check an invalid
        // block tree gives no message.
        if (isMounted) {
          const report = getMjmlErrorReport(result.errors);
          if (!report && previousErrorRef.current) {
            setPreviewStatus(t("Preview errors resolved."));
          } else {
            setPreviewStatus("");
          }
          previousErrorRef.current = report;
          setPreviewError(report);
          setHtml(result.html);
        }
      })
      .catch((error) => {
        if (isMounted) {
          const report =
            error instanceof Error
              ? error.message
              : t("The preview cannot compile the current template.");
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
