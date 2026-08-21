"use client";

import { trpc } from "@/server/trpc/client";
import { Add, Build } from "@mui/icons-material";
import { Chip, Grid, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import UserAvatar from "../common/UserAvatar";
import useDataGridServerSideHelper from "../dataGridServerSide/useDataGridServerSideOptions";
import UserCUDialog, { useUserCUDialogState } from "./UserCUDialog";
import { useSnackbar } from "notistack";
import { useTranslations } from "next-intl";
import useCreateEditDeleteActions from "../dataGridServerSide/useCreateEditDeleteActions";
import GridQueryError from "../dataGridServerSide/GridQueryError";
import UserOwnershipDeleteDialog from "./UserOwnershipDeleteDialog";
import { useState } from "react";
import OwnershipRepairDialog from "./OwnershipRepairDialog";

export default function Users() {
  const [, { openCreate, openUpdate }] = useUserCUDialogState();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [repairOpen, setRepairOpen] = useState(false);

  const t = useTranslations();

  const { props, query } = useDataGridServerSideHelper("user-management/users", {
    extraActions: [
      {
        icon: <Add />,
        key: "create",
        label: t("actions.invite"),
        onClick: () => openCreate(),
      },
      {
        icon: <Build />,
        key: "repair-ownership",
        label: t("ownership.repair"),
        onClick: () => setRepairOpen(true),
      },
    ],
  });

  const {
    data: { data, count } = { data: [], count: 0 },
    isLoading,
    isError,
    error,
    refetch,
  } =
    trpc.userManagementRouter.users.list.useQuery(
      query,
      {
        placeholderData: keepPreviousData,
      }
    );

  const { enqueueSnackbar } = useSnackbar();

  const utils = trpc.useUtils();

  const handleDeleted = (correlationId: string) => {
    setDeleteUserId(null);
    utils.userManagementRouter.invalidate();
    enqueueSnackbar({
      variant: "success",
      message: `${t("generic.crud-notifications.delete-success", {
        entity: t("entities.user"),
      })} (${correlationId})`,
    });
  };

  const createEditDeleteActions = useCreateEditDeleteActions({
    handleDelete: setDeleteUserId,
    handleEdit: openUpdate,
    loading: false,
  });

  return (
    <>
      <UserCUDialog />
      <UserOwnershipDeleteDialog
        userId={deleteUserId}
        userLabel={
          data.find((user) => user.id === deleteUserId)?.name ??
          data.find((user) => user.id === deleteUserId)?.email
        }
        onClose={() => setDeleteUserId(null)}
        onDeleted={handleDeleted}
      />
      <OwnershipRepairDialog
        open={repairOpen}
        onClose={() => setRepairOpen(false)}
        onRepaired={(correlationId) => {
          setRepairOpen(false);
          utils.userManagementRouter.invalidate();
          enqueueSnackbar({
            variant: "success",
            message: `${t("ownership.repair-success")} (${correlationId})`,
          });
        }}
      />
      {isError ? <GridQueryError error={error} onRetry={() => refetch()} /> : null}
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
            filterable: true,
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
