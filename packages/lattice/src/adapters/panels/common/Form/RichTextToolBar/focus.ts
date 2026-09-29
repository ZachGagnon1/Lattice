interface ToolbarFocusIntent {
  label: string;
  showRing: boolean;
}

const focusIntents = new WeakMap<Document, ToolbarFocusIntent>();

export function keepToolbarControlFocus(
  button: HTMLButtonElement,
  showRing: boolean,
) {
  const label = button.getAttribute("aria-label");
  if (!label) return;

  const intent = { label, showRing };
  const document = button.ownerDocument;
  focusIntents.set(document, intent);
  restoreToolbarControlFocus(button.closest<HTMLElement>('[role="toolbar"]'));
  document.defaultView?.setTimeout(() => {
    if (focusIntents.get(document) !== intent) return;
    restoreToolbarControlFocus(
      document.querySelector<HTMLElement>('[role="toolbar"]'),
    );
  }, 300);
}

export function restoreToolbarControlFocus(
  toolbar: HTMLElement | null | undefined,
) {
  if (!toolbar) return;
  const intent = focusIntents.get(toolbar.ownerDocument);
  if (!intent) return;

  const buttons = Array.from(
    toolbar.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
  );
  const button = buttons.find(
    (item) => item.getAttribute("aria-label") === intent.label,
  );
  if (!button) return;

  buttons.forEach((item) => {
    item.tabIndex = item === button ? 0 : -1;
    item.removeAttribute("data-keyboard-focus");
  });
  if (intent.showRing) {
    button.setAttribute("data-keyboard-focus", "true");
  }
  button.focus();
}

export function clearToolbarFocusIntent(document: Document) {
  focusIntents.delete(document);
}

export function returnFocusToText(range: Range | null | undefined) {
  if (!range) return;
  const node = range.commonAncestorContainer;
  const element =
    node.nodeType === 1
      ? (node as HTMLElement)
      : (node.parentElement as HTMLElement | null);
  const editable = element?.closest?.<HTMLElement>('[contenteditable="true"]');
  if (!editable) return;

  const document = editable.ownerDocument;
  clearToolbarFocusIntent(document);
  editable.focus();
  const selection = document.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range.cloneRange());
}
