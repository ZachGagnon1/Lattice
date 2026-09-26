import { IEmailTemplate } from "@/typings";
import { useEditorForm } from "../EditorFormProvider";
import { cloneDeep, isEqual } from "lodash-es";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRefState } from "@/hooks/useRefState";

const MAX_RECORD_SIZE = 50;

export type RecordStatus = "add" | "redo" | "undo" | undefined;

export const RecordContext = React.createContext<{
  records: Array<IEmailTemplate>;
  redo: () => void;
  undo: () => void;
  reset: () => void;
  redoable: boolean;
  undoable: boolean;
}>({
  records: [],
  redo: () => {},
  undo: () => {},
  reset: () => {},
  redoable: false,
  undoable: false,
});

export const RecordProvider: React.FC<{ children?: React.ReactNode }> = (
  props,
) => {
  const {
    formState: { values },
    formHelpers,
  } = useEditorForm();
  const [data, setData] = useState<Array<IEmailTemplate>>([]);
  const [index, setIndex] = useState(-1);
  const indexRef = useRefState(index);

  const statusRef = useRef<RecordStatus>(undefined);
  const currentData = useRef<IEmailTemplate>(null);

  if (index >= 0 && data.length > 0) {
    currentData.current = data[index];
  }

  const value = useMemo(() => {
    return {
      records: data,
      redo: () => {
        const nextIndex = Math.min(
          MAX_RECORD_SIZE - 1,
          index + 1,
          data.length - 1,
        );
        statusRef.current = "redo";
        setIndex(nextIndex);
        formHelpers.reset(data[nextIndex]);
      },
      undo: () => {
        const prevIndex = Math.max(0, index - 1);
        statusRef.current = "undo";
        setIndex(prevIndex);
        formHelpers.reset(data[prevIndex]);
      },
      reset: () => {
        formHelpers.reset();
      },
      undoable: index > 0,
      redoable: index < data.length - 1,
    };
  }, [data, formHelpers, index]);

  useEffect(() => {
    if (statusRef.current === "redo" || statusRef.current === "undo") {
      statusRef.current = undefined;
      return;
    }
    const currentItem = currentData.current;

    const isChanged = !(
      currentItem &&
      isEqual(values.content, currentItem.content) &&
      values.subject === currentItem.subject &&
      values.subTitle === currentItem.subTitle
    );

    if (isChanged) {
      currentData.current = values;
      statusRef.current = "add";
      setData((oldData) => {
        const list = oldData.slice(0, indexRef.current + 1);

        const newData = [...list, cloneDeep(values)].slice(-MAX_RECORD_SIZE);

        return newData;
      });
      setIndex(Math.min(indexRef.current + 1, MAX_RECORD_SIZE - 1));
    }
  }, [values, indexRef]);

  return (
    <RecordContext.Provider value={value}>
      {props.children}
    </RecordContext.Provider>
  );
};
