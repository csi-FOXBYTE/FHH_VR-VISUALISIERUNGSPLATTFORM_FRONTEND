import { trpc } from "@/server/trpc/client";
import { Add, Check, Close } from "@mui/icons-material";
import {
  Box,
  Chip,
  CircularProgress,
  CircularProgressProps,
  Grid,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { keepPreviousData, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import useCreateEditDeleteActions from "../dataGridServerSide/useCreateEditDeleteActions";
import useDataGridServerSideHelper from "../dataGridServerSide/useDataGridServerSideOptions";
import ConvertingDialog from "./ConvertingDialog";
import AddingDialog from "./AddingDialog";
import { useSnackbar } from "notistack";
import { getApis } from "@/server/gatewayApi/client";

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number }
) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ color: "text.secondary", fontSize: 9 }}
        >{`${props.value.toFixed(1)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function Layers() {
  const t = useTranslations();

  const [convertingDialogOpen, setConvertingDialogOpen] = useState(false);
  const [addingDialogOpen, setAddingDialogOpen] = useState(false);

  const { props } = useDataGridServerSideHelper("data-management-layers", {
    extraActions: [
      {
        icon: <Add />,
        label: t("actions.add"),
        key: "add",
        onClick: () => setAddingDialogOpen(true),
      },
      {
        icon: <Add />,
        label: t("actions.converting"),
        key: "base",
        onClick: () => setConvertingDialogOpen(true),
      },
    ],
  });

  const utils = trpc.useUtils();

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: deleteMutation } = useMutation({
    mutationFn: async (values: { id: string }) => {
      const apis = await getApis();

      await apis.baseLayerApi.baseLayerIdDelete({ id: values.id });
    },
    onSuccess: () => {
      utils.dataManagementRouter.invalidate();
      enqueueSnackbar({
        variant: "success",
        message: t("generic.crud-notifications.create-success", {
          entity: t("entities.base-layer"),
        }),
      });
    },
    onError: (error) => {
      console.error(error);
      enqueueSnackbar({
        variant: "error",
        message: t("generic.crud-notifications.create-failed", {
          entity: t("entities.base-layer"),
        }),
      });
    },
  });

  const createEditDeleteActions = useCreateEditDeleteActions({
    handleDelete: (id) => {
      deleteMutation({ id });
    },
    isDisabled: () => ({ delete: false, edit: true }),
  });

  const { data: { data, count } = { count: 0, data: [] }, isLoading } =
    trpc.dataManagementRouter.listBaseLayers.useQuery(
      {
        filterModel: props.filterModel,
        paginationModel: props.paginationModel,
        sortModel: props.sortModel,
      },
      {
        placeholderData: keepPreviousData,
      }
    );

  return (
    <>
      <ConvertingDialog
        open={convertingDialogOpen}
        close={() => setConvertingDialogOpen(false)}
      />
      <AddingDialog
        open={addingDialogOpen}
        close={() => setAddingDialogOpen(false)}
      />
      <DataGrid
        {...props}
        loading={isLoading}
        rowCount={count}
        rows={data}
        columns={[
          {
            field: "type",
            type: "singleSelect",
            headerName: t("data-management.type"),
            valueOptions: [
              {
                label: `🏢 - ${t("data-management.3d-tiles")}`,
                value: "TILES3D",
              },
              {
                label: `⛰️ - ${t("data-management.terrain")}`,
                value: "TERRAIN",
              },
              {
                label: `🖼️ - ${t("data-management.imagery")}`,
                value: "IMAGERY",
              },
            ],
          },
          {
            field: "name",
            type: "string",
            headerName: t("data-management.name"),
            flex: 1,
          },
          {
            field: "progress",
            headerName: t("data-management.progress"),
            type: "number",
            renderCell: ({ row }) => {
              switch (row.status) {
                case "ACTIVE":
                  return (
                    <Grid
                      container
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <CircularProgressWithLabel value={row.progress} />
                    </Grid>
                  );
                case "PENDING":
                  return (
                    <Grid
                      container
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <CircularProgress value={row.progress} />
                    </Grid>
                  );
                case "FAILED":
                  return (
                    <Grid
                      container
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Close />
                    </Grid>
                  );
                case "COMPLETED":
                  return (
                    <Grid
                      container
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Check />
                    </Grid>
                  );
              }
            },
          },
          {
            headerName: t("data-management.owner"),
            field: "owner.name",
            valueGetter: (_, row) => row.owner?.name,
            type: "string",
            filterable: true,
            sortable: false,
            flex: 1,
          },
          {
            headerName: t("data-management.visible-for-groups"),
            field: "visibleForGroups",
            filterable: false,
            sortable: false,
            renderCell: ({
              row: { visibleForGroups },
            }: {
              row: (typeof data)[number];
            }) => (
              <Grid spacing={2}>
                {visibleForGroups.map((visibleForGroup) => (
                  <Chip key={visibleForGroup.id} label={visibleForGroup.name} />
                ))}
              </Grid>
            ),
            flex: 1,
          },
          {
            headerName: t("data-management.size-in-gb"),
            field: "sizeGB",
            type: "number",
            valueFormatter: (value) => `${value} GB`,
          },
          {
            headerName: t("data-management.create-at"),
            field: "createdAt",
            type: "date",
          },
          createEditDeleteActions,
        ]}
      />
    </>
  );
}
