import type { ITable, ITableCellData } from "./index";

export function tableSourceToHtml(
  tableSource: ITableCellData[][],
  attributes: ITable["attributes"],
): string {
  const { cellPadding, cellBorderColor } = attributes;
  const textAlign = attributes["text-align"];
  const fontStyle = attributes["font-style"];
  const styles: string[] = [];
  if (cellPadding) styles.push(`padding: ${cellPadding}`);
  if (cellBorderColor) styles.push(`border: 1px solid ${cellBorderColor}`);

  return tableSource
    .map((tr) => {
      const cells = tr.map(
        (cell) =>
          `<td rowspan="${cell.rowSpan || 1}" colspan="${
            cell.colSpan || 1
          }" style="${styles.join(";")};${
            cell.backgroundColor
              ? `background-color:${cell.backgroundColor};`
              : ""
          }">${cell.content}</td>`,
      );
      return `<tr style="text-align:${textAlign || "left"};font-style:${
        fontStyle || "normal"
      };">${cells.join("\n")}</tr>`;
    })
    .join("\n");
}

// The template keeps table styles on the block attributes, so a cell keeps only its own fields.
export function htmlToTableSource(html: string): ITableCellData[][] {
  // A second <table> wrapper would close the first one and leave it empty.
  const markup = /^\s*<table[\s>]/i.test(html)
    ? html
    : `<table>${html}</table>`;
  const doc = new DOMParser().parseFromString(markup, "text/html");
  const table = doc.querySelector("table");
  if (!table) return [];

  return Array.from(table.rows).map((row) =>
    Array.from(row.cells).map((cell) => {
      const data: ITableCellData = { content: cell.innerHTML.trim() };
      if (cell.colSpan > 1) data.colSpan = cell.colSpan;
      if (cell.rowSpan > 1) data.rowSpan = cell.rowSpan;
      if (cell.style.backgroundColor)
        data.backgroundColor = cell.style.backgroundColor;
      return data;
    }),
  );
}
