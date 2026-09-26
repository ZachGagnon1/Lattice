import React, { useMemo } from "react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { getIframeDocument } from "@/shared/utils";

export const IframeCacheProvider: React.FC<{
  children: React.ReactNode;
  document?: Document;
}> = ({ children, document: propDocument }) => {
  const iframeDocument = propDocument || getIframeDocument();

  const cache = useMemo(() => {
    if (!iframeDocument) return null;

    if (!(iframeDocument as any).__emotion_cache) {
      (iframeDocument as any).__emotion_cache = createCache({
        key: "mui-iframe",
        container: iframeDocument.head,
      });
    }
    return (iframeDocument as any).__emotion_cache;
  }, [iframeDocument]);

  if (!cache) return <>{children}</>;

  return <CacheProvider value={cache}>{children}</CacheProvider>;
};
