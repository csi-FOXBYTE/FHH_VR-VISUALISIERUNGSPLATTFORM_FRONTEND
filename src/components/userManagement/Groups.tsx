"use client";

import { trpc } from "@/server/trpc/client";
import { DataGrid } from "@mui/x-data-grid";
import useDataGridServerSideHelper from "../dataGridServerSide/useDataGridServerSideOptions";
import { keepPreviousData } from "@tanstack/react-query";
import createEditDeleteActions from "../dataGridServerSide/createEditDeleteActions";
import GroupsCUDialog, { useGroupCUDialogState } from "./GroupCUDialog";
import { Add } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useTranslations } from "next-intl";
import { Chip, Grid } from "@mui/material";

export default function Groups() {
  const [, { openCreate, openUpdate }] = useGroupCUDialogState();

  const t = useTranslations();

  const { props } = useDataGridServerSideHelper("user-management/permissions", {
    extraActions: [
      {
        icon: <Add />,
        key: "add",
        label: t("actions.create"),
        onClick: openCreate,
      },
    ],
  });

  const { data: { data, count } = { data: [], count: 0 }, isLoading } =
    trpc.userManagementRouter.groups.list.useQuery(
      {
        filterModel: props.filterModel,
        paginationModel: props.paginationModel,
        sortModel: props.sortModel,
      },
      {
        placeholderData: keepPreviousData,
      }
    );

  const utils = trpc.useUtils();

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: deleteMutation, isPending: isDeleteMutationPending } =
    trpc.userManagementRouter.groups.delete.useMutation({
      onSuccess: () => {
        utils.userManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.delete-success", {
            entity: t("entities.group"),
          }),
        });
        close();
      },
      onError: () =>
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.delete-failed", {
            entity: t("entities.group"),
          }),
        }),
    });

  return (
    <>
      <GroupsCUDialog />
      <DataGrid
        {...props}
        loading={isLoading}
        columns={[
          {
            field: "name",
            flex: 1,
            headerName: t("user-management.name"),
          },
          {
            field: "defaultFor",
            headerName: t("user-management.default-for"),
            flex: 1,
          },
          {
            field: "assignedRoles",
            headerName: t("user-management.assigned-roles"),
            flex: 1,
            renderCell: ({
              row: { assignedRoles },
            }: {
              row: (typeof data)[number];
            }) => (
              <Grid spacing={2}>
                {assignedRoles.map((assignedRole) => (
                  <Chip key={assignedRole.id} label={assignedRole.name} />
                ))}
              </Grid>
            ),
          },
          {
            field: "isAdminGroup",
            headerName: t("user-management.is-admin-group"),
            valueGetter: (value) => (value ? "✅" : "❌"),
          },
          createEditDeleteActions({
            handleDelete: (id) => deleteMutation({ id }),
            handleEdit: openUpdate,
            loading: isDeleteMutationPending,
            isDisabled: (row: (typeof data)[number]) => ({
              delete: row.isAdminGroup,
            }),
          }),
        ]}
        rows={data}
        rowCount={count}
      />
    </>
  );
}
