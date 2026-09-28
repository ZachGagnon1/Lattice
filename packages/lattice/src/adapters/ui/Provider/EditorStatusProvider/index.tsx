import React, { useCallback, useMemo, useState } from "react";

export const EditorStatusContext = React.createContext<{
  announce: (message: string) => void;
}>({ announce: () => {} });

export function EditorStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState({ id: 0, message: "" });
  const announce = useCallback((message: string) => {
    setStatus((current) => ({ id: current.id + 1, message }));
  }, []);
  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <EditorStatusContext.Provider value={value}>
      {children}
      <div
        key={status.id}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {status.message}
      </div>
    </EditorStatusContext.Provider>
  );
}
