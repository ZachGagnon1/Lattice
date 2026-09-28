import { describe, expect, it } from "vitest";
import { getTreeItemAccessibility } from "./treeAccessibility";

describe("getTreeItemAccessibility", () => {
  it("describes an active parent item", () => {
    expect(
      getTreeItemAccessibility({
        depth: 1,
        hasChildren: true,
        isExpanded: false,
        isSelected: true,
        isActive: true,
      }),
    ).toEqual({
      role: "treeitem",
      "aria-level": 2,
      "aria-expanded": false,
      "aria-selected": true,
      tabIndex: 0,
    });
  });

  it("omits expanded state from a child item", () => {
    expect(
      getTreeItemAccessibility({
        depth: 2,
        hasChildren: false,
        isExpanded: false,
        isSelected: false,
        isActive: false,
      }),
    ).toEqual({
      role: "treeitem",
      "aria-level": 3,
      "aria-expanded": undefined,
      "aria-selected": false,
      tabIndex: -1,
    });
  });
});
