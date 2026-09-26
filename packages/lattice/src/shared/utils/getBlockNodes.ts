import { getIframeDocument } from "@/shared/utils/getEditorRoot";

export const getBlockNodes = () =>
  Array.from(getIframeDocument()?.querySelectorAll(".email-block") || []);
