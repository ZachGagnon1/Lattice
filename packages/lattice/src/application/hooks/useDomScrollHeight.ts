import { useContext } from "react";
import { ScrollContext } from "../../adapters/ui/Provider/ScrollProvider/index";

export function useDomScrollHeight() {
  return useContext(ScrollContext);
}
