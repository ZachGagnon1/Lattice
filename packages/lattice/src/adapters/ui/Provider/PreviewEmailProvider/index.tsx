import { useEditorContext } from "@/application/hooks/useEditorContext";
import { useEditorProps } from "@/application/hooks/useEditorProps";
import { useLazyState } from "@/application/hooks/useLazyState";
import { HtmlStringToPreviewReactNodes } from "@/shared/utils/HtmlStringToPreviewReactNodes";
import { JsonToMjml } from "@";
import { cloneDeep, isString } from "lodash-es";
import mjml from "mjml-browser";
import React, { useEffect, useMemo, useRef, useState } from "react";

export const MOBILE_WIDTH = 320;

export const PreviewEmailContext = React.createContext<{
  html: string;
  reactNode: React.ReactNode | null;
  errMsg: React.ReactNode;
  mobileWidth: number;
}>({
  html: "",
  reactNode: null,
  errMsg: "",
  mobileWidth: 320,
});

export const PreviewEmailProvider: React.FC<{ children?: React.ReactNode }> = (
  props,
) => {
  const { current: iframe } = useRef(document.createElement("iframe"));
  const contentWindowRef = useRef<Window | null>(null);

  const [mobileWidth, setMobileWidth] = useState(MOBILE_WIDTH);

  const { pageData } = useEditorContext();
  const {
    onBeforePreview,
    onBeforeMjmlCompile,
    variableData,
    previewOverride,
  } = useEditorProps();
  const [errMsg, setErrMsg] = useState<React.ReactNode>("");
  const [html, setHtml] = useState("");
  const lazyPageData = useLazyState(pageData, 0);

  const injectData = useMemo(() => {
    return { ...variableData, ...previewOverride };
  }, [variableData, previewOverride]);

  useEffect(() => {
    let isMounted = true;

    const breakpoint = Number.parseInt(
      lazyPageData.data.value.breakpoint || "0",
    );
    let adjustBreakPoint = breakpoint;
    if (breakpoint > 360) {
      adjustBreakPoint = Math.max(mobileWidth + 1, breakpoint);
    }
    const cloneData = {
      ...lazyPageData,
      data: {
        ...lazyPageData.data,
        value: {
          ...lazyPageData.data.value,
          breakpoint: adjustBreakPoint + "px",
        },
      },
    };

    const mjmlString = JsonToMjml({
      data: cloneData,
      mode: "production",
      context: cloneData,
      dataSource: cloneDeep(injectData),
      keepClassName: true,
    });

    (async () => {
      try {
        let compileSource = mjmlString;

        // The template engine runs first, so mjml() computes the layout on the
        // markup after the loops and conditions expand.
        if (onBeforeMjmlCompile) {
          const transformed = await onBeforeMjmlCompile(
            compileSource,
            injectData,
          );
          if (!isMounted) return;
          compileSource = transformed;
        }

        const result = await mjml(compileSource);
        if (!isMounted) return;

        let parseHtml = result.html;

        if (onBeforePreview) {
          try {
            const previewResult = onBeforePreview(parseHtml, injectData);
            if (isString(previewResult)) {
              parseHtml = previewResult;
              setHtml(parseHtml);
            } else {
              previewResult.then((resHtml) => {
                if (isMounted) setHtml(resHtml);
              });
            }

            setErrMsg("");
          } catch (error: any) {
            setErrMsg(error?.message || error);
          }
        } else {
          setHtml(parseHtml);
        }
      } catch (error: any) {
        if (isMounted) {
          setErrMsg(error?.message || "MJML compilation failed");
        }
      }
    })();

    return () => {
      isMounted = false;
      setHtml("");
    };
  }, [
    injectData,
    onBeforePreview,
    onBeforeMjmlCompile,
    lazyPageData,
    mobileWidth,
  ]);

  const htmlNode = useMemo(() => HtmlStringToPreviewReactNodes(html), [html]);

  useEffect(() => {
    if (errMsg) return;

    iframe.width = "400px";
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.onload = (evt) => {
      contentWindowRef.current = (evt.target as any)?.contentWindow;
    };

    document.body.appendChild(iframe);

    return () => {
      document.body.removeChild(iframe);
    };
  }, [errMsg, html, iframe]);

  useEffect(() => {
    if (!contentWindowRef.current) return;
    const innerBody = contentWindowRef.current.document.body;
    innerBody.innerHTML = html;
    const a = innerBody.querySelector(".mjml-body") as HTMLElement;
    if (a) {
      a.style.display = "inline-block";
      setMobileWidth(Math.max(a.clientWidth, MOBILE_WIDTH));
    }
    return () => {
      innerBody.innerHTML = "";
    };
  }, [html]);

  const value = useMemo(() => {
    return {
      reactNode: htmlNode,
      html,
      errMsg,
      mobileWidth,
    };
  }, [errMsg, html, htmlNode, mobileWidth]);

  return (
    <PreviewEmailContext.Provider value={value}>
      {props.children}
    </PreviewEmailContext.Provider>
  );
};
