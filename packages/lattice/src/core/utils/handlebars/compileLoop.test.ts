import { describe, expect, it } from "vitest";

import {
  LOOP_CLOSE,
  compileLoopIssues,
  compileLoopLabel,
  compileLoopOpen,
  splitLoopRows,
  wrapTableRowsInEach,
} from "./compileLoop";

describe("compileLoopOpen", () => {
  it("emits a loop with an alias", () => {
    expect(compileLoopOpen({ source: "items", itemAs: "item" })).toBe(
      "{{#each items as |item|}}",
    );
  });

  it("emits a loop with no alias when the alias is blank", () => {
    expect(compileLoopOpen({ source: "items", itemAs: "" })).toBe(
      "{{#each items}}",
    );
  });

  it("emits a loop with no alias when the alias is absent", () => {
    expect(compileLoopOpen({ source: "items" })).toBe("{{#each items}}");
  });

  it("returns null when the source is blank", () => {
    expect(compileLoopOpen({ source: "" })).toBeNull();
  });

  it("returns null when the source is only whitespace", () => {
    expect(compileLoopOpen({ source: "   ", itemAs: "item" })).toBeNull();
  });

  it("returns null for an undefined configuration", () => {
    expect(compileLoopOpen(undefined)).toBeNull();
  });

  it("drops an invalid alias and keeps the loop", () => {
    expect(compileLoopOpen({ source: "items", itemAs: "bad name" })).toBe(
      "{{#each items}}",
    );
  });

  it("normalises a wrapped source", () => {
    expect(compileLoopOpen({ source: "{{items}}", itemAs: "item" })).toBe(
      "{{#each items as |item|}}",
    );
  });

  it("bracket quotes a hyphenated source segment", () => {
    expect(compileLoopOpen({ source: "order.line-items", itemAs: "item" })).toBe(
      "{{#each order.[line-items] as |item|}}",
    );
  });
});

describe("compileLoopLabel", () => {
  it("names the source and the alias", () => {
    expect(compileLoopLabel({ source: "items", itemAs: "item" })).toBe(
      "FOR EACH: items as |item|",
    );
  });

  it("names the source alone when there is no alias", () => {
    expect(compileLoopLabel({ source: "items" })).toBe("FOR EACH: items");
  });

  it("reports a missing source", () => {
    expect(compileLoopLabel({ source: "" })).toBe("(no data source set)");
  });

  it("reports a missing source for an undefined configuration", () => {
    expect(compileLoopLabel(undefined)).toBe("(no data source set)");
  });
});

describe("compileLoopIssues", () => {
  it("reports nothing for a valid configuration", () => {
    expect(compileLoopIssues({ source: "items", itemAs: "item" })).toEqual([]);
  });

  it("reports a blank source", () => {
    const issues = compileLoopIssues({ source: "" });

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("MISSING_FIELD");
    expect(issues[0].path).toBe("");
  });

  it("reports an invalid alias", () => {
    const issues = compileLoopIssues({ source: "items", itemAs: "bad name" });

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("MISSING_VALUE");
  });

  it("reports both a blank source and an invalid alias", () => {
    const issues = compileLoopIssues({ source: "", itemAs: "bad name" });

    expect(issues.map((issue) => issue.code)).toEqual([
      "MISSING_FIELD",
      "MISSING_VALUE",
    ]);
  });

  it("reports a blank source for an undefined configuration", () => {
    expect(compileLoopIssues(undefined)).toHaveLength(1);
  });
});

describe("wrapTableRowsInEach", () => {
  const rows = "<tr><td>A</td></tr><tr><td>B</td></tr><tr><td>C</td></tr>";

  it("returns the content unchanged when there is no loop configuration", () => {
    expect(wrapTableRowsInEach(rows, undefined)).toBe(rows);
  });

  it("returns the content unchanged when the source is blank", () => {
    expect(wrapTableRowsInEach(rows, { source: "" })).toBe(rows);
  });

  it("wraps every row when headerRows is zero", () => {
    expect(
      wrapTableRowsInEach(rows, { source: "items", itemAs: "item", headerRows: 0 }),
    ).toBe(`{{#each items as |item|}}${rows}${LOOP_CLOSE}`);
  });

  it("wraps every row when headerRows is absent", () => {
    expect(wrapTableRowsInEach(rows, { source: "items", itemAs: "item" })).toBe(
      `{{#each items as |item|}}${rows}${LOOP_CLOSE}`,
    );
  });

  it("keeps the first row outside the loop when headerRows is one", () => {
    expect(
      wrapTableRowsInEach(rows, { source: "items", itemAs: "item", headerRows: 1 }),
    ).toBe(
      "<tr><td>A</td></tr>" +
        "{{#each items as |item|}}" +
        "<tr><td>B</td></tr><tr><td>C</td></tr>" +
        LOOP_CLOSE,
    );
  });

  it("preserves the thead, the tbody, and the whitespace between rows", () => {
    const content =
      "<thead>\n  <tr><th>H</th></tr>\n</thead>\n" +
      "<tbody>\n  <tr><td>A</td></tr>\n  <tr><td>B</td></tr>\n</tbody>";

    const output = wrapTableRowsInEach(content, {
      source: "items",
      itemAs: "item",
      headerRows: 1,
    });

    expect(output).toBe(
      "<thead>\n  <tr><th>H</th></tr>\n</thead>\n" +
        "<tbody>\n  " +
        "{{#each items as |item|}}" +
        "<tr><td>A</td></tr>\n  <tr><td>B</td></tr>" +
        LOOP_CLOSE +
        "\n</tbody>",
    );
    expect(output).toContain("<thead>");
    expect(output).toContain("</tbody>");
  });

  it("returns the content unchanged when headerRows equals the row count", () => {
    expect(
      wrapTableRowsInEach(rows, { source: "items", itemAs: "item", headerRows: 3 }),
    ).toBe(rows);
  });

  it("returns the content unchanged when headerRows is larger than the row count", () => {
    expect(
      wrapTableRowsInEach(rows, { source: "items", itemAs: "item", headerRows: 9 }),
    ).toBe(rows);
  });

  it("returns the content unchanged when there are no rows", () => {
    expect(
      wrapTableRowsInEach("<p>no rows here</p>", { source: "items", itemAs: "item" }),
    ).toBe("<p>no rows here</p>");
  });

  it("treats a negative headerRows as zero", () => {
    expect(
      wrapTableRowsInEach(rows, { source: "items", itemAs: "item", headerRows: -2 }),
    ).toBe(`{{#each items as |item|}}${rows}${LOOP_CLOSE}`);
  });

  it("matches an uppercase row tag", () => {
    const upper = "<TR><TD>A</TD></TR><TR><TD>B</TD></TR>";

    expect(
      wrapTableRowsInEach(upper, { source: "items", itemAs: "item", headerRows: 1 }),
    ).toBe(
      "<TR><TD>A</TD></TR>" +
        "{{#each items as |item|}}" +
        "<TR><TD>B</TD></TR>" +
        LOOP_CLOSE,
    );
  });
});

describe("splitLoopRows", () => {
  it("splits the header rows from the body rows", () => {
    expect(splitLoopRows(["a", "b", "c"], 1)).toEqual({
      header: ["a"],
      body: ["b", "c"],
    });
  });

  it("puts every row in the body when headerRows is absent", () => {
    expect(splitLoopRows(["a", "b", "c"])).toEqual({
      header: [],
      body: ["a", "b", "c"],
    });
  });

  it("puts every row in the header when headerRows is larger than the array", () => {
    expect(splitLoopRows(["a", "b"], 9)).toEqual({
      header: ["a", "b"],
      body: [],
    });
  });

  it("treats a negative headerRows as zero", () => {
    expect(splitLoopRows(["a", "b"], -3)).toEqual({
      header: [],
      body: ["a", "b"],
    });
  });

  it("handles an empty array", () => {
    expect(splitLoopRows([], 2)).toEqual({ header: [], body: [] });
  });

  it("handles a value that is not an array", () => {
    expect(splitLoopRows(undefined as unknown as string[], 1)).toEqual({
      header: [],
      body: [],
    });
  });
});
