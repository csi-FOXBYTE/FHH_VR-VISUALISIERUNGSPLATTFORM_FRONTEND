"use client";

import { Permissions, permissions } from "@/constants/permissions";
import { Checkbox, ListItemText } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const rows = permissions.map((permission) => ({
  id: permission,
  name: permission,
}));

export default function PermissionsMatrix({
  value,
  onChange,
  loading,
}: {
  value: Permissions[];
  onChange: (value: Permissions[]) => void;
  loading: boolean;
}) {
  const t = useTranslations();

  const columns = useMemo<GridColDef<(typeof rows)[number]>[]>(
    () => [
      {
        field: "name",
        flex: 1,
        headerName: t("permissions.permission"),
        renderCell({ row }) {
          return (
            <ListItemText
              primary={t(`permissions.${row.id}`)}
              secondary={t(`permissions.${row.id}-description`)}
            />
          );
        },
      },
      {
        field: "selected",
        flex: 0,
        headerName: t("permissions.selected"),
        type: "boolean",
        renderCell: ({ row }) => {
          return (
            <Checkbox
              onChange={(_, checked) => {
                const newSet = new Set<Permissions>(value);

                if (checked) {
                  newSet.add(row.id);
                } else {
                  newSet.delete(row.id);
                }

                onChange(Array.from(newSet));
              }}
              checked={value.includes(row.name)}
            />
          );
        },
      },
    ],
    [onChange, value, t]
  );

  return (
    <DataGrid
      sx={{ flex: 1 }}
      loading={loading}
      rows={rows}
      getRowId={(row) => row.id}
      columns={columns}
    />
  );
}
