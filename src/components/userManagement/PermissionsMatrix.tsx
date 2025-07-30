"use client";

import { CRUD_PERMISSIONS } from "@/constants/permissions";
import { Checkbox } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

const permissionsRaw = Object.entries(CRUD_PERMISSIONS).map(([key]) => {
  const createKey = `${key}:CREATE`;
  const deleteKey = `${key}:DELETE`;
  const updateKey = `${key}:UPDATE`;
  const readKey = `${key}:READ`;

  return {
    entity: key,
    createKey,
    deleteKey,
    updateKey,
    readKey,
  };
});

export default function PermissionsMatrix({
  value,
  onChange,
  loading,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  loading: boolean;
}) {
  const t = useTranslations();

  const valueSet = useMemo(() => {
    return new Set(value);
  }, [value]);

  const permissions = useMemo(() => {
    return permissionsRaw.map((permission) => ({
      ...permission,
      create: valueSet.has(permission.createKey),
      read: valueSet.has(permission.readKey),
      update: valueSet.has(permission.updateKey),
      delete: valueSet.has(permission.deleteKey),
      valueSet: valueSet,
    }));
  }, [valueSet]);

  const createHandleChange = useCallback(
    (key: string, valueSet: Set<string>) => {
      return (_: unknown, checked: boolean) => {
        if (!checked) {
          valueSet.delete(key);
        } else {
          valueSet.add(key);
        }

        onChange(Array.from(valueSet));
      };
    },
    [onChange]
  );

  const columns = useMemo<GridColDef<(typeof permissions)[number]>[]>(
    () => [
      {
        field: "entity",
        flex: 1,
        headerName: "",
        valueGetter: (_, row) => t(`permissions.${row.entity}`),
      },
      {
        field: "all",
        flex: 1,
        headerName: t("permissions.ALL"),
        type: "boolean",
        renderCell: ({ row }) => {
          const allChecked =
            row.valueSet.has(row.createKey) &&
            row.valueSet.has(row.readKey) &&
            row.valueSet.has(row.updateKey) &&
            row.valueSet.has(row.deleteKey);

          const indeterminate =
            (row.valueSet.has(row.createKey) ||
              row.valueSet.has(row.readKey) ||
              row.valueSet.has(row.updateKey) ||
              row.valueSet.has(row.deleteKey)) &&
            !allChecked;

          return (
            <Checkbox
              indeterminate={indeterminate}
              checked={allChecked}
              onClick={() => {
                if (allChecked) {
                  row.valueSet.delete(row.createKey);
                  row.valueSet.delete(row.readKey);
                  row.valueSet.delete(row.updateKey);
                  row.valueSet.delete(row.deleteKey);
                } else {
                  row.valueSet.add(row.createKey);
                  row.valueSet.add(row.readKey);
                  row.valueSet.add(row.updateKey);
                  row.valueSet.add(row.deleteKey);
                }

                return onChange(Array.from(row.valueSet));
              }}
            />
          );
        },
      },
      {
        field: "create",
        flex: 1,
        type: "boolean",
        headerName: t("permissions.CREATE"),
        renderCell: ({ row }) => (
          <Checkbox
            onChange={createHandleChange(row.createKey, row.valueSet)}
            checked={row.valueSet.has(row.createKey)}
          />
        ),
      },
      {
        field: "read",
        flex: 1,
        type: "boolean",
        headerName: t("permissions.READ"),
        renderCell: ({ row }) => (
          <Checkbox
            onChange={createHandleChange(row.readKey, row.valueSet)}
            checked={row.valueSet.has(row.readKey)}
          />
        ),
      },
      {
        field: "update",
        flex: 1,
        type: "boolean",
        headerName: t("permissions.UPDATE"),
        renderCell: ({ row }) => (
          <Checkbox
            onChange={createHandleChange(row.updateKey, row.valueSet)}
            checked={row.valueSet.has(row.updateKey)}
          />
        ),
      },
      {
        field: "delete",
        flex: 1,
        type: "boolean",
        headerName: t("permissions.DELETE"),
        renderCell: ({ row }) => (
          <Checkbox
            onChange={createHandleChange(row.deleteKey, row.valueSet)}
            checked={row.valueSet.has(row.deleteKey)}
          />
        ),
      },
    ],
    [createHandleChange, onChange, t]
  );

  return (
    <DataGrid
      sx={{ flex: 1 }}
      loading={loading}
      rows={permissions}
      getRowId={(row) => row.entity}
      columns={columns}
    />
  );
}
