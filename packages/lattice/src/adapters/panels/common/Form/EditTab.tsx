import React, { useState } from "react";
import { Box, IconButton, styled, Tab, Tabs } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

export interface EditTabProps<T> {
  value?: Array<T>;
  renderItem: (item: T, index: number) => React.ReactNode;
  onChange: (vals: Array<T>) => never;
  additionItem: T;
  label: string;
}

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: theme.typography.fontWeightMedium,
  fontSize: theme.typography.pxToRem(14),
  minWidth: 0,
  minHeight: 0,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  "&.Mui-selected": {
    fontWeight: theme.typography.fontWeightBold,
  },
  "& .MuiTab-iconWrapper": {
    fontSize: "1.5rem",
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  "& .MuiTabs-flexContainer": {
    gap: theme.spacing(1),
  },
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const TabPane = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderTop: "none",
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(-1),
  position: "relative",
  overflow: "auto",
}));

export function EditTab<T>(props: EditTabProps<T>) {
  const { value = [], additionItem, label, renderItem } = props;
  const [activeTab, setActiveTab] = useState(0);

  const tabValues = !Array.isArray(value) ? [] : value;

  const onAddTab = () => {
    const newIndex = value.length;
    setActiveTab(newIndex);
    props.onChange([...value, additionItem]);
  };

  const onDeleteTab = (index: number) => {
    const numIndex = index;
    if (Number(numIndex) < Number(activeTab)) {
      setActiveTab(activeTab - 1);
    }
    if (numIndex === activeTab) {
      setActiveTab(numIndex > 0 ? numIndex - 1 : 0);
    }
    props.onChange(value.filter((_, vIndex) => index !== vIndex));
  };

  return (
    <Box>
      <StyledTabs
        value={activeTab}
        onChange={(_, newValue: number) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabValues.map((item, index) => (
          <StyledTab
            key={index}
            value={index}
            tabIndex={-1}
            sx={{
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <span>{`${label || "Tab"} ${index + 1}`}</span>
                {tabValues.length > 1 && (
                  <Box
                    component="span"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents tab from being selected
                      e.preventDefault();
                      onDeleteTab(index);
                    }}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 20,
                      height: 20,
                      ml: 0.5,
                      borderRadius: "50%",
                      cursor: "pointer",
                      "&:hover": {
                        color: "error.main",
                        backgroundColor: "rgba(0, 0, 0, 0.04)", // subtle hover effect
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: "1rem" }} />
                  </Box>
                )}
              </Box>
            }
          />
        ))}
        {/* Note: This IconButton is fine because it is outside the Tabs! */}
        <IconButton
          onClick={onAddTab}
          sx={{
            width: 36,
            height: 36,
            ml: 0.5,
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          <AddIcon />
        </IconButton>
      </StyledTabs>
      {tabValues[Number(activeTab)] !== undefined && (
        <TabPane>
          <Box sx={{ p: 2 }}>
            {renderItem(tabValues[Number(activeTab)], Number(activeTab))}
          </Box>
        </TabPane>
      )}
    </Box>
  );
}
