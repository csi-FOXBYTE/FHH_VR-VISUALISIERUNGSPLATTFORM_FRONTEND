"use client";

import { trpc } from "@/server/trpc/client";
import { Button, Chip, Grid } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import UserAvatar from "../common/UserAvatar";
import useDataGridServerSideHelper from "../dataGridServerSide/useDataGridServerSideOptions";
import createEditDeleteActions from "../dataGridServerSide/createEditDeleteActions";
import UserCUDialog from "./UserCUDialog";
import {
  useQueryState,
  parseAsStringLiteral,
  parseAsString,
  parseAsBoolean,
} from "nuqs";
import { Add } from "@mui/icons-material";

export default function Users() {
  const { props } = useDataGridServerSideHelper("user-management/permissions", {
    extraActions: (
      <Button
        startIcon={<Add />}
        onClick={() => {
          setMode("CREATE");
          setOpen(true);
        }}
      >
        Nutzer einladen
      </Button>
    ),
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

  const [mode, setMode] = useQueryState(
    "mode",
    parseAsStringLiteral(["CREATE", "UPDATE"]).withDefault("CREATE")
  );
  const [id, setId] = useQueryState("id", parseAsString);
  const [open, setOpen] = useQueryState(
    "open",
    parseAsBoolean.withDefault(false)
  );

  return (
    <>
      <UserCUDialog
        id={id ?? undefined}
        mode={mode}
        open={open}
        close={() => setOpen(false)}
      />
      <DataGrid
        {...props}
        loading={isLoading}
        rows={data}
        columns={[
          {
            field: "name",
            flex: 1,
            headerName: "Name",
            renderCell: ({ row: { image, name } }) => (
              <Grid container alignItems="center" spacing={2}>
                <UserAvatar src={image ?? undefined} name={name ?? undefined} />
                {name}
              </Grid>
            ),
          },
          {
            field: "email",
            flex: 1,
            headerName: "Email",
          },
          {
            field: "assignedGroups",
            filterable: false,
            sortable: false,
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
          createEditDeleteActions({
            handleDelete: () => {},
            handleEdit: (id) => {
              setId(id);
              setOpen(true);
              setMode("UPDATE");
            },
          }),
        ]}
        rowCount={count}
      />
    </>
  );
}
