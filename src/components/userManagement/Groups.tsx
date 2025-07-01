"use client";

import { trpc } from "@/server/trpc/client";
import { DataGrid } from "@mui/x-data-grid";
import useDataGridServerSideHelper from "../dataGridServerSide/useDataGridServerSideOptions";
import { keepPreviousData } from "@tanstack/react-query";
import createEditDeleteActions from "../dataGridServerSide/createEditDeleteActions";

export default function Groups() {
  const { props } = useDataGridServerSideHelper("user-management/permissions");

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

  return (
    <DataGrid
      {...props}
      loading={isLoading}
      columns={[
        {
          field: "name",
          flex: 1,
          headerName: "Name",
        },
        {
          field: "defaultFor",
          headerName: "Standardmäßig",
          flex: 1,
        },
        {
          field: "isAdminGroup",
          headerName: "Ist Admin Gruppe",
          valueGetter: (value) => (value ? "✅" : "❌"),
        },
        createEditDeleteActions({
          handleDelete: () => {},
          handleEdit: () => {},
        }),
      ]}
      rows={data}
      rowCount={count}
    />
  );
}
