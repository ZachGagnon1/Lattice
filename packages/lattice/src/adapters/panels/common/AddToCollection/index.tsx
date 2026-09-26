import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Stack, useBlock, useEditorProps } from "@";
import { ImageUploaderField, TextAreaField, TextField } from "@";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";

export const AddToCollection: React.FC<{
  visible: boolean;
  setVisible: (v: boolean) => void;
}> = ({ visible, setVisible }) => {
  const { focusBlock: focusBlockData } = useBlock();
  const { onAddCollection, onUploadImage } = useEditorProps();

  const methods = useForm({
    defaultValues: { label: "", helpText: "", thumbnail: "" },
    mode: "onChange",
  });

  const onSubmit = (values: {
    label: string;
    helpText: string;
    thumbnail: string;
  }) => {
    if (!values.label) return;
    const uuid = uuidv4();
    onAddCollection?.({
      label: values.label,
      helpText: values.helpText,
      data: focusBlockData!,
      thumbnail: values.thumbnail,
      id: uuid,
    });
    setVisible(false);
  };

  return (
    <FormProvider {...methods}>
      <Dialog
        open={visible}
        // Matches Arco's maskClosable={false}
        onClose={(_, reason) => {
          if (reason !== "backdropClick") {
            setVisible(false);
          }
        }}
        sx={{ zIndex: 2000 }}
        fullWidth
        maxWidth="xs" // Keeps the modal at a reasonable width
      >
        <DialogTitle>{t("Add to collection")}</DialogTitle>

        <DialogContent>
          <Stack vertical>
            <Stack.Item />
            <TextField
              label={t("Title")}
              name="label"
              validate={(val: string) => {
                if (!val) return t("Title required!");
                return undefined;
              }}
            />
            <TextAreaField label={t("Description")} name="helpText" />
            <ImageUploaderField
              label={t("Thumbnail")}
              name={"thumbnail"}
              uploadHandler={onUploadImage}
              validate={(val: string) => {
                if (!val) return t("Thumbnail required!");
                return undefined;
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setVisible(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={methods.handleSubmit(onSubmit)}
            variant="contained"
            disableElevation
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
};
