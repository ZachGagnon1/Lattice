import { IBlock, IBlockData } from "@/core/typings";
import { standardBlocks } from "@/core/blocks";

export class BlockManager {
  private static blocksMap: Record<string, IBlock> = {
    ...standardBlocks,
  };
  private static autoCompletePath: { [key: string]: Array<string[]> } = {};

  public static getBlocks(): Array<IBlock> {
    return Object.values(this.blocksMap);
  }

  public static registerBlocks(blocksMap: { [key: string]: IBlock }) {
    this.blocksMap = {
      ...this.blocksMap,
      ...blocksMap,
    };
    this.autoCompletePath = this.setAutoCompletePath();
  }

  public static getBlockByType<T extends IBlockData>(
    type: string,
  ): IBlock<T> | undefined {
    const block =
      this.blocksMap[type] ?? this.blocksMap[this.toBasicType(type)];
    return block as IBlock<any> as IBlock<T> | undefined;
  }

  /** Maps a legacy `advanced_` type string to the basic block type. */
  public static toBasicType(type: string): string {
    return type.startsWith("advanced_") ? type.replace("advanced_", "") : type;
  }

  /** Accepts a legacy `advanced_` parent type, which old templates and the layout presets still store. */
  public static isValidParent(block: IBlock, parentType: string): boolean {
    return block.validParentType.includes(this.toBasicType(parentType));
  }

  public static getBlocksByType(
    types: Array<string>,
  ): Array<IBlock | undefined> {
    return types.map((item) => {
      const block = Object.values(this.blocksMap).find((child) => {
        return child.type === item;
      });

      return block;
    });
  }

  public static getAutoCompleteFullPath() {
    if (Object.keys(this.autoCompletePath).length === 0) {
      this.autoCompletePath = this.setAutoCompletePath();
    }
    return this.autoCompletePath;
  }

  static getAutoCompletePath(
    type: string,
    targetType: string,
  ): Array<string> | null {
    const block = this.getBlockByType(type);
    if (!block) {
      throw new Error(`Can you register ${type} block`);
    }
    const basicTargetType = this.toBasicType(targetType);
    if (block.validParentType.includes(basicTargetType)) {
      return [];
    }
    const paths = this.getAutoCompleteFullPath()[block.type].find((item) =>
      item.filter((_, index) => index !== 0).includes(basicTargetType),
    );

    if (!paths) return null;
    const findIndex = paths.findIndex((item) => item === basicTargetType);
    return paths.slice(1, findIndex);
  }

  private static setAutoCompletePath() {
    const paths: { [key: string]: Array<string[]> } = {};

    const renderFullPath = (
      type: string,
      pathObj: Array<string[]>,
      prevPaths: string[],
    ): any => {
      if (prevPaths.includes(type)) return;
      const block = this.getBlockByType(type);
      if (!block) {
        throw new Error(`Can you register ${type} block`);
      }
      const currentPaths = [...prevPaths, type];
      if (block.validParentType.length === 0) {
        pathObj.push(currentPaths);
      }
      return block.validParentType.map((item) => {
        return renderFullPath(item, pathObj, currentPaths);
      });
    };

    Object.values(this.blocksMap).forEach((item) => {
      paths[item.type] = [];
      renderFullPath(item.type, paths[item.type], []);
    });
    return paths;
  }
}
