import { trpc } from "@/server/trpc/client";
import { Add } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import createEditDeleteActions from "../dataGridServerSide/createEditDeleteActions";
import useDataGridServerSideHelper from "../dataGridServerSide/useDataGridServerSideOptions";
import { useTranslations } from "next-intl";
import { Chip, Grid } from "@mui/material";

export default function Layers() {
  const t = useTranslations();

  const { props } = useDataGridServerSideHelper("data-management-layers", {
    extraActions: [
      {
        icon: <Add />,
        label: t("actions.create"),
        key: "base",
        disabled: true,
        onClick: () => {},
      },
    ],
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
            isDisabled: () => true,
          }),
        ]}
      />
    </>
  );
}
