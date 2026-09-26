import React from "react";
import { Box, Tab, TabProps, Tabs, TabsProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { StyledComponent } from "@emotion/styled";

// Unified Tab Container
export const EditorTabs = styled((props: TabsProps) => (
  <Tabs textColor="inherit" indicatorColor="primary" {...props} />
))(({ theme }) => ({
  minHeight: 48,
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(0, 2), // Gives a nice horizontal breathing room
})) as StyledComponent<TabsProps>;

// Unified Tab Item
export const EditorTab = styled((props: TabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  textTransform: "none",
  fontWeight: 600,
  minHeight: 48,
  minWidth: 0,
  marginRight: theme.spacing(2),
  "&:last-child": {
    marginRight: 0,
  },
})) as StyledComponent<TabProps>;

// Universal Tab Panel (Handles both hidden and destroyOnHide states)
export interface EditorTabPanelProps {
  children?: React.ReactNode;
  index: number | string;
  value: number | string;
  destroyOnHide?: boolean;
}

export function EditorTabPanel(props: EditorTabPanelProps) {
  const { children, value, index, destroyOnHide = true, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`editor-tabpanel-${index}`}
      aria-labelledby={`editor-tab-${index}`}
      sx={{ height: "100%", flexGrow: 1, overflow: "hidden" }}
      {...other}
    >
      {/* If destroyOnHide is true, it unmounts the children. Otherwise it just hides them via CSS */}
      {destroyOnHide ? value === index && children : children}
    </Box>
  );
}
