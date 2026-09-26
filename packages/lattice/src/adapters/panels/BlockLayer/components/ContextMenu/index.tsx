import React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import {
  getIndexByIdx,
  getSiblingIdx,
  IBlockDataWithId,
  scrollBlockEleIntoView,
  TextStyle,
  useBlock,
  useEditorProps,
} from "@";
import { useAddToCollection } from "@/application/hooks/useAddToCollection";

export function ContextMenu({
  moveBlock,
  copyBlock,
  removeBlock,
  contextMenuData,
  onClose,
}: Readonly<{
  onClose: (ev?: React.MouseEvent | React.SyntheticEvent | {}) => void;
  moveBlock: ReturnType<typeof useBlock>["moveBlock"];
  copyBlock: ReturnType<typeof useBlock>["copyBlock"];
  removeBlock: ReturnType<typeof useBlock>["removeBlock"];
  contextMenuData: {
    blockData: IBlockDataWithId;
    left: number;
    top: number;
  };
}>) {
  const { blockData, left, top } = contextMenuData;
  const idx = blockData.id;

  const { modal, modalVisible, setModalVisible } = useAddToCollection();
  const props = useEditorProps();

  const handleMoveUp = () => {
    moveBlock(idx, getSiblingIdx(idx, -1));
    scrollBlockEleIntoView({
      idx: getSiblingIdx(idx, -1),
    });
    onClose();
  };

  const handleMoveDown = () => {
    moveBlock(idx, getSiblingIdx(idx, 1));
    scrollBlockEleIntoView({
      idx: getSiblingIdx(idx, 1),
    });
    onClose();
  };

  const handleCopy = () => {
    copyBlock(idx);
    scrollBlockEleIntoView({
      idx: getSiblingIdx(idx, 1),
    });
    onClose();
  };

  const handleAddToCollection = () => {
    // Keeps the menu mounted so the modal doesn't unmount,
    // but the sx prop below hides the menu visuals
    setModalVisible(true);
  };

  const handleDelete = () => {
    removeBlock(idx);
    onClose();
  };

  const isFirst = getIndexByIdx(idx) === 0;

  return (
    <>
      <Menu
        open={true}
        onClose={onClose}
        // This is the key to using a Popover/Menu as a right-click Context Menu
        anchorReference="anchorPosition"
        anchorPosition={{ top, left }}
        // Hides the menu when the modal is open, mirroring your previous logic
        sx={{ visibility: modalVisible ? "hidden" : "visible" }}
        // Preserves your custom right-click backdrop behavior
        slotProps={{
          backdrop: {
            onContextMenu: (e) => {
              e.preventDefault();
              onClose(e);
            },
          },
        }}
      >
        {!isFirst && (
          <MenuItem onClick={handleMoveUp}>
            <ListItemIcon>
              <ArrowUpwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              disableTypography
              primary={<TextStyle>{t("Move up")}</TextStyle>}
            />
          </MenuItem>
        )}

        <MenuItem onClick={handleMoveDown}>
          <ListItemIcon>
            <ArrowDownwardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            disableTypography
            primary={<TextStyle>{t("Move down")}</TextStyle>}
          />
        </MenuItem>

        <MenuItem onClick={handleCopy}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            disableTypography
            primary={<TextStyle>{t("Copy")}</TextStyle>}
          />
        </MenuItem>

        {props.onAddCollection && (
          <MenuItem onClick={handleAddToCollection}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              disableTypography
              primary={<TextStyle>Add to collection</TextStyle>}
            />
          </MenuItem>
        )}

        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            disableTypography
            primary={<TextStyle>{t("Delete")}</TextStyle>}
          />
        </MenuItem>
      </Menu>

      {/* Renders the modal side-by-side with the Menu so it stays mounted */}
      {modal}
    </>
  );
}
