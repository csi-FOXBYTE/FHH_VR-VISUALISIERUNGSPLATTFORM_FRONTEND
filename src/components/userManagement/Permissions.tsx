"use client";

import { MenuItem, Select, Typography } from "@mui/material";
import PermissionsMatrix from "./PermissionsMatrix";
import { trpc } from "@/server/trpc/client";
import { skipToken } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";

export default function Permissions() {
  const [selectedRoleId, setSelectedRoleId] = useQueryState(
    "selectedRoleId",
    parseAsString
  );

  const {} =
    trpc.userManagementRouter.permissions.getPerRoleId.useQuery(skipToken);

  const { data: roles = [] } =
    trpc.userManagementRouter.permissions.getAllRoles.useQuery();

  return (
    <>
      <Select>
        {roles.map((role) => (
          <MenuItem key={role.id}>{role.name}</MenuItem>
        ))}
      </Select>
      {selectedRoleId === null ? (
        <Typography>
          Bitte Rolle auswählen um Berechtigungen einzustellen
        </Typography>
      ) : (
        <PermissionsMatrix />
      )}
    </>
  );
}
