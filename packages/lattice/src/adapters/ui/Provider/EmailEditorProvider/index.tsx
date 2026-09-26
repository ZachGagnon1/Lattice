import { IEmailTemplate } from "@/shared/typings";
import { FormProvider, useForm } from "react-hook-form";
import React, { useEffect, useRef } from "react";
import { BlocksProvider } from "../BlocksProvider";
import { HoverIdxProvider } from "../HoverIdxProvider";
import { PropsProvider, PropsProviderProps } from "../PropsProvider";
import { RecordProvider } from "../RecordProvider";
import { ScrollProvider } from "../ScrollProvider";
import { FocusBlockLayoutProvider } from "../FocusBlockLayoutProvider";
import { PreviewEmailProvider } from "../PreviewEmailProvider";
import { LanguageProvider } from "../LanguageProvider";
import {
  EditorFormHelpers,
  EditorFormProvider,
  EditorFormState,
  useEditorForm,
} from "../EditorFormProvider";
import { overrideErrorLog, restoreErrorLog } from "@/shared/utils/logger";
import { isEqual } from "lodash-es";

export interface EmailEditorProviderProps<
  T extends IEmailTemplate = IEmailTemplate,
> extends Omit<PropsProviderProps, "children"> {
  data: T;
  children: (
    formState: EditorFormState,
    formHelpers: EditorFormHelpers,
  ) => React.ReactNode;
}

function toFormValues(data: IEmailTemplate): IEmailTemplate {
  return {
    subject: data.subject,
    subTitle: data.subTitle,
    content: data.content,
  };
}

export const EmailEditorProvider = (props: EmailEditorProviderProps) => {
  const { data, children } = props;

  // useForm reads defaultValues once. A later change of `data` goes through reset() below.
  // onChange validation, so a field with a rule shows its error while the user types.
  const methods = useForm<IEmailTemplate>({
    defaultValues: toFormValues(data),
    mode: "onChange",
  });

  const prevDataRef = useRef(data);
  useEffect(() => {
    if (!isEqual(prevDataRef.current, data)) {
      methods.reset(toFormValues(data));
      prevDataRef.current = data;
    }
  }, [data, methods]);

  useEffect(() => {
    overrideErrorLog();
    return () => {
      restoreErrorLog();
    };
  }, []);

  if (!data.content) return null;

  return (
    <FormProvider {...methods}>
      <EditorFormProvider>
        <PropsProvider {...props}>
          <LanguageProvider locale={props.locale}>
            <PreviewEmailProvider>
              <RecordProvider>
                <BlocksProvider>
                  <HoverIdxProvider>
                    <ScrollProvider>
                      <FocusBlockLayoutProvider>
                        <RenderChildren children={children} />
                      </FocusBlockLayoutProvider>
                    </ScrollProvider>
                  </HoverIdxProvider>
                </BlocksProvider>
              </RecordProvider>
            </PreviewEmailProvider>
          </LanguageProvider>
        </PropsProvider>
      </EditorFormProvider>
    </FormProvider>
  );
};

function RenderChildren({
  children,
}: {
  children: EmailEditorProviderProps["children"];
}) {
  const { formState, formHelpers } = useEditorForm();
  return <>{children(formState, formHelpers)}</>;
}
