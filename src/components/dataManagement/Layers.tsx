import { trpc } from "@/server/trpc/client";
import { Button, ButtonGroup, Grid } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import useDataGridServerSideHelper from "../dataGridServerSide/useDataGridServerSideOptions";
import { keepPreviousData } from "@tanstack/react-query";
import { Add } from "@mui/icons-material";
import createEditDeleteActions from "../dataGridServerSide/createEditDeleteActions";

export default function Layers() {
  const { props } = useDataGridServerSideHelper("data-management-layers", {
    extraActions: (
      <ButtonGroup variant="contained">
        <Button startIcon={<Add />}>Basisdatensatz anlegen</Button>
      </ButtonGroup>
    ),
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
    <Grid container flex="1" flexDirection="column">
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
            headerName: "Name",
            flex: 1,
          },
          {
            headerName: "Creator",
            field: "creator.name",
            valueGetter: (_, row) => row.creator.name,
            type: "string",
            filterable: true,
            sortable: false,
            flex: 1,
          },
          {
            headerName: "Size in GB",
            field: "sizeGB",
            type: "number",
            valueFormatter: (value) => `${value} GB`,
          },
          {
            headerName: "Created at",
            field: "createdAt",
            type: "date",
          },
          createEditDeleteActions({
            handleDelete: () => {},
            handleEdit: () => {},
          }),
        ]}
      />
    </Grid>
  );
}
