import TableOperationMenu from "./TableOperationMenu";
import {
  checkEventInBoundingRect,
  getBoundaryRectAndElement,
  getCurrentTable,
  getElementsBoundary,
  getTdBoundaryIndex,
  setStyle,
} from "./util";
import { ITableCellData } from "@/core/blocks";
import { getIframeDocument } from "@";

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

  selectedLeftTopCell: Element | undefined = undefined;
  selectedBottomRightCell: Element | undefined = undefined;
  startDom: Element | undefined = undefined;
  endDom: Element | undefined = undefined;
  hoveringTable: ParentNode | null = null;
  root: Element | undefined = undefined;

  tableMenu?: TableOperationMenu;
  changeTableData?: (e: ITableCellData[][]) => void;
  tableData: ITableCellData[][] = [];

  constructor(borderTool: IBorderTool, root: Element) {
    if (!borderTool || !root) return;
    this.borderTool = borderTool;
    this.root = root;
    this.initTool();
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
    this.tableMenu?.destroy();
  }

  hideBorder = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "TD" || target.tagName === "TH") return;
    this.visibleBorder(false);
  };

  hideBorderByKeyDown = () => this.visibleBorder(false);

  hideTableMenu = (e?: MouseEvent) => {
    const target = e?.target as HTMLElement;
    if (target?.id === "VisualEditorEditMode") return;
    this.tableMenu?.hide();
  };

  visibleBorder = (show = true) => {
    if (this.showBorderTool === show) return;
    const parent = this.borderTool.top?.parentElement;
    if (!parent) return;
    setStyle(parent, { display: show ? "block" : "none" });
    this.showBorderTool = show;
  };

  renderBorder = () => {
    if (!this.borderTool.top) return;
    this.visibleBorder(true);
    const result = getBoundaryRectAndElement(
      this.startDom as Element,
      this.endDom as Element,
    );
    if (!result) return;

    const { left, top, width, height } = result.boundary;
    this.selectedLeftTopCell = result.leftTopCell;
    this.selectedBottomRightCell = result.bottomRightCell;

    const borderStyles = {
      backgroundColor: "rgb(65, 68, 77)",
      position: "absolute",
      zIndex: 9999,
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
  };

  handleContextmenu = (event: MouseEvent) => {
    if (this.showBorderTool) {
      const selectedBoundary = getElementsBoundary(
        this.selectedLeftTopCell as Element,
        this.selectedBottomRightCell as Element,
      );
      const tdBoundaryIndex = getTdBoundaryIndex(
        this.selectedLeftTopCell as Element,
        this.selectedBottomRightCell as Element,
      );
      if (
        tdBoundaryIndex &&
        checkEventInBoundingRect(selectedBoundary, event)
      ) {
        event.preventDefault();

        if (!this.tableMenu) this.tableMenu = new TableOperationMenu();

        this.tableMenu.setTableData(this.tableData as any);
        this.tableMenu.changeTableData = this.changeTableData;
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
          this.startDom = target;
          this.endDom = target;
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
        this.endDom = target;
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
