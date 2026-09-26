import { BlocksContext } from "@/adapters/ui/Provider/BlocksProvider";
import { useContext } from "react";

export function useFocusIdx() {
  const { focusIdx, setFocusIdx } = useContext(BlocksContext);
  return {
    focusIdx,
    setFocusIdx,
  };
}
