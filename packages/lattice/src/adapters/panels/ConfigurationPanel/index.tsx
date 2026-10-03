import React, { useEffect, useState } from "react";
import { AttributePanel } from "@/adapters/panels/AttributePanel";
import { SourceCodePanel } from "@/adapters/panels/SourceCodePanel";
import { FullHeightOverlayScrollbars } from "@/adapters/panels/common/FullHeightOverlayScrollbars";
import { Box } from "@mui/material";
// Adjust import path to where you placed the components
import {
  EditorTab,
  EditorTabPanel,
  EditorTabs,
} from "@/adapters/panels/common/EditorTabs/EditorTabs";
import { getTabA11yProps } from "@/shared/utils/accessibility";
import {
  focusBlockSettingsWhenReady,
  OPEN_BLOCK_SETTINGS_EVENT,
} from "@/shared/utils/blockSettingsNavigation";

export interface ConfigurationPanelProps {
  showSourceCode: boolean;
  jsonReadOnly: boolean;
  mjmlReadOnly: boolean;
  height: string;
  onBack?: () => void;
}

export function ConfigurationPanel({
  showSourceCode,
  height,
  jsonReadOnly,
  mjmlReadOnly,
}: ConfigurationPanelProps) {
  const [activeTab, setActiveTab] = useState(0);
  const tabId = React.useId();

  useEffect(() => {
    const openBlockSettings = () => {
      setActiveTab(0);
      focusBlockSettingsWhenReady(document);
    };
    document.addEventListener(OPEN_BLOCK_SETTINGS_EVENT, openBlockSettings);
    return () =>
      document.removeEventListener(
        OPEN_BLOCK_SETTINGS_EVENT,
        openBlockSettings,
      );
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!showSourceCode) {
    return <AttributePanel />;
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <EditorTabs value={activeTab} onChange={handleTabChange}>
        <EditorTab label={t("Configuration")} {...getTabA11yProps(tabId, 0)} />
        <EditorTab label={t("Source code")} {...getTabA11yProps(tabId, 1)} />
      </EditorTabs>

      <EditorTabPanel
        idPrefix={tabId}
        value={activeTab}
        index={0}
        destroyOnHide
      >
        <FullHeightOverlayScrollbars height={`calc(${height} - 60px)`}>
          <AttributePanel />
        </FullHeightOverlayScrollbars>
      </EditorTabPanel>

      <EditorTabPanel
        idPrefix={tabId}
        value={activeTab}
        index={1}
        destroyOnHide
      >
        <FullHeightOverlayScrollbars height={`calc(${height} - 60px)`}>
          <SourceCodePanel
            jsonReadOnly={jsonReadOnly}
            mjmlReadOnly={mjmlReadOnly}
          />
        </FullHeightOverlayScrollbars>
      </EditorTabPanel>
    </Box>
  );
}
