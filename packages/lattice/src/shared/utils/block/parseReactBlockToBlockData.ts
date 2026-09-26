import { IBlockData } from "@/domain/typings";
import { renderToStaticMarkup } from "react-dom/server";
import { unescape } from "lodash-es";

export function parseReactBlockToBlockData<T extends IBlockData = IBlockData>(
  node: React.ReactElement,
) {
  return JSON.parse(unescape(renderToStaticMarkup(node))) as T;
}
