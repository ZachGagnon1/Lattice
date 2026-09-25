import React, { useEffect, useMemo, useRef, useState } from "react";
import mjml from "mjml-browser";
import { getPageIdx, IPage, JsonToMjml } from "@";
import { cloneDeep, isEqual } from "lodash";
import { useEditorContext } from "@/hooks/useEditorContext";
import { useEditorProps } from "@/hooks/useEditorProps";
import { getIframeDocument } from "@/utils";
import { DATA_RENDER_COUNT, FIXED_CONTAINER_ID } from "@/constants";
import { HtmlStringToReactNodes } from "@/utils/HtmlStringToReactNodes";
import { createPortal } from "react-dom";

let count = 0;
let reportedMjmlErrors = "";

export function MjmlDomRender() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pageData, setPageData] = useState<IPage | null>(null);
  const [isTextFocus, setIsTextFocus] = useState(false);

  const { pageData: content } = useEditorContext();
  const { dashed, variableData, enabledMergeTagsBadge } = useEditorProps();
  const [html, setHtml] = useState<string>("");

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
        // MJML still renders a soft error, so an invalid block tree is silent without this.
        const messages = (result.errors ?? []).map(
          (error) => error.formattedMessage,
        );
        const report = messages.join("\n");
        if (report && report !== reportedMjmlErrors) {
          console.warn("MJML validation errors:", messages);
        }
        reportedMjmlErrors = report;
        if (isMounted) {
          setHtml(result.html);
        }
      })
      .catch((error) => {
        console.error("MJML compilation failed:", error);
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
        role="tabpanel"
        tabIndex={0}
      >
        {ref.current &&
          createPortal(
            HtmlStringToReactNodes(html, {
              enabledMergeTagsBadge: Boolean(enabledMergeTagsBadge),
            }),
            ref.current,
          )}
      </div>
    );
  }, [dashed, ref, html, enabledMergeTagsBadge]);
}
