// export components
export * from "./adapters/ui/Provider/EmailEditorProvider";

export { BlockAvatarWrapper } from "./adapters/ui/wrapper";

export { EmailEditor } from "./adapters/ui/editor/EmailEditor";

// exposing more granular components
export { EditEmailPreview } from "./adapters/ui/editor/EmailEditor/components/EditEmailPreview";
export { MobileEmailPreview } from "./adapters/ui/editor/EmailEditor/components/MobileEmailPreview";
export { DesktopEmailPreview } from "./adapters/ui/editor/EmailEditor/components/DesktopEmailPreview";
export { ToolsPanel } from "./adapters/ui/editor/EmailEditor/components/ToolsPanel";

// export utils
export * from "./shared/utils";

// export hooks
export { useActiveTab } from "./application/hooks/useActiveTab";
export { useEditorProps } from "./application/hooks/useEditorProps";
export { useBlock } from "./application/hooks/useBlock";
export { useEditorContext } from "./application/hooks/useEditorContext";
export { useDomScrollHeight } from "./application/hooks/useDomScrollHeight";
export { useRefState } from "./application/hooks/useRefState";
export { useLazyState } from "./application/hooks/useLazyState";
export { useFocusBlockLayout } from "./application/hooks/useFocusBlockLayout";
export * from "./application/hooks/useDataTransfer";
export * from "./application/hooks/useFocusIdx";
export * from "./application/hooks/useHoverIdx";

export { ActiveTabKeys } from "./adapters/ui/Provider/BlocksProvider";

// UI
export { IconFont } from "./adapters/ui/IconFont";
export { TextStyle } from "./adapters/ui/kit/TextStyle";
export { Stack } from "./adapters/ui/kit/Stack";

export * from "./shared/typings";
export type { StackProps } from "./adapters/ui/kit/Stack";
export type { PropsProviderProps } from "./adapters/ui/Provider/PropsProvider";
export { AvailableTools } from "./adapters/ui/Provider/PropsProvider";
export type { BlockAvatarWrapperProps } from "./adapters/ui/wrapper";
export type {
  BlockGroup,
  CollectedBlock,
} from "./adapters/ui/Provider/PropsProvider";

export * from "./adapters/panels/BlockLayer";
export * from "./adapters/panels/AttributePanel";
export * from "./adapters/panels/ShortcutToolbar";
export * from "./adapters/panels/SourceCodePanel";
export * from "./adapters/panels/InteractivePrompt";
export * from "./adapters/panels/StandardLayout";
export * from "./adapters/panels/MergeTagBadgePrompt";
export * from "./adapters/panels/common/Providers/ExtensionProvider";
export * from "./adapters/panels/constants";
export * from "./adapters/panels/common/Form";
export * from "./shared/utils/block/index";
export * from "./domain/blocks";
export * as components from "./adapters/canvas";
export * from "./domain/typings/index";
export * from "./domain/constants";

export {
  getLoopScopes,
  getScopedMergeTags,
  isExpandable,
} from "./shared/utils/panel/mergeTagScope";
export type {
  LoopScope,
  ScopeOptions,
  ScopedMergeTagEntry,
  ScopedMergeTagKind,
  ScopedMergeTags,
} from "./shared/utils/panel/mergeTagScope";
export {
  getIconNameByBlockType,
  setIconsMap,
} from "./shared/utils/panel/getIconNameByBlockType";
export { getBlockTitle } from "./shared/utils/panel/getBlockTitle";
export { MjmlToJson } from "./shared/utils/panel/MjmlToJson";

export * from "./constants";

export { LatticeEditor } from "./adapters/ui/editor/LatticeEditor";
export * from "./adapters/ui/editor/LatticeEditor/defaults";
export * from "./shared/utils/export";
export * from "./shared/utils/unlayerToLattice";
export * from "./shared/utils/variableSchema";
