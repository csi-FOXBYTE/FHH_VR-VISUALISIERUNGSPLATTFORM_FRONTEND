"use client";

import { trpc } from "@/server/trpc/client";
import { Add, Delete, Save } from "@mui/icons-material";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { skipToken } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import PermissionsMatrix from "./PermissionsMatrix";

const emptyArray: { name: string }[] = [];

export default function Roles() {
  const t = useTranslations();

  const { data: roles = [] } = trpc.userManagementRouter.roles.list.useQuery();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const selectedRole = useMemo(() => {
    return roles.find((role) => role.id === selectedRoleId);
  }, [roles, selectedRoleId]);

  const {
    data: permissionsPerRole = emptyArray,
    isLoading: isGetPermissionsForRoleQueryPending,
  } = trpc.userManagementRouter.roles.getPermissionsForRole.useQuery(
    selectedRoleId === null ? skipToken : { roleId: selectedRoleId }
  );

  const utils = trpc.useUtils();

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: deleteMutation, isPending: isDeleteMutationPending } =
    trpc.userManagementRouter.roles.delete.useMutation({
      onSuccess: () => {
        utils.userManagementRouter.invalidate();
        setSelectedRoleId(null);
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.delete-success", {
            entity: t("entities.role"),
          }),
        });
        close();
      },
      onError: () => {
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.delete-failed", {
            entity: t("entities.role"),
          }),
        });
      },
    });

  const { mutate: createMutation, isPending: isCreateMutationPending } =
    trpc.userManagementRouter.roles.create.useMutation({
      onSuccess: () => {
        utils.userManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.create-success", {
            entity: t("entities.role"),
          }),
        });
        close();
      },
      onError: () => {
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.create-failed", {
            entity: t("entities.role"),
          }),
        });
      },
    });

  const { mutate: updateMutation, isPending: isUpdateMutationPending } =
    trpc.userManagementRouter.roles.update.useMutation({
      onSuccess: () => {
        utils.userManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.update-success", {
            entity: t("entities.role"),
          }),
        });
        close();
      },
      onError: (error) => {
        console.error(error);
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.update-failed", {
            entity: t("entities.role"),
          }),
        });
      },
    });

  const [name, setName] = useState<string>("");
  const [value, setValue] = useState<string[]>([]);

  useEffect(() => {
    setValue(
      permissionsPerRole.map((permissionPerRole) => permissionPerRole.name)
    );
  }, [permissionsPerRole]);

  useEffect(() => {
    setName(selectedRole?.name ?? "");
  }, [selectedRole?.name]);

  return (
    <Grid
      container
      flexDirection="column"
      width="100%"
      height="100%"
      sx={{ overflowY: "auto" }}
      paddingTop={1}
      spacing={2}
    >
      <FormControl>
        <InputLabel>{t("entities.role")}</InputLabel>
        <Select
          value={selectedRoleId}
          onChange={(event) => setSelectedRoleId(event.target.value)}
          label={t("entities.role")}
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Grid container>
        <TextField
          label={t("user-management.name")}
          value={name}
          onChange={(event) => setName(event.target.value)}
          style={{ flex: 1 }}
        />
        <Grid container spacing={0}>
          <Button
            variant="contained"
            disabled={name === "" || selectedRole?.name === name}
            startIcon={<Add />}
            onClick={() => createMutation({ name })}
            loading={isCreateMutationPending}
          >
            {t("actions.create")}
          </Button>
          <Button
            variant="contained"
            disabled={selectedRoleId === null || selectedRole?.isAdminRole}
            loading={isUpdateMutationPending}
            onClick={() =>
              updateMutation({ id: selectedRoleId!, name, permissions: value })
            }
            startIcon={<Save />}
          >
            {t("actions.save")}
          </Button>
          <Button
            variant="contained"
            startIcon={<Delete />}
            disabled={selectedRoleId === null || selectedRole?.isAdminRole}
            loading={isDeleteMutationPending}
            onClick={() => deleteMutation({ id: selectedRoleId! })}
          >
            {t("actions.delete")}
          </Button>
        </Grid>
      </Grid>
      <PermissionsMatrix
        loading={isGetPermissionsForRoleQueryPending}
        value={value}
        onChange={setValue}
      />
    </Grid>
  );
}
