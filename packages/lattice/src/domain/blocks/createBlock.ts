import { IBlock, IBlockData } from "@/domain/typings";

export function createBlock<T extends IBlockData>(block: IBlock<T>): IBlock<T> {
  return block;
}
