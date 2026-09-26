import { PLUGINS_CONTAINER_ID } from "@/constants";
import { getIframeDocument } from "@/shared/utils/getEditorRoot";

export const getPluginElement = () =>
  getIframeDocument()?.getElementById(PLUGINS_CONTAINER_ID);
