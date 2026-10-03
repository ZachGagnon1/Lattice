import { useEditorProps, useFocusIdx } from "@";
import React, { useEffect } from "react";
import { InteractivePrompt } from "../InteractivePrompt";
import { MergeTagBadgePrompt } from "@/adapters/panels/MergeTagBadgePrompt";
import { EditPanel } from "../EditPanel";
import { ConfigurationPanel } from "@/adapters/panels/ConfigurationPanel";
import {
  ExtensionProps,
  ExtensionProvider,
} from "@/adapters/panels/common/Providers/ExtensionProvider";
import { Box, Grid, Paper, useMediaQuery, useTheme } from "@mui/material";
import { getEditorRegionLabels } from "@/shared/utils/editorRegions";

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
  const { setFocusIdx } = useFocusIdx();

  // The side panels show from the md breakpoint (900px) up.
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    // Below md the side panels hide, so a selection has no panel to show in.
    if (!isDesktop) {
      setFocusIdx("");
    }
  }, [isDesktop, setFocusIdx]);

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
          <a href="#lattice-blocks-region">
            {t("Go to")} {labels.blocks}
          </a>
          <a href="#lattice-canvas-region">
            {t("Go to")} {labels.canvas}
          </a>
          <a href="#lattice-configuration-region">
            {t("Go to")} {labels.configuration}
          </a>
        </Box>
        <Grid
          container
          sx={{
            height: "100%",
            // Stacks items on mobile, forces them onto one row on desktop
            flexWrap: { xs: "wrap", md: "nowrap" },
          }}
        >
          {/* LEFT PANEL: Editor Tools */}
          <Grid
            component="aside"
            id="lattice-blocks-region"
            aria-label={labels.blocks}
            tabIndex={-1}
            size={{ xs: 12, md: 2.5 }} // Explicit size ensures it doesn't get crushed
            sx={{
              display: { xs: "none", md: "block" }, // Hides completely on mobile
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
            size={{ xs: 12, md: 7 }} // 7/12 columns on desktop
            sx={{
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
            size={{ xs: 12, md: 2.5 }} // 3/12 columns on desktop (2 + 7 + 3 = 12 total columns)
            sx={{
              display: { xs: "none", md: "block" }, // Hides completely on mobile
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
