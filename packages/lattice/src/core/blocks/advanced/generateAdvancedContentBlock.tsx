import { Column, Section } from "@/core/components";
import { AdvancedType, BasicType } from "@/core/constants";
import { BlockManager, getParentByIdx } from "@/core/utils";
import React from "react";
import { generateAdvancedBlock } from "./generateAdvancedBlock";
import { getPreviewClassName } from "@/core/utils/getPreviewClassName";
import { IBlockData } from "@";
import { classnames } from "@/utils/classnames";

export function generateAdvancedContentBlock<T extends IBlockData>(option: {
  type: string;
  baseType: BasicType;
}) {
  return generateAdvancedBlock<T>({
    ...option,

    validParentType: [
      BasicType.PAGE,
      BasicType.WRAPPER,
      BasicType.COLUMN,
      BasicType.GROUP,
      BasicType.HERO,
      BasicType.CONDITION,

      AdvancedType.WRAPPER,
      AdvancedType.COLUMN,
      AdvancedType.GROUP,
      AdvancedType.HERO,
    ],
    getContent: (params) => {
      const { data, idx, mode, context, index } = params;

      const previewClassName =
        mode === "testing"
          ? classnames(
              index === 0 && idx && getPreviewClassName(idx, data.type),
            )
          : "";

      const blockData = {
        ...data,
        type: option.baseType,
        attributes: {
          ...data.attributes,
          "css-class": classnames(
            data.attributes["css-class"],
            previewClassName,
          ),
        },
      };

      const block = BlockManager.getBlockByType(blockData.type);
      if (!block) {
        throw new Error(`Can not find ${blockData.type}`);
      }

      const children = block?.render({ ...params, data: blockData, idx });

      const parentBlockData = getParentByIdx({ content: context! }, idx!);
      if (!parentBlockData) {
        return children;
      }

      if (
        parentBlockData.type === BasicType.PAGE ||
        parentBlockData.type === BasicType.WRAPPER ||
        parentBlockData.type === AdvancedType.WRAPPER ||
        parentBlockData.type === BasicType.CONDITION
      ) {
        return (
          <Section padding="0px" text-align="left">
            <Column>{children}</Column>
          </Section>
        );
      }

      return children;
    },
  });
}
