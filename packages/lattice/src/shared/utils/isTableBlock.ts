import { BasicType } from "@/domain/constants";

export function isTableBlock(blockType: any) {
  return blockType === BasicType.TABLE;
}
