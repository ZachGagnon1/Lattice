import { IBlock } from "@/domain/typings";
import { EMAIL_BLOCK_CLASS_NAME } from "@/domain/constants";

import { isString } from "lodash-es";

import {
  getNodeIdxClassName,
  getNodeTypeClassName,
} from "@/shared/utils/block";
import { classnames } from "@/shared/utils/classnames";

export function getAdapterAttributesString(
  params: Parameters<IBlock["render"]>[0],
) {
  const { data, idx } = params;
  const isTest = params.mode === "testing";
  const attributes = { ...data.attributes };
  const keepClassName = isTest ? params.keepClassName : false;

  if (isTest && idx) {
    attributes["css-class"] = classnames(
      attributes["css-class"],
      EMAIL_BLOCK_CLASS_NAME,
      getNodeIdxClassName(idx),
      getNodeTypeClassName(data.type),
    );
  }

  if (keepClassName) {
    attributes["css-class"] = classnames(
      attributes["css-class"],
      getNodeTypeClassName(data.type),
    );
  }

  let attributeStr = "";
  for (let key in attributes) {
    const keyName = key as keyof typeof attributes;
    const val = attributes[keyName];
    if (isString(val) && val) {
      const splitter = " ";
      attributeStr += `${key}="${val.replace(/"/gm, "")}"` + splitter;
    }
  }

  return attributeStr;
}
