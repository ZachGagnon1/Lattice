import { BlocksContext } from "@/adapters/ui/Provider/BlocksProvider";
import { useContext } from "react";

export function useActiveTab() {
  const { activeTab, setActiveTab } = useContext(BlocksContext);
  return {
    activeTab,
    setActiveTab,
  };
}
