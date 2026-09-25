import React from "react";
import { BasicType, BlockManager } from "@";
import TagIcon from "@mui/icons-material/Tag";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import ImageIcon from "@mui/icons-material/Image";
import DensityLargeIcon from "@mui/icons-material/DensityLarge";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import Crop169Icon from "@mui/icons-material/Crop169";
import NoteIcon from "@mui/icons-material/Note";
import TableChartIcon from "@mui/icons-material/TableChart";
import MenuIcon from "@mui/icons-material/Menu";
import DataArrayIcon from "@mui/icons-material/DataArray";
import SplitscreenIcon from "@mui/icons-material/Splitscreen";
import WebIcon from "@mui/icons-material/Web";
import ViewDayIcon from "@mui/icons-material/ViewDay";
import TableRowsIcon from "@mui/icons-material/TableRows";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import LoopIcon from "@mui/icons-material/Loop";
import CodeIcon from "@mui/icons-material/Code";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import TitleIcon from "@mui/icons-material/Title";
import NotesIcon from "@mui/icons-material/Notes";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WidgetsIcon from "@mui/icons-material/Widgets";

let iconsMap: Record<string, React.ReactElement> = {
  [BasicType.PAGE]: <NoteIcon />,
  [BasicType.SECTION]: <SplitscreenIcon />,
  [BasicType.COLUMN]: <ViewColumnIcon />,
  [BasicType.GROUP]: <DataArrayIcon />,
  [BasicType.TEXT]: <TextFieldsIcon />,
  [BasicType.IMAGE]: <ImageIcon />,
  [BasicType.DIVIDER]: <HorizontalRuleIcon />,
  [BasicType.SPACER]: <DensityLargeIcon />,
  [BasicType.BUTTON]: <Crop169Icon />,
  [BasicType.WRAPPER]: <ViewDayIcon />,
  [BasicType.RAW]: <CodeIcon />,
  [BasicType.ACCORDION]: <TableRowsIcon />,
  [BasicType.ACCORDION_ELEMENT]: <ViewAgendaIcon />,
  [BasicType.ACCORDION_TITLE]: <TitleIcon />,
  [BasicType.ACCORDION_TEXT]: <NotesIcon />,
  [BasicType.HERO]: <WebIcon />,
  [BasicType.CAROUSEL]: <ViewCarouselIcon />,
  [BasicType.NAVBAR]: <MenuIcon />,
  [BasicType.SOCIAL]: <TagIcon />,
  [BasicType.TABLE]: <TableChartIcon />,
  [BasicType.CONDITION]: <AltRouteIcon />,
  [BasicType.CONDITION_BRANCH]: <SubdirectoryArrowRightIcon />,
  [BasicType.FOR_LOOP]: <LoopIcon />,
  [BasicType.TEMPLATE]: <DashboardIcon />,
};

export function getIconNameByBlockType(type: string): React.ReactElement {
  // Old templates store legacy names such as "advanced_text"; BlockManager maps them to the block type.
  const blockType = BlockManager.getBlockByType(type)?.type ?? type;
  return iconsMap[blockType] ?? <WidgetsIcon />;
}

export function setIconsMap(map: Record<string, React.ReactElement>) {
  iconsMap = { ...iconsMap, ...map };
}
