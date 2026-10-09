import {
  Box,
  Collapse,
  IconButton,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { PropsWithChildren, useId, useState } from "react";
import { useEditorProps } from "@/application/hooks/useEditorProps";
import { getHeadingComponent } from "@/shared/utils/accessibility";

interface CollapsableItemProps {
  title: string;
  headerStyle?: SxProps;
  defaultExpanded?: boolean;
  /** Takes the toggle out of the Tab order, for content that only a pointer can use. */
  pointerOnly?: boolean;
}

export function CollapsableItem(
  props: PropsWithChildren<CollapsableItemProps>,
) {
  const [expanded, setExpanded] = useState(props.defaultExpanded ?? true);
  const { headingLevel = 2 } = useEditorProps();
  const contentId = useId();

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={
          props.headerStyle ?? {
            borderBottom: "1px solid #ccc",
            mb: 2,
          }
        }
      >
        <Stack direction="row" sx={{ alignItems: "center" }}>
          <IconButton
            aria-label={`${expanded ? t("Collapse") : t("Expand")} ${props.title}`}
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded(!expanded)}
            tabIndex={props.pointerOnly ? -1 : undefined}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <Typography
            component={getHeadingComponent(headingLevel, 1)}
            variant="body2"
          >
            {props.title}
          </Typography>
        </Stack>
      </Box>
      <Collapse id={contentId} in={expanded}>
        <Box sx={{ ml: 1 }}>{props.children}</Box>
      </Collapse>
    </Box>
  );
}
