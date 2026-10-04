import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Stack,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import DataObjectIcon from "@mui/icons-material/DataObject";

import styles from "./index.module.scss";
import {
  Uploader,
  UploaderServer,
} from "@/adapters/panels/AttributePanel/utils/Uploader";
import { previewLoadImage } from "@/adapters/panels/AttributePanel/utils/previewLoadImage";
import { MergeTags } from "@/adapters/panels/AttributePanel/components/attributes/MergeTags";
import { useEditorProps } from "@";
import { TextInput } from "@/adapters/panels/common/Form/TextInput";
import { getImageControlLabels } from "@/shared/utils/controlAccessibility";

export interface ImageUploaderProps {
  onChange: (val: string) => void;
  value: string;
  label: string;
  uploadHandler?: UploaderServer;
  autoCompleteOptions?: Array<{ value: string; label: React.ReactNode }>;
}

export function ImageUploader(props: ImageUploaderProps) {
  const { variableData } = useEditorProps();

  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const previewButtonRef = useRef<HTMLButtonElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);
  const labels = getImageControlLabels(props.label);

  // Local state for inline input errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // MUI state for Dropdowns/Popovers
  const [anchorElMerge, setAnchorElMerge] = useState<null | HTMLElement>(null);
  const [anchorElAuto, setAnchorElAuto] = useState<null | HTMLElement>(null);

  const uploadHandlerRef = useRef<UploaderServer | null | undefined>(
    props.uploadHandler,
  );

  const onChange = props.onChange;

  // Wrapper for onChange to clear errors when the user types manually
  const handleTextChange = useCallback(
    (val: string) => {
      setErrorMsg(null);
      onChange(val);
    },
    [onChange],
  );

  const onUpload = useCallback(() => {
    if (isUploading) {
      // Note: Assuming 't' is available in your higher scope or globally,
      // as it was used in your original file without an explicit import.
      // @ts-ignore
      setErrorMsg(t("Uploading..."));
      return;
    }
    if (!uploadHandlerRef.current) {
      return;
    }

    setErrorMsg(null); // Clear previous errors

    const uploader = new Uploader(uploadHandlerRef.current, {
      limit: 1,
      accept: "image/*",
    });

    uploader.on("start", () => {
      setIsUploading(true);

      uploader.on("end", (data) => {
        const url = data[0]?.url;
        if (url) {
          onChange(url);
        }
        setIsUploading(false);
      });
    });

    uploader.chooseFile();
  }, [isUploading, onChange]);

  const onPaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (!uploadHandlerRef.current) {
        return;
      }
      const clipboardData = e.clipboardData;

      for (const element of clipboardData.items) {
        const item = element;
        if (item.kind === "file") {
          const blob = item.getAsFile();

          if (!blob || blob.size === 0) {
            return;
          }
          try {
            setErrorMsg(null); // Clear previous errors
            setIsUploading(true);
            const picture = await uploadHandlerRef.current(blob);
            await previewLoadImage(picture);
            props.onChange(picture);
            setIsUploading(false);
          } catch (error: any) {
            // @ts-ignore
            setErrorMsg(error?.message || error || t("Upload failed"));
            setIsUploading(false);
          }
        }
      }
    },
    [props],
  );

  const onRemove = useCallback(() => {
    setErrorMsg(null);
    props.onChange("");
    requestAnimationFrame(() => urlInputRef.current?.focus());
  }, [props]);

  const closePreview = useCallback(() => {
    setPreview(false);
    requestAnimationFrame(() => previewButtonRef.current?.focus());
  }, []);

  const content = useMemo(() => {
    if (isUploading) {
      return (
        <Box
          role="status"
          aria-live="polite"
          sx={{
            width: 104,
            height: 104,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
            mr: 1,
          }}
        >
          <CircularProgress size={24} aria-hidden="true" />
          <Box sx={{ position: "absolute", clip: "rect(0 0 0 0)" }}>
            {t("Uploading image")}
          </Box>
        </Box>
      );
    }

    if (!props.value) {
      return (
        <Button
          aria-label={labels.upload}
          onClick={onUpload}
          sx={{
            width: 104,
            height: 104,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            mb: 1,
            mr: 1,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <AddIcon fontSize="large" sx={{ color: "text.secondary", mb: 0.5 }} />
          <Box sx={{ color: "text.secondary", fontSize: 14 }}>Upload</Box>
        </Button>
      );
    }

    return (
      <Box
        sx={{
          position: "relative",
          width: 104,
          height: 104,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          mb: 1,
          mr: 1,
          "&:hover .action-overlay, &:focus-within .action-overlay": {
            opacity: 1,
          },
        }}
      >
        <img
          src={props.value}
          alt={props.label}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <Box
          className="action-overlay"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          {/* @ts-ignore */}
          <Tooltip title={t("Preview")} placement="top">
            <IconButton
              ref={previewButtonRef}
              aria-label={labels.preview}
              size="small"
              onClick={() => setPreview(true)}
              sx={{ color: "#fff" }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {/* @ts-ignore */}
          <Tooltip title={t("Remove")} placement="top">
            <IconButton
              aria-label={labels.remove}
              size="small"
              onClick={onRemove}
              sx={{ color: "#fff" }}
            >
              <DeleteOutlineIcon fontSize="small" aria-hidden="true" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }, [isUploading, labels, onRemove, onUpload, props.label, props.value]);

  if (!props.uploadHandler) {
    return (
      <TextInput
        label={props.label}
        value={props.value}
        onChange={handleTextChange}
        error={!!errorMsg}
        helperText={errorMsg}
      />
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles["container"]}>
        {content}
        <Stack
          direction="row"
          spacing={0}
          sx={{ width: "100%", alignItems: "flex-start", mt: 1 }}
        >
          {variableData && (
            <Box>
              {/* STYLED Merge Tags Trigger to match image_1.png */}
              <Button
                aria-label={labels.mergeTag}
                aria-haspopup="dialog"
                aria-expanded={Boolean(anchorElMerge)}
                variant="outlined"
                color="inherit"
                onClick={(e) => setAnchorElMerge(e.currentTarget)}
                sx={{
                  width: 40, // Standard size for prefix blocks
                  height: 40, // Matching TextInput small height
                  minWidth: 0,
                  p: 0,
                  borderRadius: 1, // Applying corner radius like inputs
                  borderColor: "divider", // Gray border
                  bgcolor: "background.paper",
                  borderBottomRightRadius: "0px",
                  borderTopRightRadius: "0px",
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: "text.primary",
                  },
                }}
              >
                <DataObjectIcon />
              </Button>
              <Popover
                open={Boolean(anchorElMerge)}
                anchorEl={anchorElMerge}
                onClose={() => setAnchorElMerge(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
              >
                <Box sx={{ p: 1 }}>
                  <MergeTags value={props.value} onChange={handleTextChange} />
                </Box>
              </Popover>
            </Box>
          )}

          <Box sx={{ flex: 1, ml: "-1px" }}>
            {" "}
            {/* Overlap borders slightly */}
            <TextInput
              inputRef={urlInputRef}
              label={props.label}
              value={props.value}
              onChange={handleTextChange}
              onPaste={onPaste}
              disabled={isUploading}
              error={!!errorMsg}
              helperText={errorMsg}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderTopLeftRadius: variableData ? 0 : undefined,
                  borderBottomLeftRadius: variableData ? 0 : undefined,
                },
              }}
            />
          </Box>

          {props.autoCompleteOptions && (
            <Box sx={{ mt: "4px", ml: 0.5 }}>
              <IconButton
                aria-label={labels.suggestion}
                aria-haspopup="menu"
                aria-expanded={Boolean(anchorElAuto)}
                size="small"
                onClick={(e) => setAnchorElAuto(e.currentTarget)}
                sx={{ bgcolor: "action.hover" }}
              >
                <AlternateEmailIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorElAuto}
                open={Boolean(anchorElAuto)}
                onClose={() => setAnchorElAuto(null)}
              >
                {props.autoCompleteOptions.map((item, index) => (
                  <MenuItem
                    key={index.toString()}
                    onClick={() => {
                      handleTextChange(item.value);
                      setAnchorElAuto(null);
                    }}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                  >
                    <img
                      src={item.value}
                      style={{ width: 20, height: 20 }}
                      alt=""
                    />
                    <span>{item.label}</span>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Stack>
      </div>

      <Dialog
        aria-label={labels.preview}
        open={preview}
        onClose={closePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            justifyContent: "center",
            bgcolor: "black",
          }}
        >
          {/* @ts-ignore */}
          <img
            alt={t("Preview")}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
            }}
            src={props.value}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
