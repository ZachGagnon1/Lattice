import React, { useRef, useState } from "react";
import { Box, IconButton, Stack, styled, Tab, Tabs } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { getTabA11yProps } from "@/shared/utils/accessibility";
import {
  getActiveIndexAfterRemoval,
  getRepeatItemLabel,
} from "@/shared/utils/repeatItemAccessibility";

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
  const idPrefix = React.useId();
  const focusIndexRef = useRef<number | null>(null);

  const tabValues = !Array.isArray(value) ? [] : value;

  const onAddTab = () => {
    const newIndex = tabValues.length;
    setActiveTab(newIndex);
    focusIndexRef.current = newIndex;
    props.onChange([...tabValues, additionItem]);
  };

  const onDeleteTab = (index: number) => {
    const nextIndex = getActiveIndexAfterRemoval(
      activeTab,
      index,
      tabValues.length,
    );
    setActiveTab(nextIndex);
    focusIndexRef.current = nextIndex;
    props.onChange(tabValues.filter((_, vIndex) => index !== vIndex));
  };

  React.useEffect(() => {
    if (focusIndexRef.current === null) return;
    document
      .getElementById(`${idPrefix}-tab-${focusIndexRef.current}`)
      ?.focus();
    focusIndexRef.current = null;
  }, [idPrefix, tabValues.length]);

  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center" }}>
        <StyledTabs
          value={activeTab}
          onChange={(_, newValue: number) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          selectionFollowsFocus
          sx={{ flex: 1 }}
        >
          {tabValues.map((_item, index) => (
            <StyledTab
              key={index}
              value={index}
              {...getTabA11yProps(idPrefix, index)}
              sx={{
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                "&:hover": { backgroundColor: "action.hover" },
              }}
              label={getRepeatItemLabel(label || "Tab", index)}
            />
          ))}
        </StyledTabs>
        {tabValues.length > 1 && (
          <IconButton
            aria-label={`Remove ${getRepeatItemLabel(label, activeTab)}`}
            onClick={() => onDeleteTab(activeTab)}
          >
            <CloseIcon aria-hidden="true" />
          </IconButton>
        )}
        <IconButton
          aria-label={`Add ${label || "item"}`}
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
          <AddIcon aria-hidden="true" />
        </IconButton>
      </Stack>
      {tabValues[Number(activeTab)] !== undefined && (
        <TabPane
          role="tabpanel"
          id={`${idPrefix}-tabpanel-${activeTab}`}
          aria-labelledby={`${idPrefix}-tab-${activeTab}`}
        >
          <Box sx={{ p: 2 }}>
            {renderItem(tabValues[Number(activeTab)], Number(activeTab))}
          </Box>
        </TabPane>
      )}
    </Box>
  );
}
