import { Delete, Edit } from "@mui/icons-material";
import { DataGridProps, GridActionsCellItem } from "@mui/x-data-grid";

export default function createEditDeleteActions({
  handleDelete,
  handleEdit,
}: {
  handleEdit?: (id: string) => void;
  handleDelete?: (id: string) => void;
}): DataGridProps["columns"][number] {
  return {
    field: "actions",
    type: "actions",
    headerName: "Actions",
    getActions: ({ id }) => [
      handleEdit ? (
        <GridActionsCellItem
          icon={<Edit />}
          key="edit"
          label="Edit"
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
          label="Delete"
          color="inherit"
          onClick={() => handleDelete(String(id))}
        />
      ) : (
        <></>
      ),
    ],
  };
}
