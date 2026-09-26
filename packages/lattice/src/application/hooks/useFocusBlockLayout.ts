import { FocusBlockLayoutContext } from "../../adapters/ui/Provider/FocusBlockLayoutProvider/index";
import { useContext } from "react";

export function useFocusBlockLayout() {
  return useContext(FocusBlockLayoutContext);
}
