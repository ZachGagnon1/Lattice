import { useContext } from "react";
import { BlocksContext } from "@/adapters/ui/Provider/BlocksProvider";
import { useEditorForm } from "@/adapters/ui/Provider/EditorFormProvider";

export function useEditorContext() {
  const { formState, formHelpers } = useEditorForm();
  const { initialized, setInitialized } = useContext(BlocksContext);

  return {
    formState,
    formHelpers,
    initialized,
    setInitialized,
    pageData: formState.values.content,
  };
}
