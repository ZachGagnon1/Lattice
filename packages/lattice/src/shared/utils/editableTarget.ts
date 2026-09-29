export interface EditableTargetLike {
  closest?: (selector: string) => EditableFieldLike | null;
}

export interface EditableFieldLike {
  getAttribute: (name: string) => string | null;
}

export function getEditableField(
  target: EditableTargetLike | null,
  indexAttribute: string,
  typeAttribute: string,
) {
  const field = target?.closest?.(`[${indexAttribute}]`) ?? null;
  const name = field?.getAttribute(indexAttribute) ?? "";

  return name
    ? { field, name, type: field?.getAttribute(typeAttribute) ?? null }
    : null;
}
