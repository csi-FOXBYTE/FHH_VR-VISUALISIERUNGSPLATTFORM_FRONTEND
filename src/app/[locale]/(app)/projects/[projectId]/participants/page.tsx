"use client";

import { trpc } from "@/server/trpc/client";
import {
  Box,
  Button,
  ButtonGroup,
  Grid2,
  styled,
  Typography,
} from "@mui/material";
import { DataGrid, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { parseAsFloat, parseAsJson, parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import {
  Add,
  Delete,
  History,
  Refresh,
  SettingsOutlined,
} from "@mui/icons-material";
import OptionsButton from "@/components/common/OptionsButton";
import AddParticipantDialog from "@/components/project/AddParticipantDialog";

const StyledBox = styled(Box)({
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "100%",
});

// #region Component

export default function Participants() {
  const { projectId } = useParams();
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const t = useTranslations();

  // #region Data Fetching

  const {
    data: project,
    isPending: isProjectsPending,
    refetch,
  } = trpc.projectRouter.getProject.useQuery(
    { projectId: projectId as string },
    {
      enabled: !!projectId,
      placeholderData: keepPreviousData,
    }
  );

  const deleteParticipantMutation =
    trpc.participantsRouter.deleteParticipant.useMutation({
      onSuccess: () => {
        refetch();
      },
    });

  // #endregion

  // #region Handlers
  const handleTasksParticipantClick = useCallback((participantId: string) => {
    console.log("TODO:" + participantId);
  }, []);

  const handleDeleteParticipantClick = useCallback(
    (participantId: string) => {
      deleteParticipantMutation.mutate({
        projectId: projectId as string,
        participantId,
      });
    },
    [deleteParticipantMutation, projectId]
  );

  // #endregion

  // #region Options

  const options = (participantId: string) => [
    {
      name: t("routes./project/participants.addTaskOption"),
      action: () => handleTasksParticipantClick(participantId),
      icon: <History />,
    },
    {
      name: t("routes./project/participants.deleteOption"),
      action: () => handleDeleteParticipantClick(participantId),
      icon: <Delete />,
    },
  ];

  // #endregion

  // #region Pagination and Sorting

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

  if (!project) return null;
  return (
    <StyledBox>
      <Grid2
        container
        flexDirection="column"
        flexGrow="1"
        flexShrink="1"
        flexWrap="nowrap"
        overflow="hidden"
        paddingTop={2}
        spacing={2}
        size="grow"
        height={"100%"}
      >
        <Grid2
          container
          spacing={2}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h1">
            {t("routes./project/participants.title")}
          </Typography>
          <ButtonGroup>
            <Button
              variant="text"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              sx={{
                justifyContent: "center",
                marginRight: "16px",
              }}
            >
              {t("routes./common.refreshButton")}
            </Button>
            <Button
              onClick={() => setCreateModalOpened(true)}
              variant="contained"
              startIcon={<Add />}
              sx={{
                justifyContent: "center",
              }}
            >
              {t("routes./project/participants.addButton")}
            </Button>
          </ButtonGroup>
        </Grid2>

        <Grid2 size="grow">
          <DataGrid
            rows={project?.participants ?? []}
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
            rowCount={project?.participants.length ?? 0}
            columns={[
              {
                field: "name",
                headerName: t("routes./project/participants.column1"),
                flex: 1,
              },
              {
                field: "lastName",
                headerName: t("routes./project/participants.column2"),
                flex: 1,
              },
              {
                field: "email",
                headerName: t("routes./project/participants.column3"),
                flex: 1,
              },
              {
                field: "phoneNumber",
                headerName: t("routes./project/participants.column4"),
                flex: 1,
              },
              {
                field: "role",
                headerName: t("routes./project/participants.column5"),
                flex: 1,
              },
              {
                field: "department",
                headerName: t("routes./project/participants.column6"),
                flex: 1,
              },
              {
                field: "position",
                headerName: t("routes./project/participants.column7"),
                flex: 1,
              },
              {
                field: "settings",
                renderHeader: () => <SettingsOutlined />,
                renderCell: (params) => (
                  <OptionsButton options={options(params.row.id)} />
                ),
              },
            ]}
          />
        </Grid2>
        <AddParticipantDialog
          open={createModalOpened}
          close={() => {
            setCreateModalOpened(false);
          }}
          project={project}
          refetch={refetch}
        />
      </Grid2>
    </StyledBox>
  );
}

// #endregion
