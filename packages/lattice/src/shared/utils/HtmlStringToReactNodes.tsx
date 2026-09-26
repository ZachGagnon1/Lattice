import { camelCase } from "lodash-es";
import React, { ReactNode } from "react";
import {
  BasicType,
  getContentEditableClassName,
  getNodeIdxFromClassName,
  getNodeTypeFromClassName,
  isTextBlock,
  MERGE_TAG_CLASS_NAME,
  MergeTagBadge,
} from "@";
import {
  ContentEditableType,
  DATA_CONTENT_EDITABLE_IDX,
  DATA_CONTENT_EDITABLE_TYPE,
} from "@/constants";
import { isButtonBlock } from "./isButtonBlock";
import {
  getContentEditableIdxFromClassName,
  getContentEditableTypeFromClassName,
} from "./contenteditable";
import { isNavbarBlock } from "./isNavbarBlock";
import { isTableBlock } from "./isTableBlock";

const domParser = new DOMParser();

export function getChildSelector(selector: string, index: number) {
  return `${selector}-${index}`;
}

export interface HtmlStringToReactNodesOptions {
  enabledMergeTagsBadge: boolean;
}

export function HtmlStringToReactNodes(
  content: string,
  option: HtmlStringToReactNodesOptions,
) {
  let doc = domParser.parseFromString(content, "text/html"); // The average time is about 1.4 ms
  [...doc.getElementsByTagName("a")].forEach((node) => {
    node.setAttribute("tabIndex", "-1");
  });
  [...doc.querySelectorAll(`.${MERGE_TAG_CLASS_NAME}`)].forEach((child) => {
    const editNode = child.querySelector("div");
    if (editNode) {
      if (option.enabledMergeTagsBadge) {
        editNode.innerHTML = MergeTagBadge.transform(editNode.innerHTML);
      }
    }
  });

  const reactNode = (
    <RenderReactNode selector={"0"} node={doc.documentElement} index={0} />
  );

  return reactNode;
}

const RenderReactNode = React.memo(function ({
  node,
  index,
  selector,
}: {
  node: HTMLElement;
  index: number;
  selector: string;
}): React.ReactElement {
  const attributes: { [key: string]: string } = {
    "data-selector": selector,
  };
  node.getAttributeNames?.().forEach((att) => {
    if (att) {
      attributes[att] = node.getAttribute(att) || "";
    }
  });

  if (node.nodeType === Node.COMMENT_NODE) return <></>;

  if (node.nodeType === Node.TEXT_NODE) {
    return <>{node.textContent}</>;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName = node.tagName.toLowerCase();
    if (tagName === "meta") return <></>;

    if (tagName === "style") {
      return createElement(tagName, {
        key: index,
        ...attributes,
        dangerouslySetInnerHTML: { __html: node.textContent },
      });
    }

    const blockType = getNodeTypeFromClassName(node.classList);
    const idx = getNodeIdxFromClassName(node.classList);

    if (blockType) {
      if (idx) {
        makeStandardContentEditable(node, blockType, idx);
      }
      makeBlockNodeContentEditable(node);
    }

    if (attributes["contenteditable"] === "true") {
      return createElement(tagName, {
        key: performance.now(),
        ...attributes,
        style: getStyle(node.getAttribute("style")),
        dangerouslySetInnerHTML: { __html: node.innerHTML },
      });
    }

    // Bypass nested html and head tags completely
    if (tagName === "html" || tagName === "head") {
      return (
        <React.Fragment key={index}>
          {node.childNodes.length === 0
            ? null
            : [...node.childNodes].map((n, i) => (
                <RenderReactNode
                  selector={getChildSelector(selector, i)}
                  key={i}
                  node={n as any}
                  index={i}
                />
              ))}
        </React.Fragment>
      );
    }

    // Convert body tags into divs to preserve styles safely
    const targetTagName = tagName === "body" ? "div" : tagName;

    const cleanChildNodes = [...node.childNodes].filter((n) => {
      if (n.nodeType === Node.TEXT_NODE && n.textContent?.trim() === "") {
        if (
          ["table", "tbody", "thead", "tfoot", "tr", "colgroup"].includes(
            targetTagName,
          )
        ) {
          return false;
        }
      }
      return true;
    });

    const reactNode = createElement(targetTagName, {
      key: index,
      ...attributes,
      style: getStyle(node.getAttribute("style")),
      children:
        cleanChildNodes.length === 0
          ? null
          : cleanChildNodes.map((n, i) => (
              <RenderReactNode
                selector={getChildSelector(selector, i)}
                key={i}
                node={n as any}
                index={i}
              />
            )),
    });

    return <>{reactNode}</>;
  }

  return <></>;
});

function getStyle(styleText: string | null) {
  if (!styleText) return undefined;
  return styleText.split(";").reduceRight((a: any, b: any) => {
    const arr = b.split(/\:(?!\/)/);
    if (arr.length < 2) return a;
    a[camelCase(arr[0])] = arr[1];
    return a;
  }, {});
}

function createElement(
  type: string,
  props?: React.ClassAttributes<Element> & {
    style?: {} | undefined;
    children?: ReactNode[] | null;
    key: string | number;
    tabIndex?: string;
    class?: string;
    role?: string;
    src?: string;
    dangerouslySetInnerHTML?: any;
  },
) {
  if (props?.class && props.class.includes("email-block")) {
    const blockType = getNodeTypeFromClassName(props.class);
    if (!isTextBlock(blockType)) {
      props.role = "tab";
      props.tabIndex = "0";
    }
    props.key = props.key + props.class;
  }

  return React.createElement(type, props);
}

function makeBlockNodeContentEditable(node: ChildNode) {
  if (!(node instanceof Element)) return;
  const type = getContentEditableTypeFromClassName(node.classList);
  const idx = getContentEditableIdxFromClassName(node.classList);

  if (isTextBlock(type)) {
    const editNode = node.querySelector("div");
    if (editNode) {
      editNode.setAttribute("contentEditable", "true");
      editNode.setAttribute(
        DATA_CONTENT_EDITABLE_TYPE,
        ContentEditableType.RichText,
      );
      editNode.setAttribute(DATA_CONTENT_EDITABLE_IDX, idx);
    }
  } else if (isButtonBlock(type)) {
    const editNode = node.querySelector("a") || node.querySelector("p");
    if (editNode) {
      editNode.setAttribute("contentEditable", "true");
      editNode.setAttribute(
        DATA_CONTENT_EDITABLE_TYPE,
        ContentEditableType.Text,
      );
      editNode.setAttribute(DATA_CONTENT_EDITABLE_IDX, idx);
    }
  } else if (isNavbarBlock(type)) {
    node.setAttribute("contentEditable", "true");
    node.setAttribute(DATA_CONTENT_EDITABLE_TYPE, ContentEditableType.Text);
    node.setAttribute(DATA_CONTENT_EDITABLE_IDX, idx);
  } else if (isTableBlock(type)) {
    const trNodes = node.querySelectorAll("tr");
    trNodes.forEach((trNode, trIndex) => {
      const tdNodes = trNode.querySelectorAll("td");
      tdNodes.forEach((tdNode, tdIndex) => {
        const _idx = idx.replace(
          "data.value.content",
          `data.value.tableSource.${trIndex}.${tdIndex}.content`,
        );
        tdNode.setAttribute("contentEditable", "true");
        tdNode.setAttribute(
          DATA_CONTENT_EDITABLE_TYPE,
          ContentEditableType.RichText,
        );
        tdNode.setAttribute(DATA_CONTENT_EDITABLE_IDX, _idx);
      });
    });
  }

  node.childNodes.forEach(makeBlockNodeContentEditable);
}

function makeStandardContentEditable(
  node: HTMLElement,
  blockType: string,
  idx: string,
) {
  if (
    isTextBlock(blockType) ||
    isButtonBlock(blockType) ||
    isTableBlock(blockType)
  ) {
    node.classList.add(
      ...getContentEditableClassName(blockType, `${idx}.data.value.content`),
    );
  }
  if (isNavbarBlock(blockType)) {
    node.querySelectorAll(".mj-link").forEach((anchor, index) => {
      anchor.classList.add(
        ...getContentEditableClassName(
          blockType,
          `${idx}.data.value.links.${index}.content`,
        ),
      );
    });
  }
}
