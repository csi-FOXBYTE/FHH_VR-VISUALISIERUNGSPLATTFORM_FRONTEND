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
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import {
  Add,
  Refresh,
  Delete,
  Edit,
  History,
  SettingsOutlined,
} from "@mui/icons-material";
import OptionsButton from "@/components/common/OptionsButton";
import RequirementHistoryDialog from "@/components/project/RequirementHistoryDialog";
import { REQUIREMENT_CATEGORY } from "@prisma/client";

type RequirementFormValues = {
  id?: string;
  name: string;
  assignedToUserId: string;
  requirementCategory: REQUIREMENT_CATEGORY;
  createdAt: string;
};
import { DialogFactory } from "@/components/project/Dialog/DialogFactory";
import { useSession } from "next-auth/react";
import usePaginationAndSorting from "@/components/hooks/usePaginationAndSorting";


//#region Utils (external)
const generateInitialValues = <
  T extends Record<string, { initialValue: string | number | boolean | Date }>
>(
  model: T
) => {
  return Object.keys(model).reduce((acc, key) => {
    const typedKey = key as keyof T;
    acc[typedKey] = model[typedKey].initialValue;
    return acc;
  }, {} as { [K in keyof T]: T[K]["initialValue"] });
};

const StyledBox = styled(Box)({
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "flex-start",
  height: '100%',
  overflow: 'hidden',
});

export const requirementFormModel = {
  name: {
    initialValue: "",
    validation: z.string().min(1, "name is required"),
  },
  assignedToUserId: {
    initialValue: "",
    validation: z.string().min(1, "User is required"),
  },
  requirementCategory: {
    initialValue: "TECHNICAL" as REQUIREMENT_CATEGORY,
    validation: z.nativeEnum(REQUIREMENT_CATEGORY).refine(
      (val) => ["ORGANIZATIONAL", "TECHNICAL"].includes(val),
      {
        message: "Category is required",
      }
    ),
  },
  createdAt: {
    initialValue: new Date().toISOString().split("T")[0],
    validation: z.any(),//TODO: add validation
  },
};

export const generateZodValidationSchema = <
  T extends Record<string, { validation: z.ZodTypeAny }>
>(
  model: T
): z.ZodObject<{ [K in keyof T]: T[K]["validation"] }> => {
  const shape = Object.keys(model).reduce((acc, key) => {
    acc[key as keyof T] = model[key].validation;
    return acc;
  }, {} as { [K in keyof T]: T[K]["validation"] });
  return z.object(shape);
};

const validationSchema = generateZodValidationSchema(requirementFormModel);
//#endregion
// #region Component Start

export default function RequirementsPage() {

  //#region Hooks
  const { projectId } = useParams();
  const { data: session } = useSession();
  const [editRequirementId, setEditRequirementId] = useState<string | null>(null);
  const [historyRequirementId, setHistoryRequirementId] = useState<string | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [historyModalOpened, setHistoryModalOpened] = useState(false);
  const { paginationModel, sortModel, sortBy, sortOrder, handlePaginationModelChange, handleSortModelChange } = usePaginationAndSorting();
  const t = useTranslations();
  // #endregion

  // #region Fetching/Queries
  const {
    data: { data: requirements, count } = { count: 0, data: [] },
    isPending: isProjectsPending,
    refetch,
  } = trpc.requirementsRouter.getProjectRequirements.useQuery(
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

  const deleteRequirementMutation = trpc.requirementsRouter.deleteRequirement.useMutation({
    onSuccess: () => {
      console.info("Requirement deleted successfully");
      refetch();
    },
    onError: (error) => {
      console.error("Error deleting requirement:", error);
    },
  });

  const editRequirementMutation = trpc.requirementsRouter.editRequirement.useMutation({
    onSuccess: () => {
      console.info("Requirement edited successfully");
      resetEditMode();
      refetch();
    },
    onError: (error) => {
      console.error("Error editing requirement:", error);
    },
  });

  const addRequirementMutation = trpc.requirementsRouter.addRequirement.useMutation({
    onSuccess: () => {
      console.info("Requirement added successfully");
      resetEditMode();
      refetch();
    },
    onError: (error) => {
      console.error("Error adding requirement:", error);
    },
  });
  // #endregion

  // #region Handlers

  const resetEditMode = useCallback(() => {
    setEditRequirementId(null);
    setCreateModalOpened(false);
  }, []);

  const resetHistoryMode = useCallback(() => {
    setHistoryRequirementId(null);
    setHistoryModalOpened(false);
  }, []);

  const handleHistoryRequirementClick = useCallback((requirementId: string) => {
    setHistoryRequirementId(requirementId);
    setHistoryModalOpened(true);
  }, []);

  const handleDeleteRequirementClick = useCallback((requirementId: string) => {
    deleteRequirementMutation.mutate({ requirementId });
  }, [deleteRequirementMutation]);

  const handleEditRequirementClick = useCallback((requirementId: string) => {
    setEditRequirementId(requirementId);
    setCreateModalOpened(true);
  }, []);

  const handleSubmit = useCallback((values: RequirementFormValues) => {
    if (values.id) {
      editRequirementMutation.mutate({
        projectId: projectId as string,
        requirementId: values.id as string,
        data: {
          name: values.name,
          assignedToUserId: values.assignedToUserId,
          requirementCategory: values.requirementCategory,
          updatedAt: new Date(values.createdAt),
          description: "",
        },
      });
    } else {
      addRequirementMutation.mutate({
        projectId: projectId as string,
        data: {
          ...values,
          creatorId: session?.user.id as string,
          createdAt: new Date(values.createdAt),
          description: "",
        },
      });
    }
  }, [projectId, session?.user.id, editRequirementMutation, addRequirementMutation]);
  //#region Dialog Config
  const initialValues = useMemo(() => generateInitialValues(requirementFormModel), []);

  const formConfig = {
    name: {
      type: "text" as const,
      label: t("requirementDialog.requirementText"),
    },
    assignedToUserId: {
      type: "participantSelection" as const,
      label: t("requirementDialog.assignedToUserEmail"),
    },
    requirementCategory: {
      type: "radio" as const,
      label: t("requirementDialog.category"),
      options: [
        { value: "ORGANIZATIONAL", label: t("requirementDialog.orgRequirement") },
        { value: "TECHNICAL", label: t("requirementDialog.techRequirement") },
      ],
    },
    createdAt: {
      type: "date" as const,
      label: t("requirementDialog.createdAt"),
      readOnly: true,
    },
  };

  //#endregion
  // #endregion

  //#region Options
  const options = useCallback((requirementId: string) => [
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
  ], [handleEditRequirementClick, handleHistoryRequirementClick, handleDeleteRequirementClick, t]);
  //#endregion

  //#region Columns
  const columns = useMemo<GridColDef<(typeof requirements)[number]>[]>(() => [
    {
      field: "name",
      headerName: t("routes./project/requirements.column1"),
      flex: 1,
    },
    {
      field: "assignedToUser.email",
      headerName: t("routes./project/requirements.column2"),
      flex: 1,
      valueGetter: (_, row) => {
        return row.assignedToUser?.name || "";
      },
    },
    {
      field: "requirementCategory",
      headerName: t("routes./project/requirements.column3"),
      flex: 1,
    },
    {
      field: "createdAt",
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
  ], [options, t]);
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
              {t("common.refreshButton")}
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
            rows={requirements}
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
        <DialogFactory<RequirementFormValues>
          close={resetEditMode}
          projectId={projectId as string}
          open={createModalOpened}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          formConfig={formConfig}
          title={
            editRequirementId
              ? t("requirementDialog.editTitle")
              : t("requirementDialog.addTitle")
          }
          submitButtonText={t("requirementDialog.save")}
          useQuery={() =>
            trpc.requirementsRouter.getRequirement.useQuery(
              { projectId: projectId as string, requirementId: editRequirementId ?? "" },
              { enabled: !!editRequirementId }
            )
          }
        />
        <RequirementHistoryDialog
          open={historyModalOpened}
          close={resetHistoryMode}
          useQuery={() =>
            trpc.requirementsRouter.getRequirement.useQuery(
              { projectId: projectId as string, requirementId: historyRequirementId ?? "" },
              { enabled: !!editRequirementId }
            )
          }
        />
      </Grid2>
    </StyledBox>
  );
}