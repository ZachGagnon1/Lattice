import React, { useContext } from "react";
import { useBlock, useFocusIdx } from "@";
import { BasicType } from "@/domain/constants";
import { MoveBlockContext } from "@/adapters/ui/Provider/MoveBlockProvider";
import { useEditorStatus } from "./useEditorStatus";
import {
  MovePlacement,
  resolveMoveTarget,
} from "@/shared/utils/panel/resolveMoveTarget";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import CloseIcon from "@mui/icons-material/Close";

export interface MoveBlockAction {
  key: string;
  title: string;
  icon: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}

const PLACEMENTS: Array<{
  placement: MovePlacement;
  title: string;
  icon: React.ReactNode;
}> = [
  { placement: "before", title: "Move before", icon: <VerticalAlignTopIcon /> },
  {
    placement: "after",
    title: "Move after",
    icon: <VerticalAlignBottomIcon />,
  },
  {
    placement: "inside",
    title: "Move inside",
    icon: <SubdirectoryArrowRightIcon />,
  },
];

/** The toolbar actions of move mode, which replaces a drag with a click or a key press. */
export function useMoveBlockActions(): MoveBlockAction[] {
  const { sourceIdx, setSourceIdx } = useContext(MoveBlockContext);
  const { values, focusBlock, moveBlock } = useBlock();
  const { focusIdx } = useFocusIdx();
  const { announce } = useEditorStatus();

  if (!sourceIdx) {
    if (focusBlock?.type === BasicType.PAGE) return [];
    return [
      {
        key: "move",
        title: t("Move block"),
        icon: <OpenWithIcon />,
        disabled: false,
        onClick: () => {
          setSourceIdx(focusIdx);
          announce(
            t(
              "Move mode. Select the destination block, then choose Move before, Move after, or Move inside. Press Escape to cancel.",
            ),
          );
        },
      },
    ];
  }

  const cancel: MoveBlockAction = {
    key: "cancel",
    title: t("Cancel the move"),
    icon: <CloseIcon />,
    disabled: false,
    onClick: () => {
      setSourceIdx(null);
      announce(t("The move is canceled"));
    },
  };
  if (sourceIdx === focusIdx) return [cancel];

  const placements = PLACEMENTS.map(({ placement, title, icon }) => {
    const destinationIdx = resolveMoveTarget({
      values,
      sourceIdx,
      targetIdx: focusIdx,
      placement,
    });
    return {
      key: placement,
      title: t(title),
      icon,
      disabled: !destinationIdx,
      onClick: () => {
        if (!destinationIdx) return;
        setSourceIdx(null);
        moveBlock(sourceIdx, destinationIdx);
      },
    };
  });
  return [...placements, cancel];
}
