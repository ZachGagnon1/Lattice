// SyncScrollIframeComponent.tsx
import React, { useCallback, useState } from "react";
import { createPortal } from "react-dom";

// Export a context so child components can access the iframe's document safely
export const IframeDocumentContext = React.createContext<Document | null>(null);

interface Props extends React.HTMLProps<HTMLIFrameElement> {
  children: React.ReactNode;
  isActive?: boolean;
  iframeWrapper?: React.FC<{ children: React.ReactNode; document?: Document }>;
}

export const SyncScrollIframeComponent = ({
  children,
  title,
  isActive,
  iframeWrapper: Wrapper,
  style,
  ...rest
}: Props) => {
  const [iframeDocument, setIframeDocument] = useState<Document | null>(null);

  // React 19 Safe: Only initialize portal when iframe is fully loaded
  const handleLoad = useCallback(
    (evt: React.SyntheticEvent<HTMLIFrameElement>) => {
      const iframe = evt.target as HTMLIFrameElement;
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;

      if (doc && win) {
        doc.body.style.backgroundColor = "transparent";
        setIframeDocument(doc);
      }
    },
    [],
  );

  return (
    <iframe
      {...(rest as any)}
      title={title}
      onLoad={handleLoad}
      style={style}
      srcDoc='<!doctype html><html xmlns="http://www.w3.org/1999/xhtml"><head></head><body></body></html>'
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
