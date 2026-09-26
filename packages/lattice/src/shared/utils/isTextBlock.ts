import { BasicType } from "@/domain/constants";

export function isTextBlock(blockType: any) {
  return (
    blockType === BasicType.TEXT || blockType === `advanced_${BasicType.TEXT}`
  );
}
