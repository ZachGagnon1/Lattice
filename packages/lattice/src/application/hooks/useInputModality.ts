import { useEffect, useState } from "react";
import { useEditorContext } from "@/application/hooks/useEditorContext";
import { getIframeDocument } from "@/shared/utils/getEditorRoot";
import { InputModality, modalityForEvent } from "@/shared/utils/inputModality";

/** The canvas is an iframe, and its key presses never reach the page, so both documents listen. */
export function useInputModality(): InputModality {
  const [modality, setModality] = useState<InputModality>("pointer");
  const { initialized } = useEditorContext();

  useEffect(() => {
    const documents = [document, getIframeDocument()].filter(
      (target): target is Document => Boolean(target),
    );
    const update = (event: Event) => {
      const next = modalityForEvent(event as KeyboardEvent);
      if (next) setModality(next);
    };
    documents.forEach((target) => {
      target.addEventListener("keydown", update, true);
      target.addEventListener("pointerdown", update, true);
    });
    return () =>
      documents.forEach((target) => {
        target.removeEventListener("keydown", update, true);
        target.removeEventListener("pointerdown", update, true);
      });
  }, [initialized]);

  return modality;
}
