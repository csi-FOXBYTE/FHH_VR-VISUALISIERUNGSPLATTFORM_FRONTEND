"use client";

import { trpc } from "@/server/trpc/client";
import { Add } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import useCreateEditDeleteActions from "../dataGridServerSide/useCreateEditDeleteActions";
import useDataGridServerSideHelper from "../dataGridServerSide/useDataGridServerSideOptions";
import VisualAxisCUDialog, {
  useVisualAxisCUDialogState,
} from "./VisualAxisCUDialog";

export default function VisualAxes() {
  const t = useTranslations();

  const [, { openCreate, openUpdate }] = useVisualAxisCUDialogState();

  const { props } = useDataGridServerSideHelper("data-management-visual-axes", {
    extraActions: [
      {
        icon: <Add />,
        label: t("actions.create"),
        key: "create",
        onClick: openCreate,
      },
    ],
  });

  const utils = trpc.useUtils();

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: deleteMutation, isPending: isDeleteMutationPending } =
    trpc.dataManagementRouter.visualAxis.delete.useMutation({
      onSuccess: () => {
        utils.dataManagementRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.delete-success", {
            entity: t("entities.visual-axis"),
          }),
        });
        close();
      },
      onError: () =>
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.delete-failed", {
            entity: t("entities.visual-axis"),
          }),
        }),
    });

  const { data: { data, count } = { data: [], count: 0 }, isLoading } =
    trpc.dataManagementRouter.visualAxis.list.useQuery(
      {
        filterModel: props.filterModel,
        paginationModel: props.paginationModel,
        sortModel: props.sortModel,
      },
      {
        placeholderData: keepPreviousData,
      }
    );

    const createDeleteActions = useCreateEditDeleteActions({
      handleDelete: (id) => deleteMutation({ id }),
      loading: isDeleteMutationPending,
      handleEdit: (id) => {
        openUpdate(id);
      },
    })

  return (
    <>
      <VisualAxisCUDialog />
      <DataGrid
        {...props}
        loading={isLoading}
        rows={data}
        rowCount={count}
        columns={[
          {
            field: "name",
            flex: 1,
            headerName: t("data-management.name"),
          },
          {
            field: "description",
            headerName: t("data-management.description"),
            flex: 1,
          },
          {
            field: "startPoint",
            headerName: t("data-management.start-point"),
            renderCell({ row }) {
              return `(${row.startPointX}, ${row.startPointY}, ${row.startPointZ})`;
            },
          },
          {
            field: "endPoint",
            headerName: t("data-management.end-point"),
            renderCell({ row }) {
              return `(${row.startPointX}, ${row.startPointY}, ${row.startPointZ})`;
            },
          },
          createDeleteActions
        ]}
      />
    </>
  );
}
