import { BlocksContext } from "@/adapters/ui/Provider/BlocksProvider";
import { useContext } from "react";

export function useDraggable() {
  const { dragEnabled, setDragEnabled } = useContext(BlocksContext);
  return {
    dragEnabled,
    setDragEnabled,
  };
}
