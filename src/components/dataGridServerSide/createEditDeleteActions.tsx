import { Delete, Edit } from "@mui/icons-material";
import { DataGridProps, GridActionsCellItem } from "@mui/x-data-grid";

export default function createEditDeleteActions({
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
  return {
    field: "actions",
    type: "actions",
    headerName: " ",
    getActions: ({ id, row }) => {
      const disabled = isDisabled(row);

      return [
        handleEdit ? (
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
        ) : (
          <></>
        ),
        handleDelete ? (
          <GridActionsCellItem
            icon={<Delete />}
            key="delete"
            disabled={disabled.delete}
            label="Delete"
            color="inherit"
            loading={loading}
            onClick={() => handleDelete(String(id))}
          />
        ) : (
          <></>
        ),
      ];
    },
  };
}
