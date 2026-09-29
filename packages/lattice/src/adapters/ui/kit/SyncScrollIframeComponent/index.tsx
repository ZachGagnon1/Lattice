// SyncScrollIframeComponent.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { createIframeSource, syncIframeMetadata } from "./iframeMetadata";

// Export a context so child components can access the iframe's document safely
export const IframeDocumentContext = React.createContext<Document | null>(null);

interface Props extends React.HTMLProps<HTMLIFrameElement> {
  children: React.ReactNode;
  title: string;
  documentTitle: string;
  language: string;
  isActive?: boolean;
  iframeWrapper?: React.FC<{ children: React.ReactNode; document?: Document }>;
}

export const SyncScrollIframeComponent = ({
  children,
  title,
  documentTitle,
  language,
  isActive,
  iframeWrapper: Wrapper,
  style,
  ...rest
}: Props) => {
  const [iframeDocument, setIframeDocument] = useState<Document | null>(null);
  const source = useMemo(
    () => createIframeSource({ language, title: documentTitle }),
    [documentTitle, language],
  );

  useEffect(() => {
    if (iframeDocument) {
      syncIframeMetadata(iframeDocument, { language, title: documentTitle });
    }
  }, [documentTitle, iframeDocument, language]);

  // React 19 Safe: Only initialize portal when iframe is fully loaded
  const handleLoad = useCallback(
    (evt: React.SyntheticEvent<HTMLIFrameElement>) => {
      const iframe = evt.target as HTMLIFrameElement;
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;

      if (doc && win) {
        doc.body.style.backgroundColor = "transparent";
        syncIframeMetadata(doc, { language, title: documentTitle });
        setIframeDocument(doc);
      }
    },
    [documentTitle, language],
  );

  return (
    <iframe
      {...(rest as any)}
      title={title}
      onLoad={handleLoad}
      style={style}
      srcDoc={source}
    >
      {iframeDocument &&
        createPortal(
          <IframeDocumentContext.Provider value={iframeDocument}>
            {Wrapper ? (
              <Wrapper document={iframeDocument}>{children}</Wrapper>
            ) : (
              children
            )}
          </IframeDocumentContext.Provider>,
          iframeDocument.body,
        )}
    </iframe>
  );
};
