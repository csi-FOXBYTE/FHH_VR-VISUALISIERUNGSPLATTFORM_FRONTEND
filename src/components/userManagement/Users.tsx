"use client";

import { trpc } from "@/server/trpc/client";
import { Add } from "@mui/icons-material";
import { Chip, Grid, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import UserAvatar from "../common/UserAvatar";
import createEditDeleteActions from "../dataGridServerSide/useCreateEditDeleteActions";
import useDataGridServerSideHelper from "../dataGridServerSide/useDataGridServerSideOptions";
import UserCUDialog, { useUserCUDialogState } from "./UserCUDialog";
import { useSnackbar } from "notistack";
import { useTranslations } from "next-intl";
import useCreateEditDeleteActions from "../dataGridServerSide/useCreateEditDeleteActions";

export default function Users() {
  const [, { openCreate, openUpdate }] = useUserCUDialogState();

  const t = useTranslations();

  const { props } = useDataGridServerSideHelper("user-management/permissions", {
    extraActions: [
      {
        icon: <Add />,
        key: "create",
        label: t("actions.invite"),
        onClick: () => openCreate(),
      },
    ],
  });

  const { data: { data, count } = { data: [], count: 0 }, isLoading } =
    trpc.userManagementRouter.users.list.useQuery(
      {
        filterModel: props.filterModel,
        paginationModel: props.paginationModel,
        sortModel: props.sortModel,
      },
      {
        placeholderData: keepPreviousData,
      }
    );

  const { enqueueSnackbar } = useSnackbar();

  const utils = trpc.useUtils();

  const { mutate: deleteMutation, isPending: isDeleteMutationPending } =
    trpc.userManagementRouter.users.delete.useMutation({
      onSuccess: () => {
        utils.userManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.delete-success", {
            entity: t("entities.user"),
          }),
        });
        close();
      },
      onError: () =>
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.delete-failed", {
            entity: t("entities.user"),
          }),
        }),
    });

  const createEditDeleteActions = useCreateEditDeleteActions({
    handleDelete: (id) => deleteMutation({ id }),
    handleEdit: openUpdate,
    loading: isDeleteMutationPending,
  });

  return (
    <>
      <UserCUDialog />
      <DataGrid
        {...props}
        loading={isLoading}
        rows={data}
        columns={[
          {
            field: "name",
            flex: 1,
            headerName: t("user-management.name"),
            renderCell: ({ row: { image, name, email } }) => (
              <Grid container alignItems="center" height="100%" spacing={2}>
                <UserAvatar src={image ?? undefined} name={name ?? email} />
                <Typography variant="body2">{name ?? "-"}</Typography>
              </Grid>
            ),
          },
          {
            field: "email",
            flex: 1,
            headerName: t("user-management.email"),
          },
          {
            field: "assignedGroups",
            filterable: false,
            sortable: false,
            headerName: t("user-management.assigned-groups"),
            flex: 1,
            renderCell: ({
              row: { assignedGroups },
            }: {
              row: (typeof data)[number];
            }) => (
              <Grid spacing={2}>
                {assignedGroups.map((assignedGroup) => (
                  <Chip key={assignedGroup.id} label={assignedGroup.name} />
                ))}
              </Grid>
            ),
          },
          createEditDeleteActions,
        ]}
        rowCount={count}
      />
    </>
  );
}
