import React from "react";
import { createRoot, Root } from "react-dom/client";
import {
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
} from "@mui/material";
import { getIframeDocument } from "@";
import { IBoundingPosition, IOperationData } from "./type";
import MENU_CONFIG from "./tableMenuConfig";
import { getCorrectTableIndexBoundary, getMaxTdCount } from "./util";
import { CellBackgroundSelector } from "./tableCellBgSelector";
import { IframeCacheProvider } from "@/components/Provider/IframeCacheProvider";

const MENU_HEIGHT = 305;
const MENU_WIDTH = 250;

export default class TableOperationMenu {
  menuItems = MENU_CONFIG;
  domNode: HTMLDivElement | null = null;
  root: Root | null = null;
  visible = false;

  changeTableData?: (e: IOperationData[][]) => void;
  tableData: IOperationData[][] = [];
  tableIndexBoundary = {} as IBoundingPosition;
  maxTdCount = 0;

  constructor() {
    this.mount();
  }

  mount() {
    const iframeDocument = getIframeDocument();
    if (!iframeDocument) return;

    this.domNode = iframeDocument.createElement("div");
    this.domNode.style.position = "absolute";
    this.domNode.style.zIndex = "9999";
    this.domNode.style.display = "none";

    iframeDocument.body.appendChild(this.domNode);
    this.root = createRoot(this.domNode);

    this.handleGlobalClick = this.handleGlobalClick.bind(this);
    iframeDocument.addEventListener("click", this.handleGlobalClick, true);
  }

  handleGlobalClick(e: Event) {
    if (!this.visible || !this.domNode) return;
    const target = e.target as HTMLElement;
    if (this.domNode.contains(target)) return;
    if (target.closest(".MuiPopover-root") || target.closest(".sketch-picker"))
      return;
    this.hide();
  }

  destroy() {
    const iframeDocument = getIframeDocument();
    if (this.root) this.root.unmount();
    if (this.domNode) this.domNode.remove();
    if (iframeDocument) {
      iframeDocument.removeEventListener("click", this.handleGlobalClick, true);
    }
  }

  hide() {
    if (!this.visible) return;
    this.visible = false;
    if (this.domNode) this.domNode.style.display = "none";
  }

  addRow(insertIndex: number, colCount: number) {
    const newRow = Array.from({ length: colCount }).map(
      () => ({ content: "-" }) as any,
    );
    this.tableData.splice(insertIndex, 0, newRow);
    this.changeTableData?.(this.tableData);
  }

  setTableData(tableData: IOperationData[][]) {
    this.tableData = tableData || [];
    this.maxTdCount = getMaxTdCount(this.tableData);
  }

  setTableIndexBoundary(tableIndexBoundary: IBoundingPosition) {
    this.tableIndexBoundary = getCorrectTableIndexBoundary(
      tableIndexBoundary,
      this.tableData,
    );
  }

  showMenu({ x, y }: { x: number; y: number }) {
    this.visible = true;

    const iframeDocument = getIframeDocument();
    if (!iframeDocument) return;

    const maxHeight = iframeDocument.body.clientHeight;
    const maxWidth = iframeDocument.body.clientWidth;

    if (maxWidth - MENU_WIDTH < x) x -= MENU_WIDTH;
    if (maxHeight - MENU_HEIGHT < y) y -= MENU_HEIGHT;

    if (this.domNode) {
      this.domNode.style.display = "block";
      this.domNode.style.left = `${x}px`;
      this.domNode.style.top = `${y}px`;
    }

    this.renderReact();
  }

  renderReact() {
    if (!this.root) return;

    this.root.render(
      <IframeCacheProvider>
        <Paper elevation={3} sx={{ width: MENU_WIDTH, overflow: "visible" }}>
          <MenuList dense sx={{ py: 1 }}>
            {Object.entries(this.menuItems).map(([key, config]) => {
              if (key === "setCellBg") {
                return (
                  <CellBackgroundSelector
                    key={key}
                    bgColorHandler={config.handler.bind(this)}
                    rootDom={getIframeDocument()?.body}
                  />
                );
              }

              const isDividing = ["insertRowDown", "deleteRow"].includes(key);

              return (
                <React.Fragment key={key}>
                  <MenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      config.handler.bind(this)();
                      this.hide();
                    }}
                    sx={{ py: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: "36px !important" }}>
                      <span
                        dangerouslySetInnerHTML={{ __html: config.icon || "" }}
                        style={{ display: "flex", width: 20, height: 20 }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={config.text} sx={{ fontSize: 14 }} />
                  </MenuItem>
                  {isDividing && <Divider sx={{ my: 0.5 }} />}
                </React.Fragment>
              );
            })}
          </MenuList>
        </Paper>
      </IframeCacheProvider>,
    );
  }
}
