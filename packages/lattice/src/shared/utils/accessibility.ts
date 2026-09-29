export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export function getHeadingComponent(
  level: HeadingLevel,
  offset = 0,
): `h${HeadingLevel}` {
  const result = Math.min(6, Math.max(1, level + offset)) as HeadingLevel;
  return `h${result}`;
}

export function getTabA11yProps(prefix: string, value: number | string) {
  return {
    id: `${prefix}-tab-${value}`,
    "aria-controls": `${prefix}-tabpanel-${value}`,
  };
}
