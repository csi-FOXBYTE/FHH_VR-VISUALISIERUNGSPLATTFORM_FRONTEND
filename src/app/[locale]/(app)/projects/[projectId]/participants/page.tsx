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
import { DataGrid, GridColDef, } from "@mui/x-data-grid";
import { keepPreviousData } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import {
  Add,
  Refresh,
  Delete,
  Edit,
  SettingsOutlined,
} from "@mui/icons-material";
import OptionsButton from "@/components/common/OptionsButton";
import usePaginationAndSorting from "@/components/hooks/usePaginationAndSorting";


//#region Utils (external)

const StyledBox = styled(Box)({
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "flex-start",
  height: '100%',
  overflow: 'hidden',
});

//#endregion
// #region Component Start

export default function ParticipantsPage() {

  //#region Hooks
  const { projectId } = useParams();
  const { paginationModel, sortModel, sortBy, sortOrder, handlePaginationModelChange, handleSortModelChange } = usePaginationAndSorting();
  const t = useTranslations();
  // #endregion

  // #region Fetching/Queries
  const {
    data: { data: participants, count } = { count: 0, data: [] },
    isPending: isProjectsPending,
    refetch,
  } = trpc.participantsRouter.getParticipants.useQuery(
    {
      projectId: projectId as string,
      limit: paginationModel.pageSize,
      skip: Math.max(paginationModel.page - 1) * paginationModel.pageSize,
      sortBy,
      sortOrder: sortOrder ?? undefined
    },
    {
      enabled: !!projectId,
      placeholderData: keepPreviousData,
    }
  );

  const deleteParticipantMutation = trpc.participantsRouter.deleteParticipant.useMutation({
    onSuccess: () => {
      console.info("Participant deleted successfully");
      refetch();
    },
    onError: (error) => {
      console.error("Error deleting participant:", error);
    },
  });

  // #endregion

  // #region Handlers

  const handleDeleteParticipantClick = useCallback((participantId: string) => {
    deleteParticipantMutation.mutate({ projectId: projectId as string, participantId });
  }, [deleteParticipantMutation, projectId]);

  const handleAddTaskClick = useCallback((participantId: string) => {
    console.info("Add task clicked for participant: ", participantId);
  }, []);

  // #endregion

  //#region Options
  const options = useCallback((participantId: string) => [
    {
      name: t("routes./project/participants.addTaskOption"),
      action: () => handleAddTaskClick(participantId),
      icon: <Edit />,
    },
    {
      name: t("routes./project/participants.deleteOption"),
      action: () => handleDeleteParticipantClick(participantId),
      icon: <Delete />,
    },
  ], [handleAddTaskClick, handleDeleteParticipantClick, t]);
  //#endregion

  //#region Columns
  const columns = useMemo<GridColDef<(typeof participants)[number]>[]>(() => {
    return [
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
        field: "Role",
        headerName: t("routes./project/participants.column5"),
        flex: 1,
      },
      {
        field: "Department",
        headerName: t("routes./project/participants.column6"),
        flex: 1,
      },
      {
        field: "Etage",
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
    ]
  }, [options, t]);
  //#endregion

  //#region Render
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
        // size="grow"
        height="100%"
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
              {t("common.refreshButton")}
            </Button>
            <Button
              onClick={() => console.log("TODO:")}
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
            disableVirtualization
            rows={participants}
            getRowId={(row) => row.id}
            paginationMode="server"
            paginationModel={paginationModel}
            pagination
            filterMode="server"
            sortingMode="server"
            disableColumnFilter
            pageSizeOptions={[25, 50, 100]}
            onPaginationModelChange={handlePaginationModelChange}
            onSortModelChange={handleSortModelChange}
            sortModel={sortModel}
            loading={isProjectsPending}
            rowCount={count}
            columns={columns}
          />
        </Grid2>
      </Grid2>
    </StyledBox>
  );
}