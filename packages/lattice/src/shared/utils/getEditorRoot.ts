export const getEditorRoot = () =>
  <HTMLIFrameElement>document.getElementById("VisualEditorEditMode");

export const getIframeDocument = () =>
  (<HTMLIFrameElement>document.getElementById("VisualEditorEditMode"))
    ?.contentDocument;
