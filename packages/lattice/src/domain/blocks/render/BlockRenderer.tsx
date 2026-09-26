import { IBlock } from "@/domain/typings";
import { BlockManager } from "@/domain/blocks/BlockManager";
import { useEmailRenderContext } from "@/domain/compile/JsonToMjml";
import React from "react";

type BlockDataItem = Omit<
  Parameters<IBlock["render"]>[0],
  "mode" | "context" | "dataSource"
>;

export const BlockRenderer = (props: BlockDataItem) => {
  const { data } = props;
  const { mode, context, dataSource } = useEmailRenderContext();
  if (data.data.hidden) return null;
  const block = BlockManager.getBlockByType(data.type);
  if (!block) return null;
  return <>{block.render({ ...props, mode, context, dataSource })}</>;
};
