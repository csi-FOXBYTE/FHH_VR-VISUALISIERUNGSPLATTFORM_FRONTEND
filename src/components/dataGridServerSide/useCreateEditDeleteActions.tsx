import { Delete, Edit } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { DataGridProps, GridActionsCellItem } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";

export default function useCreateEditDeleteActions({
  handleDelete,
  handleEdit,
  isDisabled = () => ({}),
  loading = false,
}: {
  handleEdit?: (id: string) => void;
  handleDelete?: (id: string) => void;
  isDisabled?: (row: any) => { edit?: boolean; delete?: boolean }; // eslint-disable-line @typescript-eslint/no-explicit-any
  loading?: boolean;
}): DataGridProps["columns"][number] {
  const t = useTranslations();

  return {
    field: "actions",
    type: "actions",
    headerName: " ",
    getActions: ({ id, row }) => {
      const disabled = isDisabled(row);

      return [
        handleEdit ? (
          <Tooltip arrow title={t("actions.update")}>
            <GridActionsCellItem
              icon={<Edit />}
              disabled={disabled.edit}
              key="edit"
              label="Edit"
              loading={loading}
              className="textPrimary"
              onClick={() => handleEdit(String(id))}
              color="inherit"
            />
          </Tooltip>
        ) : (
          <></>
        ),
        handleDelete ? (
          <Tooltip arrow title={t("actions.delete")}>
            <GridActionsCellItem
              icon={<Delete />}
              key="delete"
              disabled={disabled.delete}
              label="Delete"
              color="inherit"
              loading={loading}
              onClick={() => handleDelete(String(id))}
            />
          </Tooltip>
        ) : (
          <></>
        ),
      ];
    },
  };
}
