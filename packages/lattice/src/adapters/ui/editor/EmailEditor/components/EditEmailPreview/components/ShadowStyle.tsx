import React from "react";
import styles from "@/styles/block-shadowDom-interactive.css?inline";
import { useEditorProps } from "@/application/hooks/useEditorProps";
import {
  EDITOR_HOVER_COLOR,
  EDITOR_SELECTED_COLOR,
} from "@/shared/utils/overlayAccessibility";

export function ShadowStyle() {
  const {
    interactiveStyle: {
      hoverColor = EDITOR_HOVER_COLOR,
      selectedColor = EDITOR_SELECTED_COLOR,
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
