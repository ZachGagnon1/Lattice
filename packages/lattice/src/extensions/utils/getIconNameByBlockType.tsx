import { AdvancedType, BasicType } from "@";
import { get } from "lodash";
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

// TODO I don't really like this as a fix for the icon stuff. It's kind of scuffed but oh well.
let iconsMap = {
  [BasicType.TEXT]: <TextFieldsIcon />,
  [BasicType.SECTION]: <SplitscreenIcon />,
  [BasicType.COLUMN]: <ViewColumnIcon />,
  [BasicType.DIVIDER]: <HorizontalRuleIcon />,
  [BasicType.IMAGE]: <ImageIcon />,
  [BasicType.BUTTON]: <Crop169Icon />,
  [BasicType.GROUP]: <DataArrayIcon />,
  [BasicType.PAGE]: <NoteIcon />,
  [BasicType.WRAPPER]: <ViewDayIcon />,
  [BasicType.NAVBAR]: <MenuIcon />,
  [BasicType.HERO]: <WebIcon />,
  [BasicType.SPACER]: <DensityLargeIcon />,
  [BasicType.SOCIAL]: <TagIcon />,
  [BasicType.CAROUSEL]: <ViewCarouselIcon />,
  [BasicType.ACCORDION]: <TableRowsIcon />,
  [BasicType.TABLE]: <TableChartIcon />,
  [BasicType.CONDITION]: <AltRouteIcon />,

  [AdvancedType.TEXT]: <TextFieldsIcon />,
  [AdvancedType.DIVIDER]: <HorizontalRuleIcon />,
  [AdvancedType.IMAGE]: <ImageIcon />,
  [AdvancedType.BUTTON]: <Crop169Icon />,
  [AdvancedType.NAVBAR]: <MenuIcon />,
  [AdvancedType.SPACER]: <DensityLargeIcon />,
  [AdvancedType.SOCIAL]: <TagIcon />,
  [AdvancedType.CAROUSEL]: <ViewCarouselIcon />,
  [AdvancedType.ACCORDION]: <TableRowsIcon />,
  [AdvancedType.TABLE]: <TableChartIcon />,

  [AdvancedType.WRAPPER]: <ViewDayIcon />,
  [AdvancedType.SECTION]: <SplitscreenIcon />,
  [AdvancedType.COLUMN]: <ViewColumnIcon />,
  [AdvancedType.GROUP]: <DataArrayIcon />,
  [AdvancedType.HERO]: <WebIcon />,
};

export function getIconNameByBlockType(type: string) {
  return get(iconsMap, type) || "icon-number";
}

export function setIconsMap(map: Record<string, string>) {
  iconsMap = { ...iconsMap, ...map };
}
