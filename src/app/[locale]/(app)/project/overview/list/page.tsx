"use client";

import { trpc } from "@/server/trpc/client";
import { AccessTime, Autorenew, Person, Error } from "@mui/icons-material";
import { Chip, Grid2 } from "@mui/material";
import { DataGrid, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import { useFormatter } from "next-intl";
import { parseAsFloat, parseAsJson, parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";
import { z } from "zod";

export default function ProjectOverviewListPage() {
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsFloat.withDefault(25)
  );

  const [page, setPage] = useQueryState("page", parseAsFloat.withDefault(1));

  const paginationModel = useMemo(() => {
    return {
      page,
      pageSize,
    };
  }, [page, pageSize]);

  const handlePaginationModelChange = useCallback(
    ({ page, pageSize }: GridPaginationModel) => {
      setPage(() => page);
      setPageSize(() => pageSize);
    },
    []
  );

  const [sortBy, setSortyBy] = useQueryState(
    "sortBy",
    parseAsString.withDefault("")
  );

  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsJson(z.enum(["asc", "desc"]).optional().parse)
  );

  const sortModel = useMemo<GridSortModel>(() => {
    if (sortBy === "" || sortOrder === null) return [];

    return [
      {
        field: sortBy,
        sort: sortOrder === "asc" ? "asc" : "desc",
      },
    ];
  }, [sortBy, sortOrder]);

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    if (model.length === 0) {
      setSortyBy(() => "");
      setSortOrder(() => null);
    }

    setSortyBy(() => model[0].field);
    setSortOrder(() => model[0].sort ?? null);
  }, []);

  const [filter] = useQueryState(
    "filter",
    parseAsJson(z.record(z.string(), z.string()).default({}).parse)
  );

  const {
    data: { data: projects, count } = { count: 0, data: [] },
    isPending: isProjectsPending,
  } = trpc.projectOverviewRouter.getProjects.useQuery(
    {
      filter: filter ?? {},
      limit: pageSize,
      skip: page * pageSize,
      search: {},
      sortBy,
      sortOrder: sortOrder ?? undefined,
    },
    {
      placeholderData: keepPreviousData,
    }
  );

  const formatter = useFormatter();

  return (
    <Grid2
      container
      flexDirection="column"
      flexGrow="1"
      flexWrap="nowrap"
      overflow="hidden"
      marginTop={2}
      spacing={2}
    >
      <DataGrid
        rows={projects}
        getRowId={(row) => row.id}
        paginationMode="server"
        paginationModel={paginationModel}
        pagination
        filterMode="server"
        sortingMode="server"
        pageSizeOptions={[25, 50, 100]}
        onPaginationModelChange={handlePaginationModelChange}
        onSortModelChange={handleSortModelChange}
        sortModel={sortModel}
        loading={isProjectsPending}
        rowCount={count}
        columns={[
          {
            field: "buildingNumber",
            headerName: "Gebäudenummer",
          },
          {
            field: "title",
            headerName: "Projektname",
          },
          {
            field: "projectLead",
            headerName: "Projektleiter",
            renderCell: ({ row: { projectLead } }) => (
              <Chip variant="outlined" icon={<Person />} label={projectLead} />
            ),
          },
          {
            field: "state",
            headerName: "Status",
            renderCell: ({ row: { state } }) => {
              switch (state) {
                case "active":
                  return (
                    <Chip
                      color="success"
                      icon={<Autorenew />}
                      label="In Arbeit"
                      variant="outlined"
                    />
                  );
                case "critical":
                  return (
                    <Chip
                      color="error"
                      icon={<AccessTime />}
                      label="Kritisch"
                      variant="outlined"
                    />
                  );
                case "delayed":
                  return (
                    <Chip
                      color="warning"
                      icon={<Error />}
                      label="Verzögert"
                      variant="outlined"
                    />
                  );
              }
            },
          },
        ]}
      />
    </Grid2>
  );
}
