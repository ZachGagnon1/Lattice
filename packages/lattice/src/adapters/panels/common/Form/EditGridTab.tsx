import React from "react";
import { cloneDeep } from "lodash-es";
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

// Note: Removed Omit<TabsProps, "onChange"> since we are no longer using Arco's Tabs
export interface EditGridTabProps<T> {
  value: Array<T>;
  renderItem: (item: T, index: number) => React.ReactNode;
  onChange: (vals: Array<T>) => any;
  additionItem?: T;
  label?: string;
}

export function EditGridTab<T>(props: EditGridTabProps<T>) {
  const { value, additionItem } = props;

  const onAdd = (index: number) => {
    const newItem = additionItem ?? cloneDeep(value[index]);
    // Create a new array reference rather than mutating the prop directly
    const newValue = [...value];
    newValue.splice(index + 1, 0, newItem);
    props.onChange(newValue);
  };

  const onDelete = (index: number) => {
    props.onChange(value.filter((_, vIndex) => Number(index) !== vIndex));
  };

  const items = Array.isArray(value) ? value : [];

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      {items.map((item, index) => (
        <Card
          key={index}
          variant="outlined"
          sx={{
            width: "100%",
            borderRadius: 2,
            borderColor: "divider",
            boxShadow: "0px 2px 4px rgba(0,0,0,0.02)", // Subtle shadow
            transition: "box-shadow 0.2s ease-in-out",
            "&:hover": {
              boxShadow: "0px 4px 12px rgba(0,0,0,0.06)", // Pops up slightly on hover
            },
          }}
        >
          <CardHeader
            sx={{
              py: 1,
              px: 2,
              bgcolor: "grey.50", // Gives the header a clean separation from the body
              borderBottom: 1,
              borderColor: "divider",
            }}
            title={
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {/* Assuming 't' is globally available in your app like the original code */}
                {t("Item")} {index + 1}
              </Typography>
            }
            action={
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Duplicate / Add Below" placement="top">
                  <IconButton
                    size="small"
                    onClick={() => onAdd(index)}
                    sx={{ color: "text.secondary" }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Remove Item" placement="top">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(index)}
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        color: "error.main",
                        bgcolor: "error.lighter",
                      },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            }
          />
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            {props.renderItem(item, index)}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
