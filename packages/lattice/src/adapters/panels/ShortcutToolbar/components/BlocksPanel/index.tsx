import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useHoverIdx } from "@";

import type { BlockMarketCategory } from "../../utils/BlockMarketManager";
import { BlockMarketManager } from "../../utils/BlockMarketManager";

import { defaultCategories } from "./presetTemplate";
import { Help } from "@/adapters/panels/AttributePanel/components/UI/Help";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  EditorTab,
  EditorTabPanel,
  EditorTabs,
} from "@/adapters/panels/common/EditorTabs/EditorTabs";
import styles from "./index.module.scss";

export const BlocksPanel: React.FC<{
  children: React.ReactNode | React.ReactElement;
}> = (props) => {
  const { isDragging } = useHoverIdx();
  const [visible, setVisible] = useState(false);
  const [ele, setEle] = useState<HTMLElement | null>(null);

  const [categories, setCategories] = useState<BlockMarketCategory[]>(() => {
    BlockMarketManager.addCategories(defaultCategories);
    return BlockMarketManager.getCategories();
  });

  const [activeCategoryTab, setActiveCategoryTab] = useState(0);

  useEffect(() => {
    if (!isDragging) {
      setVisible(false);
    }
  }, [isDragging]);

  useEffect(() => {
    const onChange = (c: BlockMarketCategory[]) => {
      setCategories(c);
    };
    BlockMarketManager.subscribe(onChange);
    return () => {
      (BlockMarketManager as any).unsubscribe?.(onChange);
    };
  }, []);

  const toggleVisible = useCallback(() => {
    setVisible((v) => !v);
  }, []);

  const filterCategories = useMemo(() => {
    return categories.filter((item) => item.blocks.length > 0);
  }, [categories]);

  const handleCategoryTabChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setActiveCategoryTab(newValue);
  };

  return useMemo(
    () => (
      <div ref={setEle} style={{ position: "relative" }}>
        <div onClick={toggleVisible} style={{ cursor: "pointer" }}>
          {props.children}
        </div>

        {ele &&
          visible &&
          createPortal(
            <Paper
              elevation={6}
              className={styles.BlocksPanel}
              sx={{
                pointerEvents: isDragging ? "none" : undefined,
                position: "fixed",
                width: isDragging ? 0 : 650,
                backgroundColor: "background.paper",
                zIndex: 200,
                left: 60,
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "width 0.5s ease-in-out",
                borderRadius: 2,
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2,
                  py: 1.5,
                  borderBottom: 1,
                  borderColor: "divider",
                  bgcolor: "grey.50",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t("Drag block")}
                </Typography>
                <IconButton
                  size="small"
                  onClick={toggleVisible}
                  sx={{ color: "text.secondary" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Body - Vertical Layout */}
              <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
                {/* Category Tabs (Left) */}
                <EditorTabs
                  orientation="vertical"
                  value={activeCategoryTab}
                  onChange={handleCategoryTabChange}
                  sx={{
                    borderBottom: 0,
                    borderRight: 1,
                    borderColor: "divider",
                    minWidth: 120,
                    px: 0,
                  }}
                >
                  {filterCategories.map((category) => (
                    <EditorTab
                      key={category.title}
                      label={category.title}
                      sx={{
                        mr: 0,
                        py: 2,
                        minHeight: "auto",
                        alignItems: "flex-end",
                      }}
                    />
                  ))}
                </EditorTabs>

                {/* Category Content Area (Right) */}
                <Box sx={{ flexGrow: 1, overflow: "hidden", display: "flex" }}>
                  {filterCategories.map((category, index) => (
                    <EditorTabPanel
                      key={category.title}
                      value={activeCategoryTab}
                      index={index}
                      destroyOnHide
                    >
                      <BlockPanelItem category={category} />
                    </EditorTabPanel>
                  ))}
                </Box>
              </Box>
            </Paper>,
            ele,
          )}
      </div>
    ),
    [
      filterCategories,
      ele,
      isDragging,
      props.children,
      toggleVisible,
      visible,
      activeCategoryTab,
    ],
  );
};

// --- Sub-component rendering the internal blocks ---
const BlockPanelItem: React.FC<{
  category: BlockMarketCategory;
}> = React.memo((props) => {
  const [activeBlockTab, setActiveBlockTab] = useState(0);

  const handleBlockTabChange = (
    _event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setActiveBlockTab(newValue);
  };

  return (
    <Box sx={{ display: "flex", width: "100%", height: "500px" }}>
      {/* Nested Block Tabs (Left) */}
      <EditorTabs
        orientation="vertical"
        value={activeBlockTab}
        onChange={handleBlockTabChange}
        sx={{
          borderBottom: 0,
          borderRight: 1,
          borderColor: "divider",
          minWidth: 160,
          px: 0,
        }}
      >
        {props.category.blocks.map((block) => (
          <EditorTab
            key={block.title}
            sx={{ mr: 0, py: 1.5, minHeight: "auto", alignItems: "flex-end" }}
            label={
              <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                <Typography variant="body2">{block.title}</Typography>
                {block.description && <Help title={block.description} />}
              </Stack>
            }
          />
        ))}
      </EditorTabs>

      {/* Actual Draggable Blocks Rendering Area (Right) */}
      <Box
        className="small-scrollbar"
        sx={{
          flexGrow: 1,
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          p: 3,
          pr: 2,
        }}
      >
        {props.category.blocks.map((block, index) => (
          <EditorTabPanel
            key={block.title}
            value={activeBlockTab}
            index={index}
            destroyOnHide={false}
          >
            {block.component && <block.component />}
          </EditorTabPanel>
        ))}
      </Box>
    </Box>
  );
});
