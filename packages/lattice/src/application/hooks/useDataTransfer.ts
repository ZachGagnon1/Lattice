import { useCallback, useContext, useMemo } from "react";
import { HoverIdxContext } from "@/adapters/ui/Provider/HoverIdxProvider";
import { debounce } from "lodash-es";

export function useDataTransfer() {
  const { dataTransfer, setDataTransfer } = useContext(HoverIdxContext);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setDataTransferDebounce = useCallback(debounce(setDataTransfer), [
    setDataTransfer,
  ]);

  return useMemo(
    () => ({
      dataTransfer,
      setDataTransfer: setDataTransferDebounce,
    }),
    [dataTransfer, setDataTransferDebounce],
  );
}
