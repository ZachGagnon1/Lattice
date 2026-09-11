import { IOperationData } from "./type";

export interface ITableOperationMenu {
  tableData: IOperationData[][];
  tableIndexBoundary: any;
  maxTdCount: number;
  changeTableData?: (data: IOperationData[][]) => void;
  addRow: (index: number, count: number) => void;
  hide: () => void;
}

const MENU_CONFIG: Record<
  string,
  { text: string; icon?: string; handler: Function }
> = {
  insertColumnRight: {
    text: "Insert column right",
    icon: `<svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#595959" d="M73.142857 336.64h526.628572v43.885714H73.142857zM73.142857 643.657143h526.628572v43.885714H73.142857zM336.457143 117.028571h43.885714v789.942858h-43.885714zM204.8 73.142857h614.4a131.657143 131.657143 0 0 1 131.657143 131.657143v614.4a131.657143 131.657143 0 0 1-131.657143 131.657143H204.8A131.657143 131.657143 0 0 1 73.142857 819.2V204.8A131.84 131.84 0 0 1 204.8 73.142857z m0 43.885714a87.771429 87.771429 0 0 0-87.771429 87.771429v614.4a87.771429 87.771429 0 0 0 87.771429 87.771429h614.4a87.771429 87.771429 0 0 0 87.771429-87.771429V204.8a87.771429 87.771429 0 0 0-87.771429-87.771429zM819.2 73.142857h-219.428571v877.714286h219.428571a131.657143 131.657143 0 0 0 131.657143-131.657143V204.8A131.84 131.84 0 0 0 819.2 73.142857z m44.068571 460.982857h-65.828571v65.828572H753.371429v-65.828572h-65.828572V490.057143h65.828572v-65.828572h44.068571v65.828572h65.828571z"/></svg>`,
    handler() {
      const _this = this as unknown as ITableOperationMenu;
      const right = _this.tableIndexBoundary.right;
      _this.tableData.forEach((tr) => {
        if (right === _this.maxTdCount - 1) {
          tr.push({ content: "-" } as any);
          return;
        }
        if (tr.length === 0) return tr.push({ content: "-" } as any);
        for (let index = 0; index < tr.length; index++) {
          const tdLeft = tr[index].left || 0;
          const tdRight = tr[index].right || 0;
          if (tdRight === right) { tr.splice(index + 1, 0, { content: "-" } as any); break; }
          if (tdLeft <= right && tdRight > right && tr[index].colSpan) { tr[index].colSpan = (tr[index].colSpan || 1) + 1; break; }
          if (tdLeft > right && tdLeft - 1 === right) { tr.splice(index, 0, { content: "-" } as any); break; }
          if (tdLeft > right) break;
        }
      });
      _this.changeTableData?.(_this.tableData);
    },
  },
  insertColumnLeft: {
    text: "Insert column left",
    icon: `<svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#595959" d="M380.342857 336.457143h526.811429v43.885714H380.342857z m0 307.2h526.811429v43.885714H380.342857zM643.657143 117.028571h43.885714v789.942858h-43.885714zM204.8 73.142857h614.582857A131.474286 131.474286 0 0 1 950.857143 204.8v614.4a131.657143 131.657143 0 0 1-131.657143 131.657143H204.8A131.657143 131.657143 0 0 1 73.142857 819.2V204.8A131.657143 131.657143 0 0 1 204.8 73.142857z m0 43.885714a87.588571 87.588571 0 0 0-87.588571 87.771429v614.4a87.588571 87.588571 0 0 0 87.588571 87.771429h614.582857a87.771429 87.771429 0 0 0 87.771429-87.771429V204.8a87.771429 87.771429 0 0 0-87.771429-87.771429zM204.8 73.142857A131.657143 131.657143 0 0 0 73.142857 204.8v614.4a131.657143 131.657143 0 0 0 131.657143 131.657143h219.428571V73.142857z m131.84 460.8h-65.828571v65.828572h-43.885715v-65.828572h-65.828571v-43.885714h65.828571v-65.828572h43.885715v65.828572h65.828571z"/></svg>`,
    handler() {
      const _this = this as unknown as ITableOperationMenu;
      const left = _this.tableIndexBoundary.left;
      _this.tableData.forEach((tr) => {
        if (left === 0) { tr.unshift({ content: "-" } as any); return; }
        if (tr.length === 0) return tr.push({ content: "-" } as any);
        for (let index = 0; index < tr.length; index++) {
          const tdLeft = tr[index].left || 0;
          const tdRight = tr[index].right || 0;
          if (tdLeft === left) { tr.splice(index, 0, { content: "-" } as any); break; }
          if (tdLeft < left && tdRight >= left && tr[index].colSpan) { tr[index].colSpan = (tr[index].colSpan || 1) + 1; break; }
          if (tdLeft > left && tr[index - 1] && (tr[index - 1].right || 0) + 1 === left) { tr.splice(index, 0, { content: "-" } as any); break; }
          if (tdLeft > left) break;
        }
      });
      _this.changeTableData?.(_this.tableData);
    },
  },
  insertRowUp: {
    text: "Insert row up",
    icon: `<svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#595959" d="M73.142857 599.771429h877.714286v43.885714H73.142857zM336.457143 380.342857h43.885714v526.628572h-43.885714z m307.2 0h43.885714v526.628572h-43.885714zM204.8 73.142857h614.4a131.657143 131.657143 0 0 1 131.657143 131.657143v614.4a131.657143 131.657143 0 0 1-131.657143 131.657143H204.8A131.657143 131.657143 0 0 1 73.142857 819.2V204.8A131.657143 131.657143 0 0 1 204.8 73.142857z m0 43.885714a87.771429 87.771429 0 0 0-87.771429 87.771429v614.4a87.588571 87.588571 0 0 0 87.771429 87.771429h614.4a87.588571 87.588571 0 0 0 87.771429-87.771429V204.8a87.771429 87.771429 0 0 0-87.771429-87.771429zM819.2 73.142857H204.8A131.657143 131.657143 0 0 0 73.142857 204.8v219.428571h877.714286v-219.428571A131.657143 131.657143 0 0 0 819.2 73.142857z m-219.428571 197.485714h-65.828572v65.828572h-43.885714v-65.828572h-65.828572v-43.885714h65.828572V160.914286h43.885714v65.828571h65.828572z"/></svg>`,
    handler() {
      const _this = this as unknown as ITableOperationMenu;
      const top = _this.tableIndexBoundary.top;
      let maxTdCount = _this.maxTdCount;
      if (_this.tableData[top].length < maxTdCount) {
        for (let index = top - 1; index > -1; index--) {
          const tr = _this.tableData[index];
          tr.forEach((td) => {
            if (td.bottom && td.bottom >= top) { td.rowSpan = (td.rowSpan || 1) + 1; maxTdCount -= td.colSpan || 1; }
          });
          if (tr.length === maxTdCount) break;
        }
      }
      _this.addRow(top, maxTdCount);
    },
  },
  insertRowDown: {
    text: "Insert row down",
    icon: `<svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#595959" d="M204.8 73.142857h614.4a131.657143 131.657143 0 0 1 131.657143 131.657143v614.4a131.657143 131.657143 0 0 1-131.657143 131.657143H204.8A131.657143 131.657143 0 0 1 73.142857 819.2V204.8A131.84 131.84 0 0 1 204.8 73.142857z m0 43.885714a87.771429 87.771429 0 0 0-87.771429 87.771429v614.4a87.771429 87.771429 0 0 0 87.771429 87.771429h614.4a87.771429 87.771429 0 0 0 87.771429-87.771429V204.8a87.771429 87.771429 0 0 0-87.771429-87.771429zM73.142857 336.457143h877.714286v44.068571H73.142857zM336.64 117.028571h43.885714v526.628572h-43.885714z m307.017143 0h44.068571v526.628572H643.657143zM73.142857 599.771429v219.428571a131.657143 131.657143 0 0 0 131.657143 131.657143h614.4a131.657143 131.657143 0 0 0 131.657143-131.657143v-219.428571z m526.628572 197.485714h-65.645715v65.828571H490.057143v-65.828571h-65.828572v-43.885714h65.828572v-65.828572h44.068571v65.828572h65.645715z"/></svg>`,
    handler() {
      const _this = this as unknown as ITableOperationMenu;
      let addCount = _this.maxTdCount;
      const bottom = _this.tableIndexBoundary.bottom;
      if (_this.tableData[bottom].length < _this.maxTdCount) {
        for (let index = bottom - 1; index > -1; index--) {
          const tr = _this.tableData[index];
          if (tr.length === _this.maxTdCount) break;
          tr.forEach((td) => {
            if (td.bottom && td.bottom > bottom) { td.rowSpan = (td.rowSpan || 1) + 1; addCount -= td.colSpan || 1; }
          });
        }
      }
      _this.tableData[bottom].forEach((e) => {
        if (e.rowSpan && e.rowSpan > 1) { e.rowSpan += 1; addCount -= e.colSpan || 1; }
      });
      _this.addRow(bottom + 1, addCount);
    },
  },
  mergeCells: {
    text: "Merge selected cells",
    icon: `<svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#595959" d="M925.99596 99.038384c-25.470707-25.6-60.121212-39.822222-96.323233-39.822222H194.19798c-36.072727 0-70.723232 14.351515-96.323233 39.822222-25.6 25.6-39.822222 60.121212-39.822222 96.323232v635.474748c0 36.072727 14.351515 70.723232 39.822222 96.323232C123.474747 952.759596 158.125253 967.111111 194.19798 967.111111h635.474747c36.072727 0 70.723232-14.351515 96.323233-39.951515 25.6-25.6 39.951515-60.121212 39.951515-96.323232V195.361616c0-36.072727-14.351515-70.723232-39.951515-96.323232z"/></svg>`,
    handler() {
      const _this = this as unknown as ITableOperationMenu;
      const { top, left, bottom, right } = _this.tableIndexBoundary;
      const leftTopItem = _this.tableData[top].find((e) => e.left === left) as IOperationData;
      leftTopItem.rowSpan = bottom - top + 1;
      leftTopItem.colSpan = right - left + 1;
      _this.tableData.forEach((tr, trIndex) => {
        if (trIndex >= top && trIndex <= bottom) {
          if (bottom > top && trIndex > top && trIndex <= bottom) leftTopItem.content += "<br />";
          const deletedIndex: number[] = [];
          tr.forEach((td, tdIndex) => {
            if (top === trIndex && left === td.left) return;
            if (td.left >= left && td.right <= right) { leftTopItem.content += " " + td.content; deletedIndex.push(tdIndex); }
          });
          if (deletedIndex.length > 0) tr.splice(deletedIndex[0], deletedIndex[deletedIndex.length - 1] - deletedIndex[0] + 1);
        }
      });
      _this.changeTableData?.(_this.tableData);
    },
  },
  deleteColumn: {
    text: "Delete selected columns",
    icon: `<svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#595959" d="M925.996 99.038c-25.47-25.6-60.121-39.822-96.323-39.822H194.198c-75.12.13-136.016 61.026-136.145 136.146v635.345c0 36.073 14.351 70.723 39.822 96.323 25.6 25.73 60.25 40.081 96.323 40.081h635.475c36.072 0 70.723-14.351 96.323-39.951 25.6-25.6 39.951-60.122 39.951-96.324V195.362c0-36.073-14.351-70.724-39.951-96.324z"/></svg>`,
    handler() {
      const _this = this as unknown as ITableOperationMenu;
      const { left, right } = _this.tableIndexBoundary;
      _this.tableData.forEach((tr) => {
        const deleteIds: number[] = [];
        for (let index = 0; index < tr.length; index++) {
          const td = tr[index];
          const tdLeft = tr[index].left || 0;
          const tdRight = tr[index].right || 0;
          const colSpan = td.colSpan || 1;
          if (tdLeft > right) break;
          if (tdLeft >= left && tdRight <= right) { deleteIds.push(index); continue; }
          if (tdLeft <= left && tdRight >= right) { td.colSpan = colSpan - (right - left) - 1; continue; }
          if (tdLeft > left && tdRight >= right) { td.colSpan = colSpan - (right - tdLeft) - 1; continue; }
          if (tdLeft < left && tdRight >= left) { td.colSpan = colSpan - (tdRight - left) - 1; continue; }
        }
        if (deleteIds.length) tr.splice(deleteIds[0], deleteIds[deleteIds.length - 1] - deleteIds[0] + 1);
      });
      _this.changeTableData?.(_this.tableData);
    },
  },
  deleteRow: {
    text: "Delete selected rows",
    icon: `<svg width="20" height="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="#595959" d="M925.99596 99.038384c-25.470707-25.6-60.121212-39.822222-96.323233-39.822222H194.19798c-36.072727 0-70.723232 14.351515-96.323233 39.822222-25.6 25.6-39.822222 60.121212-39.822222 96.323232v635.474748c0 36.072727 14.351515 70.723232 39.822222 96.323232C123.474747 952.759596 158.125253 967.111111 194.19798 967.111111h635.474747c36.072727 0 70.723232-14.351515 96.323233-39.951515 25.6-25.6 39.951515-60.121212 39.951515-96.323232V195.361616c0-36.072727-14.351515-70.723232-39.951515-96.323232z"/></svg>`,
    handler() {
      const _this = this as unknown as ITableOperationMenu;
      const { top, bottom } = _this.tableIndexBoundary;
      const deleteCount = bottom - top + 1;
      for (let index = bottom - 1; index > -1; index--) {
        const tr = _this.tableData[index];
        tr.forEach((td) => {
          if (td.bottom && td.bottom >= top) {
            const deleteRowSpan = td.bottom >= bottom ? deleteCount : td.bottom - top + 1;
            td.rowSpan = (td.rowSpan || 1) - deleteRowSpan;
          }
        });
      }
      for (let index = top; index <= bottom; index++) {
        const tr = _this.tableData[index];
        tr.forEach((td) => {
          const rowSpan = td.rowSpan || 1;
          if (rowSpan - 1 + top > bottom) {
            const nextRowCell = { ...td, rowSpan: rowSpan - (bottom - top + 1) };
            const nextRow = _this.tableData[bottom + 1];
            if (nextRow) {
              const idx = Array.from({ length: _this.maxTdCount }).findIndex((_, i) => i === nextRowCell.left);
              if (idx > -1) nextRow.splice(idx, 0, nextRowCell);
            }
          }
        });
      }
      _this.tableData.splice(_this.tableIndexBoundary.top, deleteCount);
      _this.changeTableData?.(_this.tableData);
    },
  },
  setCellBg: {
    text: "Set Background",
    handler(color: string) {
      const _this = this as unknown as ITableOperationMenu;
      const { top, bottom, left, right } = _this.tableIndexBoundary;
      _this.tableData.forEach((tr) => {
        for (let index = 0; index < tr.length; index++) {
          const td = tr[index];
          const tdTop = tr[index].top || 0;
          const tdBottom = tr[index].bottom || 0;
          const tdLeft = tr[index].left || 0;
          const tdRight = tr[index].right || 0;
          if (tdLeft > right) break;
          if (top <= tdTop && bottom >= tdBottom && left <= tdLeft && right >= tdRight) {
            td.backgroundColor = color;
          }
        }
      });
      _this.changeTableData?.(_this.tableData);
      _this.hide();
    },
  },
};

export default MENU_CONFIG;
