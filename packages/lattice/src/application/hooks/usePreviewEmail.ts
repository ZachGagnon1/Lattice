import { PreviewEmailContext } from "@/adapters/ui/Provider/PreviewEmailProvider";
import { useContext } from "react";

export function usePreviewEmail() {
  return useContext(PreviewEmailContext);
}
