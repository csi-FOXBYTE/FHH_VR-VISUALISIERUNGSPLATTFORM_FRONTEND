import { trpc } from "@/server/trpc/client";
import { Add, Check, Close } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import createEditDeleteActions from "../dataGridServerSide/createEditDeleteActions";
import useDataGridServerSideHelper from "../dataGridServerSide/useDataGridServerSideOptions";
import { useTranslations } from "next-intl";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  CircularProgressProps,
  Grid,
  Typography,
} from "@mui/material";
import { useState } from "react";
import LayersDialog from "./LayersDialog";

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

  const [open, setOpen] = useState(false);

  const { props } = useDataGridServerSideHelper("data-management-layers", {
    extraActions: [
      {
        icon: <Add />,
        label: t("actions.create"),
        key: "base",
        onClick: () => setOpen(true),
      },
    ],
  });

  const utils = trpc.useUtils();

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
      <Button
        onClick={() => utils.dataManagementRouter.listBaseLayers.refetch()}
      >
        Refresh
      </Button>
      <LayersDialog open={open} close={() => setOpen(false)} />
      <DataGrid
        {...props}
        loading={isLoading}
        rowCount={count}
        rows={data}
        columns={[
          {
            field: "type",
            type: "singleSelect",
            headerName: "Type",
            valueOptions: [
              { label: "🏢 - 3D Tile", value: "3D-TILES" },
              { label: "⛰️ - Terrain", value: "TERRAIN" },
              { label: "🖼️ - Imagery", value: "IMAGERY" },
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
          createEditDeleteActions({
            handleDelete: () => {},
            handleEdit: () => {},
            isDisabled: () => ({ delete: true, edit: true }),
          }),
        ]}
      />
    </>
  );
}
