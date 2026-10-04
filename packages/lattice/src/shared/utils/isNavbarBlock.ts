import { BasicType } from "@/domain/constants";

export function isNavbarBlock(blockType: any) {
  return blockType === BasicType.NAVBAR;
}
