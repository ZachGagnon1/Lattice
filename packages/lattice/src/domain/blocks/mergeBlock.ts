import { IBlockData, RecursivePartial } from "@/domain/typings";
import { isArray, mergeWith } from "lodash-es";

export function mergeBlock<T extends IBlockData>(
  a: T,
  b?: RecursivePartial<T>,
): T {
  return mergeWith(a, b, (a, b) => (isArray(b) ? b : undefined));
}
