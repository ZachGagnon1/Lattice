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
import { PropsWithChildren, useState } from "react";

interface CollapsableItemProps {
  title: string;
  headerStyle?: SxProps;
  defaultExpanded?: boolean;
}

export function CollapsableItem(
  props: PropsWithChildren<CollapsableItemProps>,
) {
  const [expanded, setExpanded] = useState(props.defaultExpanded ?? true);

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
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <Typography variant="body2">{props.title}</Typography>
        </Stack>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ ml: 1 }}>{props.children}</Box>
      </Collapse>
    </Box>
  );
}
