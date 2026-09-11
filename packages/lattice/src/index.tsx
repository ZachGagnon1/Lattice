// export components
export * from "./components/Provider/EmailEditorProvider";

export { BlockAvatarWrapper } from "./components/wrapper";

export { EmailEditor } from "./components/EmailEditor";

// exposing more granular components
export { EditEmailPreview } from "./components/EmailEditor/components/EditEmailPreview";
export { MobileEmailPreview } from "./components/EmailEditor/components/MobileEmailPreview";
export { DesktopEmailPreview } from "./components/EmailEditor/components/DesktopEmailPreview";
export { ToolsPanel } from "./components/EmailEditor/components/ToolsPanel";

// export utils
export * from "./utils";

// export hooks
export { useActiveTab } from "./hooks/useActiveTab";
export { useEditorProps } from "./hooks/useEditorProps";
export { useBlock } from "./hooks/useBlock";
export { useEditorContext } from "./hooks/useEditorContext";
export { useDomScrollHeight } from "./hooks/useDomScrollHeight";
export { useRefState } from "./hooks/useRefState";
export { useLazyState } from "./hooks/useLazyState";
export { useFocusBlockLayout } from "./hooks/useFocusBlockLayout";
export * from "./hooks/useDataTransfer";
export * from "./hooks/useFocusIdx";
export * from "./hooks/useHoverIdx";

export { ActiveTabKeys } from "./components/Provider/BlocksProvider";

// UI
export { IconFont } from "./components/IconFont";
export { TextStyle } from "./components/UI/TextStyle";
export { Stack } from "./components/UI/Stack";

export * from "./typings";
export type { StackProps } from "./components/UI/Stack";
export type { PropsProviderProps } from "./components/Provider/PropsProvider";
export { AvailableTools } from "./components/Provider/PropsProvider";
export type { BlockAvatarWrapperProps } from "./components/wrapper";
export type {
  BlockGroup,
  CollectedBlock,
} from "./components/Provider/PropsProvider";

export * from "./extensions/BlockLayer";
export * from "./extensions/AttributePanel";
export * from "./extensions/ShortcutToolbar";
export * from "./extensions/SourceCodePanel";
export * from "./extensions/InteractivePrompt";
export * from "./extensions/StandardLayout";
export * from "./extensions/MergeTagBadgePrompt";
export * from "./extensions/components/Providers/ExtensionProvider";
export * from "./extensions/constants";
export * from "./extensions/components/Form";
export * from "./core/utils/index";
export * from "./core/blocks";
export * as components from "./core/components";
export * from "./core/typings/index";
export * from "./core/constants";

export {
  getLoopScopes,
  getScopedMergeTags,
  isExpandable,
} from "./extensions/utils/mergeTagScope";
export type {
  LoopScope,
  ScopeOptions,
  ScopedMergeTagEntry,
  ScopedMergeTagKind,
  ScopedMergeTags,
} from "./extensions/utils/mergeTagScope";
export {
  getIconNameByBlockType,
  setIconsMap,
} from "./extensions/utils/getIconNameByBlockType";
export { getBlockTitle } from "./extensions/utils/getBlockTitle";
export { MjmlToJson } from "./extensions/utils/MjmlToJson";

export * from "./constants";

export { LatticeEditor } from "./components/LatticeEditor";
export * from "./components/LatticeEditor/defaults";
export * from "./utils/export";
export * from "./utils/unlayerToLattice";
