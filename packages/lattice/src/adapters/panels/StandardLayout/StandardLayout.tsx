import { useEditorProps } from "@";
import React, { useEffect, useState } from "react";
import { InteractivePrompt } from "../InteractivePrompt";
import { MergeTagBadgePrompt } from "@/adapters/panels/MergeTagBadgePrompt";
import { EditPanel } from "../EditPanel";
import { ConfigurationPanel } from "@/adapters/panels/ConfigurationPanel";
import {
  ExtensionProps,
  ExtensionProvider,
} from "@/adapters/panels/common/Providers/ExtensionProvider";
import {
  Box,
  Grid,
  Paper,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  getEditorRegionLabels,
  PALETTE_HINT_ID,
} from "@/shared/utils/editorRegions";
import {
  EditorRegion,
  NarrowEditorRegion,
  showEditorRegion,
} from "@/shared/utils/responsiveEditor";
import {
  CLOSE_BLOCK_SETTINGS_EVENT,
  OPEN_BLOCK_SETTINGS_EVENT,
} from "@/shared/utils/blockSettingsNavigation";

export const StandardLayout: React.FC<ExtensionProps> = (props) => {
  const { height: containerHeight } = useEditorProps();
  const {
    showSourceCode = true,
    categories,
    jsonReadOnly = false,
    mjmlReadOnly = true,
    regionLabels = {},
  } = props;
  const labels = getEditorRegionLabels(regionLabels);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [activeRegion, setActiveRegion] = useState<EditorRegion>("canvas");

  // A narrow layout shows one region, so the block settings shortcut must switch it.
  useEffect(() => {
    if (isDesktop) return;
    const showConfiguration = () => setActiveRegion("configuration");
    const showCanvas = () => setActiveRegion("canvas");
    document.addEventListener(OPEN_BLOCK_SETTINGS_EVENT, showConfiguration);
    document.addEventListener(CLOSE_BLOCK_SETTINGS_EVENT, showCanvas);
    return () => {
      document.removeEventListener(
        OPEN_BLOCK_SETTINGS_EVENT,
        showConfiguration,
      );
      document.removeEventListener(CLOSE_BLOCK_SETTINGS_EVENT, showCanvas);
    };
  }, [isDesktop]);

  const goToRegion = (
    event: React.MouseEvent<HTMLAnchorElement>,
    region: EditorRegion,
  ) => {
    if (!isDesktop) {
      event.preventDefault();
      setActiveRegion(region);
      requestAnimationFrame(() => {
        document.getElementById(`lattice-${region}-region`)?.focus();
      });
    }
  };

  return (
    <ExtensionProvider {...props} categories={categories}>
      <Paper
        sx={{
          padding: 0,
          height: containerHeight,
          position: "relative",
          overflow: "hidden", // Keeps the layout contained
        }}
      >
        <Box
          component="nav"
          aria-label={labels.navigation}
          sx={{
            position: "absolute",
            zIndex: 10000,
            "& a": {
              position: "absolute",
              left: 8,
              top: 8,
              transform: "translateY(-200%)",
              backgroundColor: "background.paper",
              color: "text.primary",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              px: 1.5,
              py: 1,
              whiteSpace: "nowrap",
            },
            "& a:focus": { transform: "translateY(0)" },
          }}
        >
          {isDesktop && (
            <a href="#lattice-blocks-region">
              {t("Go to")} {labels.blocks}
            </a>
          )}
          <a
            href="#lattice-canvas-region"
            onClick={(event) => goToRegion(event, "canvas")}
          >
            {t("Go to")} {labels.canvas}
          </a>
          <a
            href="#lattice-configuration-region"
            onClick={(event) => goToRegion(event, "configuration")}
          >
            {t("Go to")} {labels.configuration}
          </a>
        </Box>
        {!isDesktop && (
          <Tabs
            value={activeRegion}
            onChange={(_, value: NarrowEditorRegion) => setActiveRegion(value)}
            variant="fullWidth"
            aria-label={labels.navigation}
            sx={{ minHeight: 44 }}
          >
            <Tab
              value="canvas"
              label={labels.canvas}
              sx={{ minWidth: 0, px: 0.5, flex: 1, fontSize: "0.72rem" }}
            />
            <Tab
              value="configuration"
              label={labels.configuration}
              sx={{ minWidth: 0, px: 0.5, flex: 1, fontSize: "0.72rem" }}
            />
          </Tabs>
        )}
        <Grid
          container
          sx={{
            height: isDesktop ? "100%" : "calc(100% - 44px)",
            flexWrap: "nowrap",
          }}
        >
          {/* LEFT PANEL: Editor Tools */}
          <Grid
            component="aside"
            id="lattice-blocks-region"
            aria-describedby={PALETTE_HINT_ID}
            aria-label={labels.blocks}
            tabIndex={-1}
            size={{ xs: 12, md: 2.5 }}
            sx={{
              display: showEditorRegion(isDesktop, activeRegion, "blocks")
                ? "block"
                : "none",
              height: "100%",
              overflowY: "auto", // Allows independent scrolling if panel content gets long
            }}
          >
            <EditPanel />
          </Grid>

          <Grid
            component="section"
            role="region"
            id="lattice-canvas-region"
            aria-label={labels.canvas}
            tabIndex={-1}
            size={{ xs: 12, md: 7 }}
            sx={{
              display: showEditorRegion(isDesktop, activeRegion, "canvas")
                ? "block"
                : "none",
              height: "100%",
              overflowY: "auto",
            }}
          >
            {props.children}
          </Grid>

          <Grid
            component="aside"
            id="lattice-configuration-region"
            aria-label={labels.configuration}
            tabIndex={-1}
            size={{ xs: 12, md: 2.5 }}
            sx={{
              display: showEditorRegion(
                isDesktop,
                activeRegion,
                "configuration",
              )
                ? "block"
                : "none",
              height: "100%",
              overflowY: "auto",
            }}
          >
            <ConfigurationPanel
              height={containerHeight}
              showSourceCode={showSourceCode}
              jsonReadOnly={jsonReadOnly}
              mjmlReadOnly={mjmlReadOnly}
            />
          </Grid>
        </Grid>
      </Paper>
      <InteractivePrompt />
      <MergeTagBadgePrompt />
    </ExtensionProvider>
  );
};
