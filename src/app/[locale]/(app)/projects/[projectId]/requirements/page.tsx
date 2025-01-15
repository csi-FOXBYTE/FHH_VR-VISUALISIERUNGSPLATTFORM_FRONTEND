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
import CreateRequirementDialog from "@/components/project/CreateRequirementDialog";
import OptionsButton from "@/components/common/OptionsButton";
import { IRequirement } from "@/server/services/projectService";
import RequirementHistoryDialog from "@/components/project/RequirementHistoryDialog";

const StyledBox = styled(Box)({
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "100%",
});

// #region Component

export default function Requirements() {
  const { projectId } = useParams();
  const [editRequirement, setEditRequirement] = useState<IRequirement | null>(
    null
  );
  const [historyRequirement, setHistoryRequirement] =
    useState<IRequirement | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [historyModalOpened, setHistoryModalOpened] = useState(false);

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

  const deleteRequirementMutation =
    trpc.requirementsRouter.deleteRequirement.useMutation({
      onSuccess: () => {
        refetch();
      },
    });

  // #endregion

  // #region Handlers

  const handleEditRequirementClick = useCallback(
    (requirementId: string) => {
      const requirement = project?.requirements.find(
        (req) => req.id === requirementId
      );
      if (requirement) {
        setEditRequirement(requirement);
        setCreateModalOpened(true);
      }
    },
    [project]
  );

  const resetEditMode = useCallback(() => {
    setEditRequirement(null);
    setCreateModalOpened(false);
  }, []);

  const resetHistoryMode = useCallback(() => {
    setHistoryRequirement(null);
    setHistoryModalOpened(false);
  }, []);

  const handleHistoryRequirementClick = useCallback(
    (requirementId: string) => {
      const requirement = project?.requirements.find(
        (req) => req.id === requirementId
      );
      if (requirement) {
        setHistoryRequirement(requirement);
        setHistoryModalOpened(true);
      }
    },
    [project]
  );

  const handleDeleteRequirementClick = useCallback(
    (requirementId: string) => {
      deleteRequirementMutation.mutate({
        projectId: projectId as string,
        requirementId,
      });
    },
    [deleteRequirementMutation, projectId]
  );

  // #endregion

  // #region Options

  const options = (requirementId: string) => [
    {
      name: t("routes./project/requirements.edit"),
      action: () => handleEditRequirementClick(requirementId),
      icon: <Edit />,
    },
    {
      name: t("routes./project/requirements.history"),
      action: () => handleHistoryRequirementClick(requirementId),
      icon: <History />,
    },
    {
      name: t("routes./project/requirements.delete"),
      action: () => handleDeleteRequirementClick(requirementId),
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

  // #region Render

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
            {t("routes./project/requirements.title")}
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
              {t("routes./project/requirements.addButton")}
            </Button>
          </ButtonGroup>
        </Grid2>

        <Grid2 size="grow">
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
                renderCell: (params) => (
                  <OptionsButton options={options(params.row.id)} />
                ),
              },
            ]}
          />
        </Grid2>
        <CreateRequirementDialog
          open={createModalOpened}
          close={() => {
            resetEditMode();
          }}
          project={project}
          refetch={refetch}
          initialValues={editRequirement}
          isEdit={!!editRequirement}
        />
        <RequirementHistoryDialog
          open={historyModalOpened}
          close={() => {
            resetHistoryMode();
          }}
          requirement={historyRequirement}
        />
      </Grid2>
    </StyledBox>
  );
  // #endregion
}
// #endregion
