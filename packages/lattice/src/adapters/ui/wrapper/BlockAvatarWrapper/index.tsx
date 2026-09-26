import React, { useCallback, useEffect, useRef } from "react";
import { BlockType, getChildIdx } from "@";
import { useHoverIdx } from "@/application/hooks/useHoverIdx";
import { useDataTransfer } from "@/application/hooks/useDataTransfer";
import { isUndefined } from "lodash-es";
import { useBlock } from "@/application/hooks/useBlock";

export type BlockAvatarWrapperProps = {
  children?: React.ReactNode;
  type: BlockType | string;
  payload?: any;
  action?: "add" | "move";
  idx?: string;
};

export const BlockAvatarWrapper: React.FC<BlockAvatarWrapperProps> = (
  props,
) => {
  const { type, children, payload, action = "add", idx } = props;
  const { addBlock, moveBlock } = useBlock();
  const { setIsDragging, setHoverIdx } = useHoverIdx();
  const { setDataTransfer, dataTransfer } = useDataTransfer();
  const ref = useRef<HTMLDivElement>(null);

  const onDragStart = useCallback(
    (ev: React.DragEvent) => {
      // Force the browser to recognize this as a valid drag payload
      if (ev.dataTransfer) {
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData("text/plain", type);
      }

      if (action === "add") {
        setDataTransfer({ type, action, payload });
      } else {
        setDataTransfer({ type, action, sourceIdx: idx });
      }

      setIsDragging(true);
    },
    [action, idx, payload, setDataTransfer, setIsDragging, type],
  );

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    setHoverIdx("");

    if (!dataTransfer) return;

    if (action === "add" && !isUndefined(dataTransfer.parentIdx)) {
      addBlock({
        type,
        parentIdx: dataTransfer.parentIdx,
        positionIndex: dataTransfer.positionIndex,
        payload,
      });
    } else if (
      idx &&
      !isUndefined(dataTransfer.sourceIdx) &&
      !isUndefined(dataTransfer.parentIdx) &&
      !isUndefined(dataTransfer.positionIndex)
    ) {
      moveBlock(
        dataTransfer.sourceIdx,
        getChildIdx(dataTransfer.parentIdx, dataTransfer.positionIndex),
      );
    }
  }, [
    action,
    addBlock,
    idx,
    moveBlock,
    dataTransfer,
    payload,
    setHoverIdx,
    setIsDragging,
    type,
  ]);

  useEffect(() => {
    const ele = ref.current;
    if (!ele) return;

    ele.addEventListener("dragend", onDragEnd);
    return () => {
      ele.removeEventListener("dragend", onDragEnd);
    };
  }, [onDragEnd]);

  return (
    <div
      ref={ref}
      draggable="true"
      onDragStart={onDragStart}
      onMouseDown={() => {
        window.getSelection()?.removeAllRanges();
      }}
      data-type={type}
      style={
        {
          cursor: "grab !important",
          width: "stretch",
          pointerEvents: "auto",
          display: "inline-block",
          "&:active": {
            cursor: "grabbing !important",
          },
        } as any
      }
    >
      {children}
    </div>
  );
};
