import mjml from "mjml-browser";
import { BasicType, BlockManager, BlockType, IBlockData, MjmlToJson } from "@";
import { htmlToTableSource } from "@/core/blocks/standard/Table/tableSource";

const domParser = new DOMParser();

export async function parseXMLtoBlock(text: string) {
  const dom = domParser.parseFromString(text, "text/xml");
  const root = dom.firstChild as Element;
  if (!(dom.firstChild instanceof Element)) {
    throw new Error("Invalid content");
  }
  if (root.tagName === "mjml") {
    const { json } = await mjml(text, {
      validationLevel: "soft",
    });

    return MjmlToJson(json);
  }

  const transform = (node: Element): IBlockData => {
    if (node.tagName === "parsererror") {
      throw new Error("Invalid content");
    }
    const attributes: IBlockData["attributes"] = {};
    node.getAttributeNames().forEach((name) => {
      attributes[name] = node.getAttribute(name);
    });
    const type = node.tagName.replace("mj-", "");

    if (!BlockManager.getBlockByType(type)) {
      if (!node.parentElement || node.parentElement.tagName !== "mj-text")
        throw new Error("Invalid content");
    }

    const block: IBlockData = {
      type: type as BlockType,
      attributes: attributes,
      data: {
        value: {
          content: node.textContent?.trim(),
        },
      },
      // Table rows are cells of the block, not child blocks.
      children:
        type === BasicType.TABLE
          ? []
          : [...node.children]
              .filter((item) => item instanceof Element)
              .map(transform as any),
    };

    switch (type) {
      case BasicType.TEXT:
        block.data.value.content = node.innerHTML;
        block.children = [];
        break;
      case BasicType.TABLE:
        block.data.value = { tableSource: htmlToTableSource(node.innerHTML) };
        break;
    }

    return block;
  };

  return transform(root);
}
