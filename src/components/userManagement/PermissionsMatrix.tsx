"use client";

import { CRUD_PERMISSIONS } from "@/constants/permissions";
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";

function generateKey(key: string, permission: string) {
  return `${key}:${permission}`;
}

export default function PermissionsMatrix() {
  const [permissions, setPermissions] = useState<Set<string>>(new Set());

  const t = useTranslations();

  return (
    <Table>
      <TableHead>
        <TableCell />
        <TableCell>{t("permissions.ALL")}</TableCell>
        <TableCell>{t("permissions.CREATE")}</TableCell>
        <TableCell>{t("permissions.READ")}</TableCell>
        <TableCell>{t("permissions.UPDATE")}</TableCell>
        <TableCell>{t("permissions.DELETE")}</TableCell>
      </TableHead>
      <TableBody>
        {Object.entries(CRUD_PERMISSIONS).map(([key, value]) => {
          const rowPermissions = value.map((p) => generateKey(key, p));

          const hasAllChecked = rowPermissions.every((rowPermission) =>
            permissions.has(rowPermission)
          );

          const hasSomeChecked = rowPermissions.some((rowPermission) =>
            permissions.has(rowPermission)
          );

          return (
            <TableRow key={key}>
              <TableCell>{t(`permissions.${key}`)}</TableCell>
              <TableCell>
                <Checkbox
                  indeterminate={hasSomeChecked && !hasAllChecked}
                  checked={hasAllChecked}
                  onChange={() => {
                    const newPermissions = new Set(permissions);

                    if (hasAllChecked) {
                      rowPermissions.forEach(
                        newPermissions.delete.bind(newPermissions)
                      );
                    } else {
                      rowPermissions.forEach(
                        newPermissions.add.bind(newPermissions)
                      );
                    }

                    setPermissions(newPermissions);
                  }}
                />
              </TableCell>
              {value.map((permission) => {
                const newkey = generateKey(key, permission);

                const isChecked = permissions.has(newkey);

                return (
                  <TableCell key={newkey}>
                    <Checkbox
                      checked={isChecked}
                      onChange={() =>
                        setPermissions((permissions) => {
                          if (isChecked) {
                            permissions.delete(newkey);
                          } else {
                            permissions.add(newkey);
                          }
                          return new Set(permissions);
                        })
                      }
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
