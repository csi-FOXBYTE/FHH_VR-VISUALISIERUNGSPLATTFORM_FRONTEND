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
  Edit,
  History,
  Refresh,
  SettingsOutlined,
} from "@mui/icons-material";
import OptionsButton from "@/components/common/OptionsButton";
import { IGoal } from "@/server/services/projectService";
import CreateGoalDialog from "@/components/project/CreateGoalDialog";
import GoalHistoryDialog from "@/components/project/GoalHistoryDialog";

const StyledBox = styled(Box)({
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "100%",
});

//TODO: sorting currently not working, because not getting goals via extra server request like projects

export default function Goals() {
  const { projectId } = useParams();
  const [editGoal, setEditGoal] = useState<IGoal | null>(null);
  const [historyGoal, setHistoryGoal] = useState<IGoal | null>(null);
  const [historyModalOpened, setHistoryModalOpened] = useState(false);
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const t = useTranslations();

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

  const deleteGoalMutation = trpc.goalsRouter.deleteGoal.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleEditGoalClick = useCallback(
    (goalId: string) => {
      const goal = project?.goals.find((req) => req.id === goalId);
      if (goal) {
        setEditGoal(goal);
        setCreateModalOpened(true);
      }
    },
    [project]
  );

  const resetEditMode = useCallback(() => {
    setEditGoal(null);
    setCreateModalOpened(false);
  }, []);

  const resetHistoryMode = useCallback(() => {
    setHistoryGoal(null);
    setCreateModalOpened(false);
  }, []);

  const handleHistoryGoalClick = useCallback(
    (goalId: string) => {
      const goal = project?.goals.find((req) => req.id === goalId);
      if (goal) {
        setHistoryGoal(goal);
        setHistoryModalOpened(true);
      }
    },
    [project]
  );

  const handleDeleteGoalClick = useCallback(
    (goalId: string) => {
      deleteGoalMutation.mutate({
        projectId: projectId as string,
        goalId,
      });
    },
    [deleteGoalMutation, projectId]
  );

  const options = (goalId: string) => [
    {
      name: t("routes./project/goals.edit"),
      action: () => handleEditGoalClick(goalId),
      icon: <Edit />,
    },
    {
      name: t("routes./project/goals.history"),
      action: () => handleHistoryGoalClick(goalId),
      icon: <History />,
    },
    {
      name: t("routes./project/goals.delete"),
      action: () => handleDeleteGoalClick(goalId),
      icon: <Delete />,
    },
  ];

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
            {t("routes./project/goals.title")}
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
              {t("routes./project/goals.addButton")}
            </Button>
          </ButtonGroup>
        </Grid2>

        <Grid2 size="grow">
          <DataGrid
            rows={project?.goals ?? []}
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
            rowCount={project?.goals.length ?? 0}
            columns={[
              {
                field: "title",
                headerName: t("routes./project/goals.column1"),
                flex: 1,
              },
              {
                field: "responsibleUser",
                headerName: t("routes./project/goals.column2"),
                flex: 1,
              },
              {
                field: "category",
                headerName: t("routes./project/goals.column3"),
                flex: 1,
              },
              {
                field: "assignedDate",
                headerName: t("routes./project/goals.column4"),
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
        <CreateGoalDialog
          open={createModalOpened}
          close={() => {
            resetEditMode();
            setCreateModalOpened(false);
          }}
          project={project}
          refetch={refetch}
          initialValues={editGoal}
          isEdit={!!editGoal}
        />
        <GoalHistoryDialog
          open={historyModalOpened}
          close={() => {
            resetHistoryMode();
          }}
          goal={historyGoal}
        />
      </Grid2>
    </StyledBox>
  );
}
