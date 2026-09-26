export type BlockType = BasicType;

// 基础组件
export enum BasicType {
  PAGE = "page",
  SECTION = "section",
  COLUMN = "column",
  GROUP = "group",
  TEXT = "text",
  IMAGE = "image",
  DIVIDER = "divider",
  SPACER = "spacer",
  BUTTON = "button",
  WRAPPER = "wrapper",
  RAW = "raw",
  ACCORDION = "accordion",
  ACCORDION_ELEMENT = "accordion-element",
  ACCORDION_TITLE = "accordion-title",
  ACCORDION_TEXT = "accordion-text",
  HERO = "hero",
  CAROUSEL = "carousel",
  NAVBAR = "navbar",
  SOCIAL = "social",
  // Lattice adds the TABLE, CONDITION, and FOR_LOOP blocks.
  TABLE = "table",
  CONDITION = "condition",
  CONDITION_BRANCH = "condition-branch",
  FOR_LOOP = "for-loop",

  TEMPLATE = "template",
}

// Deprecated: AdvancedType is now an alias for BasicType.
// The advanced blocks are part of BasicType now.
export const AdvancedType = BasicType;
export type AdvancedType = BasicType;

export const MERGE_TAG_CLASS_NAME = "easy-email-merge-tag-container";
export const EMAIL_BLOCK_CLASS_NAME = "email-block";
