import TableOperationMenu from "./TableOperationMenu";
import {
  checkEventInBoundingRect,
  getBoundaryRectAndElement,
  getCurrentTable,
  getElementsBoundary,
  getTdBoundaryIndex,
  setStyle,
} from "./util";
import { ITableCellData } from "@/domain/blocks";
import { getIframeDocument } from "@";
import {
  getTableBlockPath,
  getTableCellTarget,
  isTableSourceCellPath,
  isTypingKey,
} from "@/shared/utils/tableKeyboard";
import { DATA_CONTENT_EDITABLE_IDX } from "@/constants";
import { EMAIL_BLOCK_CLASS_NAME } from "@/domain/constants";
import {
  focusBlockSelectionSurface,
  focusEditableAtEnd,
  TABLE_CELL_ACTIVE,
  TABLE_CELL_CONTROL,
} from "@/shared/utils/canvasBlockAccessibility";

const EDITABLE_CELL_SELECTOR = `td[${DATA_CONTENT_EDITABLE_IDX}]`;

function getCellControl(table: HTMLTableElement, row: number, column: number) {
  return table
    .closest(`.${EMAIL_BLOCK_CLASS_NAME}`)
    ?.querySelector<HTMLButtonElement>(
      `:scope > [${TABLE_CELL_CONTROL}="${row}-${column}"]`,
    );
}

// The control outlives a re-render of its cell, so look the cell up on each use.
function getControlCell(control: HTMLElement) {
  const table = control.parentElement
    ?.querySelector(EDITABLE_CELL_SELECTOR)
    ?.closest("table");
  const [row, column] = (control.getAttribute(TABLE_CELL_CONTROL) ?? "")
    .split("-")
    .map(Number);
  const cell = table?.rows[row]?.cells[column];
  return table && cell ? { table, cell } : null;
}

function setActiveControl(control: HTMLElement) {
  control.parentElement
    ?.querySelectorAll<HTMLElement>(`:scope > [${TABLE_CELL_ACTIVE}]`)
    .forEach((item) => {
      item.removeAttribute(TABLE_CELL_ACTIVE);
      item.tabIndex = -1;
    });
  control.setAttribute(TABLE_CELL_ACTIVE, "");
  control.tabIndex = 0;
}

interface IBorderTool {
  top: HTMLElement;
  bottom: HTMLElement;
  left: HTMLElement;
  right: HTMLElement;
}

class TableColumnTool {
  borderTool = {} as IBorderTool;
  dragging = false;
  showBorderTool = false;

  selectedLeftTopCell: HTMLElement | undefined = undefined;
  selectedBottomRightCell: HTMLElement | undefined = undefined;
  startDom: HTMLElement | undefined = undefined;
  endDom: HTMLElement | undefined = undefined;
  hoveringTable: ParentNode | null = null;
  root: Element | undefined = undefined;

  tableMenu?: TableOperationMenu;
  changeTableData?: (e: ITableCellData[][]) => void;
  tableData: ITableCellData[][] = [];
  actionButton?: HTMLButtonElement;
  observer?: MutationObserver;
  announce?: (message: string) => void;
  focusTable?: (idx: string) => void;

  getEditableTables() {
    if (!this.root) return [];
    const cells = Array.from(
      this.root.querySelectorAll<HTMLElement>(EDITABLE_CELL_SELECTOR),
    ).filter((cell) =>
      isTableSourceCellPath(cell.getAttribute(DATA_CONTENT_EDITABLE_IDX)),
    );
    return Array.from(
      new Set(
        cells
          .map((cell) => cell.closest("table"))
          .filter((table): table is HTMLTableElement => Boolean(table)),
      ),
    );
  }

  constructor(borderTool: IBorderTool, root: Element) {
    if (!borderTool || !root) return;
    this.borderTool = borderTool;
    this.root = root;
    this.initTool();
    this.initKeyboardTool();
  }

  initTool() {
    this.root?.addEventListener(
      "contextmenu",
      this.handleContextmenu as EventListener,
    );
    this.root?.addEventListener(
      "mousedown",
      this.handleMousedown as EventListener,
    );
    getIframeDocument()?.body.addEventListener(
      "click",
      this.hideBorder as EventListener,
      false,
    );
    document.body.addEventListener(
      "contextmenu",
      this.hideTableMenu as EventListener,
      false,
    );
    getIframeDocument()?.addEventListener(
      "keydown",
      this.hideBorderByKeyDown as EventListener,
    );
    this.root?.addEventListener(
      "keydown",
      this.handleEditKeyDown as EventListener,
    );
  }

  destroy() {
    this.root?.removeEventListener(
      "contextmenu",
      this.handleContextmenu as EventListener,
    );
    this.root?.removeEventListener(
      "mousedown",
      this.handleMousedown as EventListener,
    );
    getIframeDocument()?.body.removeEventListener(
      "click",
      this.hideBorder as EventListener,
      false,
    );
    document.body.removeEventListener(
      "contextmenu",
      this.hideTableMenu as EventListener,
      false,
    );
    getIframeDocument()?.removeEventListener(
      "keydown",
      this.hideBorderByKeyDown as EventListener,
    );
    this.root?.removeEventListener(
      "keydown",
      this.handleEditKeyDown as EventListener,
    );
    this.tableMenu?.destroy();
    this.observer?.disconnect();
    this.root
      ?.querySelectorAll(`[${TABLE_CELL_CONTROL}]`)
      .forEach((control) => control.remove());
    this.actionButton?.remove();
  }

  hideBorder = (e: MouseEvent) => {
    if (
      (e.target as Element).hasAttribute?.(TABLE_CELL_CONTROL) ||
      e.target === this.actionButton
    ) {
      return;
    }
    if (this.hoveringTable?.contains(e.target as Node)) return;
    this.visibleBorder(false);
  };

  hideBorderByKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && !event.defaultPrevented) {
      this.visibleBorder(false);
    }
  };

  hideTableMenu = (e?: MouseEvent) => {
    const target = e?.target as HTMLElement;
    if (target?.id === "VisualEditorEditMode") return;
    this.tableMenu?.hide(false);
  };

  visibleBorder = (show = true) => {
    if (this.showBorderTool === show) return;
    const parent = this.borderTool.top?.parentElement;
    if (!parent) return;
    setStyle(parent, { display: show ? "block" : "none" });
    if (this.actionButton) {
      this.actionButton.style.display = show ? "block" : "none";
    }
    this.showBorderTool = show;
  };

  renderBorder = () => {
    if (!this.borderTool.top || !this.startDom || !this.endDom) return;
    this.visibleBorder(true);
    const result = getBoundaryRectAndElement(this.startDom, this.endDom);
    if (!result) return;

    const { left, top, width, height } = result.boundary;
    this.selectedLeftTopCell = result.leftTopCell;
    this.selectedBottomRightCell = result.bottomRightCell;
    this.updateCellSelection();

    const borderStyles = {
      backgroundColor: "rgb(65, 68, 77)",
      position: "absolute",
      zIndex: "9999",
      pointerEvents: "none",
    };

    setStyle(this.borderTool.top, {
      ...borderStyles,
      left: `${left}px`,
      top: `${top}px`,
      width: `${Math.abs(width)}px`,
      height: "2px",
    });
    setStyle(this.borderTool.bottom, {
      ...borderStyles,
      left: `${left}px`,
      top: `${top + height}px`,
      width: `${Math.abs(width)}px`,
      height: "2px",
    });
    setStyle(this.borderTool.left, {
      ...borderStyles,
      left: `${left}px`,
      top: `${top}px`,
      width: "2px",
      height: `${Math.abs(height)}px`,
    });
    setStyle(this.borderTool.right, {
      ...borderStyles,
      left: `${left + width}px`,
      top: `${top}px`,
      width: "2px",
      height: `${Math.abs(height)}px`,
    });
    if (this.actionButton) {
      setStyle(this.actionButton, {
        left: `${left + width - 30}px`,
        top: `${top + 4}px`,
      });
    }
  };

  initKeyboardTool() {
    const container = this.borderTool.top?.parentElement;
    const iframeDocument = getIframeDocument();
    if (!container || !iframeDocument || !this.root) return;

    this.actionButton = iframeDocument.createElement("button");
    this.actionButton.type = "button";
    // Keyboard users open the same menu with Shift+F10, so the button stays out of the Tab order.
    this.actionButton.tabIndex = -1;
    this.actionButton.textContent = "⋯";
    this.actionButton.setAttribute("aria-label", t("Table actions"));
    this.actionButton.title = t("Table actions");
    setStyle(this.actionButton, {
      position: "absolute",
      zIndex: "10000",
      width: "28px",
      height: "28px",
      borderRadius: "14px",
      border: "2px solid #ffffff",
      backgroundColor: "#005fcc",
      color: "#ffffff",
      pointerEvents: "auto",
      display: "none",
    });
    this.actionButton.onclick = () => this.openMenuFromKeyboard();
    container.appendChild(this.actionButton);

    this.syncKeyboardCells();
    this.observer = new MutationObserver(() => this.syncKeyboardCells());
    this.observer.observe(this.root, { childList: true, subtree: true });
  }

  // Reuse each control. A new node on each run would trigger this observer again.
  syncKeyboardCells = () => {
    const iframeDocument = getIframeDocument();
    if (!iframeDocument || !this.root) return;

    const liveControls = new Set<Element>();
    this.getEditableTables().forEach((table) => {
      const block = table.closest<HTMLElement>(`.${EMAIL_BLOCK_CLASS_NAME}`);
      if (!block) return;
      Array.from(table.rows).forEach((row, rowIndex) => {
        Array.from(row.cells).forEach((cell, columnIndex) => {
          cell.setAttribute("aria-rowindex", String(rowIndex + 1));
          cell.setAttribute("aria-colindex", String(columnIndex + 1));
          let control = getCellControl(table, rowIndex, columnIndex);
          if (!control) {
            control = this.createCellControl(
              iframeDocument,
              rowIndex,
              columnIndex,
            );
            block.appendChild(control);
          }
          liveControls.add(control);
        });
      });
      const firstControl = getCellControl(table, 0, 0);
      if (
        firstControl &&
        !block.querySelector(`:scope > [${TABLE_CELL_ACTIVE}]`)
      ) {
        firstControl.setAttribute(TABLE_CELL_ACTIVE, "");
      }
    });

    this.root.querySelectorAll(`[${TABLE_CELL_CONTROL}]`).forEach((control) => {
      if (!liveControls.has(control)) control.remove();
    });
  };

  createCellControl(document: Document, row: number, column: number) {
    const control = document.createElement("button");
    control.type = "button";
    control.tabIndex = -1;
    control.setAttribute(TABLE_CELL_CONTROL, `${row}-${column}`);
    control.setAttribute(
      "aria-label",
      `${t("Table cell")} ${t("row")} ${row + 1}, ${t("column")} ${column + 1}`,
    );
    control.setAttribute(
      "aria-description",
      t(
        "Use the arrow keys to move between the cells. Press Enter or type to edit the cell.",
      ),
    );
    control.style.cssText =
      "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
    control.addEventListener("focus", () => {
      const target = getControlCell(control);
      // An arrow key selects the cell before the focus moves. Do not undo a Shift range.
      if (target && target.cell !== this.endDom) {
        this.selectCell(target.cell, false);
      }
    });
    control.addEventListener("keydown", (event) =>
      this.handleCellKeyDown(event, control),
    );
    return control;
  }

  selectCell(cell: HTMLElement, extend: boolean) {
    const tablePath = getTableBlockPath(
      cell.getAttribute(DATA_CONTENT_EDITABLE_IDX),
    );
    if (tablePath) this.focusTable?.(tablePath);
    if (!extend || !this.startDom) this.startDom = cell;
    this.endDom = cell;
    this.hoveringTable = getCurrentTable(cell);
    this.renderBorder();
    const boundary = this.startDom
      ? getTdBoundaryIndex(this.startDom, cell)
      : null;
    if (boundary) {
      this.announce?.(
        `${t("Table cells selected")}: ${t("row")} ${boundary.top + 1}, ${t("column")} ${boundary.left + 1} ${t("through")} ${t("row")} ${boundary.bottom + 1}, ${t("column")} ${boundary.right + 1}.`,
      );
    }
  }

  handleCellKeyDown(event: KeyboardEvent, control: HTMLElement) {
    const target = getControlCell(control);
    if (!target) return;
    const { table, cell } = target;

    if (
      (event.key === "F10" && event.shiftKey) ||
      event.key === "ContextMenu"
    ) {
      event.preventDefault();
      this.openMenuFromKeyboard();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      this.visibleBorder(false);
      const tablePath = getTableBlockPath(
        cell.getAttribute(DATA_CONTENT_EDITABLE_IDX),
      );
      if (tablePath) {
        focusBlockSelectionSurface(control.ownerDocument, tablePath);
      }
      return;
    }
    if (event.key === "Enter" || event.key === "F2") {
      event.preventDefault();
      focusEditableAtEnd(cell);
      return;
    }
    // Leave the default action, so the browser types this key into the cell.
    if (isTypingKey(event)) {
      focusEditableAtEnd(cell);
      return;
    }
    if (!event.key.startsWith("Arrow")) return;

    const rows = Array.from(table.rows);
    const next = getTableCellTarget(
      (cell.parentElement as HTMLTableRowElement).rowIndex,
      cell.cellIndex,
      event.key,
      rows.map((row) => row.cells.length),
    );
    if (!next) return;
    event.preventDefault();
    const nextControl = getCellControl(table, next.row, next.column);
    if (!nextControl) return;
    setActiveControl(nextControl);
    this.selectCell(rows[next.row].cells[next.column], event.shiftKey);
    nextControl.focus();
  }

  // Escape in an edited cell goes back to cell selection, as in a spreadsheet.
  handleEditKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    const cell = (event.target as Element).closest?.<HTMLTableCellElement>(
      EDITABLE_CELL_SELECTOR,
    );
    const row = cell?.parentElement as HTMLTableRowElement | undefined;
    const table = cell?.closest("table");
    if (
      !cell ||
      !row ||
      !table ||
      !isTableSourceCellPath(cell.getAttribute(DATA_CONTENT_EDITABLE_IDX))
    ) {
      return;
    }
    const control = getCellControl(table, row.rowIndex, cell.cellIndex);
    if (!control) return;
    event.preventDefault();
    setActiveControl(control);
    control.focus();
  };

  updateCellSelection() {
    if (!this.selectedLeftTopCell || !this.selectedBottomRightCell) return;
    const boundary = getTdBoundaryIndex(
      this.selectedLeftTopCell,
      this.selectedBottomRightCell,
    );
    const table = getCurrentTable(this.selectedLeftTopCell) as HTMLTableElement;
    if (!boundary || !table) return;
    Array.from(table.rows).forEach((row, rowIndex) => {
      Array.from(row.cells).forEach((cell, columnIndex) => {
        const selected =
          rowIndex >= boundary.top &&
          rowIndex <= boundary.bottom &&
          columnIndex >= boundary.left &&
          columnIndex <= boundary.right;
        cell.setAttribute("aria-selected", String(selected));
      });
    });
  }

  openMenuFromKeyboard() {
    const leftTopCell = this.selectedLeftTopCell;
    const bottomRightCell = this.selectedBottomRightCell;
    if (!leftTopCell || !bottomRightCell) return;
    const boundary = getTdBoundaryIndex(leftTopCell, bottomRightCell);
    if (!boundary) return;
    if (!this.tableMenu) this.tableMenu = new TableOperationMenu();
    this.tableMenu.setTableData(this.tableData);
    this.tableMenu.changeTableData = this.changeTableData;
    this.tableMenu.announce = this.announce;
    const activeElement = getIframeDocument()?.activeElement as
      HTMLElement | null | undefined;
    this.tableMenu.returnFocus = activeElement?.hasAttribute(TABLE_CELL_CONTROL)
      ? activeElement
      : this.actionButton;
    this.tableMenu.setTableIndexBoundary(boundary);
    const rect = bottomRightCell.getBoundingClientRect();
    this.tableMenu.showMenu({ x: rect.right, y: rect.bottom });
  }

  handleContextmenu = (event: MouseEvent) => {
    const leftTopCell = this.selectedLeftTopCell;
    const bottomRightCell = this.selectedBottomRightCell;
    if (this.showBorderTool && leftTopCell && bottomRightCell) {
      const selectedBoundary = getElementsBoundary(
        leftTopCell,
        bottomRightCell,
      );
      const tdBoundaryIndex = getTdBoundaryIndex(leftTopCell, bottomRightCell);
      if (
        tdBoundaryIndex &&
        checkEventInBoundingRect(selectedBoundary, event)
      ) {
        event.preventDefault();

        if (!this.tableMenu) this.tableMenu = new TableOperationMenu();

        this.tableMenu.setTableData(this.tableData);
        this.tableMenu.changeTableData = this.changeTableData;
        this.tableMenu.announce = this.announce;
        this.tableMenu.returnFocus = this.actionButton;
        this.tableMenu.setTableIndexBoundary(tdBoundaryIndex);
        this.tableMenu.showMenu({ x: event.clientX, y: event.clientY });
        return;
      }
    }
    this.hideTableMenu();
    this.visibleBorder(false);
  };

  handleMousedown = (event: MouseEvent) => {
    if (event.button === 2) return;

    let target = event.target as Element | null;

    if (event.button === 0) {
      while (target && target.parentNode) {
        if (
          target.nodeName === "TD" &&
          target.getAttribute("data-content_editable-type") === "rich_text"
        ) {
          this.root?.addEventListener(
            "mousemove",
            this.handleDrag as EventListener,
          );
          this.root?.addEventListener(
            "mouseup",
            this.handleMouseup as EventListener,
          );

          this.dragging = true;
          // A node from the iframe fails instanceof against this window's HTMLElement.
          this.startDom = target as HTMLElement;
          this.endDom = target as HTMLElement;
          this.hoveringTable = getCurrentTable(target);
          this.renderBorder();
          return;
        }
        target = target.parentNode as Element;
        if (["TR", "TABLE", "BODY"].includes(target.nodeName)) {
          this.visibleBorder(false);
          return;
        }
      }
    }
    this.visibleBorder(false);
  };

  handleDrag = (e: MouseEvent) => {
    e.preventDefault();
    if (!this.dragging) return;

    let target = e.target as Element | null;
    while (target && target.parentNode) {
      if (
        target.nodeName === "TD" &&
        target.getAttribute("data-content_editable-type") === "rich_text"
      ) {
        const hoveringTable = getCurrentTable(target);
        if (this.endDom === target || this.hoveringTable !== hoveringTable)
          return;
        this.endDom = target as HTMLElement;
        this.renderBorder();
        return;
      }
      target = target.parentNode as Element;
    }
  };

  handleMouseup = (e: MouseEvent) => {
    e.preventDefault();
    if (!this.dragging) return;
    this.dragging = false;
    this.root?.removeEventListener(
      "mousemove",
      this.handleDrag as EventListener,
    );
    this.root?.removeEventListener(
      "mouseup",
      this.handleMouseup as EventListener,
    );
  };
}

export default TableColumnTool;
