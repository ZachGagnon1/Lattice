import { Box, Grid, Paper, Typography } from "@mui/material";
import {
  BasicType,
  BlockAvatarWrapper,
  BlockManager,
  getIconNameByBlockType,
  IBlockData,
} from "@";
import React, { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useExtensionProps } from "@/extensions/components/Providers/ExtensionProvider";
import { CollapsableItem } from "@/extensions/components/Collapse/CollapsableItem";

export function Blocks() {
  const { categories } = useExtensionProps();

  return (
    <Box sx={{ paddingBottom: 30, minHeight: "100%" }}>
      {categories.map((cat, index) => {
        if (cat.displayType === "column") {
          return (
            <CollapsableItem key={cat.displayType + index} title={cat.label}>
              <>
                {cat.blocks.map((item) => (
                  <LayoutItem
                    key={item.title}
                    title={item.title ?? ""}
                    columns={item.payload}
                  />
                ))}
                <Box sx={{ mb: 2 }} />
              </>
            </CollapsableItem>
          );
        }

        if (cat.displayType === "custom") {
          return (
            <CollapsableItem key={cat.displayType + index} title={cat.label}>
              <Grid container spacing={2}>
                {cat.blocks.map((item, index) => {
                  return <React.Fragment key={index}>{item}</React.Fragment>;
                })}
              </Grid>
            </CollapsableItem>
          );
        }
        return (
          <CollapsableItem
            key={cat.displayType ?? "" + index}
            title={cat.label}
          >
            <Grid container spacing={1} sx={{ justifyContent: "center" }}>
              {cat.blocks.map((item, index) => {
                return (
                  <Grid key={index}>
                    <BlockItem
                      {...(item as {
                        type: string;
                        payload?: any;
                        title?: string | undefined;
                      })}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </CollapsableItem>
        );
      })}
    </Box>
  );
}

function BlockItem({
  type,
  payload,
  title,
}: {
  type: string;
  payload?: Partial<IBlockData>;
  title?: string;
}) {
  const block = BlockManager.getBlockByType(type);

  return (
    <Paper sx={{ cursor: "grab !important" }}>
      <BlockAvatarWrapper type={type} payload={payload}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "75px",
            height: "75px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          {getIconNameByBlockType(type)}
          <Typography variant="body2" sx={{ marginTop: 1 }}>
            {title ?? block?.name}
          </Typography>
        </Box>
      </BlockAvatarWrapper>
    </Paper>
  );
}

function LayoutItem({
  columns,
  title,
}: {
  columns: string[][];
  title: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Box>
      <Box
        onClick={() => setVisible((v) => !v)}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          "&:hover": {
            backgroundColor: "action.hover",
          },
          px: 1,
          py: 1,
          borderRadius: 1,
        }}
      >
        <Typography variant="body2">{title}</Typography>
        <Typography>
          {visible ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </Typography>
      </Box>
      <Box
        sx={{
          height: visible ? "auto" : 0,
          overflow: "hidden",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
        }}
      >
        {columns.map((item, index) => {
          const hide = !visible && index !== 0;
          const payload = {
            type: BasicType.SECTION,
            attributes: {},
            children: item.map((col) => ({
              type: BasicType.COLUMN,
              attributes: {
                width: col,
              },
              data: {
                value: {},
              },
              children: [],
            })),
          };

          return (
            <Box
              key={index}
              sx={{
                marginBottom: hide ? 0 : 2,
                opacity: hide ? 0 : 1,
                transition: "opacity 0.2s ease-in-out",
                cursor: "grab !important",
              }}
            >
              <BlockAvatarWrapper type={BasicType.SECTION} payload={payload}>
                <Box
                  sx={{
                    border: "1px solid #e0e0e0",
                    padding: 1,
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      height: 16,
                      border: "1px solid #555",
                      borderRadius: 3,
                      display: "flex",
                    }}
                  >
                    {item.map((column, index) => {
                      return (
                        <Box
                          key={index}
                          sx={{
                            borderRight:
                              index === item.length - 1
                                ? undefined
                                : "1px solid #555",
                            height: "100%",
                            width: column,
                          }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              </BlockAvatarWrapper>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
