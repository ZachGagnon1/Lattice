import React from "react";
import styles from "@/styles/block-shadowDom-interactive.css?inline";
import { useEditorProps } from "@/application/hooks/useEditorProps";

export function ShadowStyle() {
  const {
    interactiveStyle: {
      hoverColor = "rgb(var(--primary-4, #1890ff))",
      selectedColor = "rgb(var(--primary-6, #1890ff))",
    } = {},
  } = useEditorProps();

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            * {
              --hover-color: ${hoverColor};
              --selected-color: ${selectedColor};
            }

            :host(*){
              all: initial;
            }

            .shadow-container {
              overflow: overlay !important;
            }
            .shadow-container::-webkit-scrollbar {
              -webkit-appearance: none;
              width: 8px;
            }
            .shadow-container::-webkit-scrollbar-thumb {
              background-color: rgba(0, 0, 0, 0.5);
              box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
              -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
            }


            ${styles}

            `,
        }}
      />
    </>
  );
}
