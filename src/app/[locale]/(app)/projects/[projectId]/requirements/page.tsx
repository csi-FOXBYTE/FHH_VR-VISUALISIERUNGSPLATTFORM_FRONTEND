"use client";

import { trpc } from "@/server/trpc/client";
import { Button, Grid2, Typography } from "@mui/material";
import { DataGrid, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { parseAsFloat, parseAsJson, parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";
import { z } from "zod";
import { SettingsOutlined } from "@mui/icons-material";
export default function Requirements() {
  const { projectId } = useParams();

  const t = useTranslations();

  // #region Pagination

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
    [setPage, setPageSize]
  );

  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsJson(z.enum(["asc", "desc"]).optional().parse)
  );
  const [sortBy, setSortyBy] = useQueryState(
    "sortBy",
    parseAsString.withDefault("")
  );

  const { data: project, isPending: isProjectsPending } =
    trpc.projectRouter.getProject.useQuery(
      { projectId: projectId as string },
      {
        enabled: !!projectId,
        placeholderData: keepPreviousData,
      }
    );

  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      if (model.length === 0) {
        setSortyBy(() => "");
        setSortOrder(() => null);
      }

      setSortyBy(() => model[0].field);
      setSortOrder(() => model[0].sort ?? null);
    },
    [setSortOrder, setSortyBy]
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

  // #endregion

  return (
    <>
      <Typography variant="h1">
        {t("routes./project/requirements.title")}
      </Typography>
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
          rows={project?.requirements ?? []}
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
          rowCount={project?.requirements.length ?? 0}
          columns={[
            {
              field: "title",
              headerName: t("routes./project/requirements.column1"),
              flex: 1,
            },
            {
              field: "responsibleUser",
              headerName: t("routes./project/requirements.column2"),
              flex: 1,
            },
            {
              field: "category",
              headerName: t("routes./project/requirements.column3"),
              flex: 1,
            },
            {
              field: "assignedDate",
              headerName: t("routes./project/requirements.column4"),
              flex: 1,
            },
            {
              field: "settings",
              renderHeader: () => <SettingsOutlined />,
              renderCell: () => <Button>...</Button>,
            },
          ]}
        />
      </Grid2>
    </>
  );
}
