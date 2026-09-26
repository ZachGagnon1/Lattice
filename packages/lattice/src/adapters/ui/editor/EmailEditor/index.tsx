import React, { useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { EASY_EMAIL_EDITOR_ID, FIXED_CONTAINER_ID } from "@/constants";
import { useActiveTab } from "@/application/hooks/useActiveTab";
import { ActiveTabKeys } from "../../Provider/BlocksProvider";
import { DesktopEmailPreview } from "./components/DesktopEmailPreview";
import { MobileEmailPreview } from "./components/MobileEmailPreview";
import { EditEmailPreview } from "./components/EditEmailPreview";
import { ToolsPanel } from "./components/ToolsPanel";
import { useEditorProps } from "@/application/hooks/useEditorProps";
import { EventManager, EventType } from "@/shared/utils/EventManager";
import { getIframeDocument } from "@/shared/utils";

import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import EditIcon from "@mui/icons-material/Edit";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";

(window as any).global = window;

export const EmailEditor = () => {
  const { height: containerHeight } = useEditorProps();
  const { setActiveTab, activeTab } = useActiveTab();
  const iframeDocument = getIframeDocument();

  const fixedContainer = useMemo(() => {
    if (!iframeDocument?.body) return null;

    return createPortal(<div id={FIXED_CONTAINER_ID} />, iframeDocument.body);
  }, [iframeDocument]);

  const onBeforeChangeTab = useCallback((currentTab: any, nextTab: any) => {
    return EventManager.exec(EventType.ACTIVE_TAB_CHANGE, {
      currentTab,
      nextTab,
    });
  }, []);

  const onChangeTab = useCallback(
    (nextTab: string) => {
      setActiveTab(nextTab as any);
    },
    [setActiveTab],
  );

  // MUI uses a single onChange handler that passes the event and the new value.
  const handleTabChange = useCallback(
    async (event: React.SyntheticEvent, newValue: string) => {
      const canChange = await onBeforeChangeTab(activeTab, newValue);

      // Prevent changing if the event manager explicitly returns false
      if (canChange !== false) {
        onChangeTab(newValue);
      }
    },
    [activeTab, onBeforeChangeTab, onChangeTab],
  );

  return useMemo(
    () => (
      <Box
        id={EASY_EMAIL_EDITOR_ID}
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: "1",
          overflow: "hidden",
          minWidth: 640,
          height: containerHeight,
          width: "100%",
        }}
      >
        {/* Header containing Tabs and Extra Content */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: 1,
            borderColor: "divider",
            backgroundColor: "background.paper", // Optional: ensures solid background
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="email editor views"
          >
            <Tab
              icon={<EditIcon />}
              value={ActiveTabKeys.EDIT}
              aria-label="Edit Layout"
              sx={{ minWidth: "72px" }} // Keeps tabs compact like your Stack layout
            />
            <Tab
              icon={<DesktopWindowsOutlinedIcon />}
              value={ActiveTabKeys.PC}
              aria-label="View PC Layout"
              sx={{ minWidth: "72px" }}
            />
            <Tab
              icon={<PhoneAndroidIcon />}
              value={ActiveTabKeys.MOBILE}
              aria-label="View Mobile Layout"
              sx={{ minWidth: "72px" }}
            />
          </Tabs>

          {/* ToolsPanel naturally sits on the right side due to space-between */}
          <Box sx={{ pr: 2 }}>
            <ToolsPanel />
          </Box>
        </Box>

        {/* Content Panes */}
        <Box
          sx={{
            flex: 1,
            height: "calc(100% - 50px)",
            position: "relative",
            overflow: "hidden",
            display: "flex", // Centers content if your inner components rely on it
            justifyContent: "center",
          }}
        >
          {activeTab === ActiveTabKeys.EDIT && <EditEmailPreview />}
          {activeTab === ActiveTabKeys.PC && <DesktopEmailPreview />}
          {activeTab === ActiveTabKeys.MOBILE && <MobileEmailPreview />}
        </Box>

        <>{fixedContainer}</>
      </Box>
    ),
    [activeTab, containerHeight, fixedContainer, handleTabChange],
  );
};
