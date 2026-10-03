export type BlockAction = "added" | "copied" | "deleted" | "moved";

export function getBlockActionMessage(action: BlockAction, blockName: string) {
  const messages: Record<BlockAction, string> = {
    added: t("added"),
    copied: t("copied"),
    deleted: t("deleted"),
    moved: t("moved"),
  };
  return `${blockName} ${messages[action]}.`;
}
