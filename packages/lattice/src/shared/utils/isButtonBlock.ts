import { BasicType } from "@/domain/constants";

export function isButtonBlock(blockType: any) {
  return blockType === BasicType.BUTTON;
}
