import { useContext } from "react";
import { EditorStatusContext } from "@/adapters/ui/Provider/EditorStatusProvider";

export function useEditorStatus() {
  return useContext(EditorStatusContext);
}
