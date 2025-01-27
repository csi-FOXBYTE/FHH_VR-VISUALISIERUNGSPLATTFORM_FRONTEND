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
import { TARGET_CATEGORY } from "@prisma/client";

type TargetFormValues = {
  id?: string;
  name: string;
  assignedToUserId: string;
  targetCategory: TARGET_CATEGORY;
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

export const targetFormModel = {
  name: {
    initialValue: "",
    validation: z.string().min(1, "name is required"),
  },
  assignedToUserId: {
    initialValue: "",
    validation: z.string().min(1, "User is required"),
  },
  targetCategory: {
    initialValue: "DATE" as TARGET_CATEGORY,
    validation: z.nativeEnum(TARGET_CATEGORY).refine(
      (val) => ["DATE", "COST", "PERFORMANCE"].includes(val),
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

const validationSchema = generateZodValidationSchema(targetFormModel);
//#endregion
// #region Component Start

export default function TargetsPage() {

  //#region Hooks
  const { projectId } = useParams();
  const { data: session } = useSession();
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const { paginationModel, sortModel, sortBy, sortOrder, handlePaginationModelChange, handleSortModelChange } = usePaginationAndSorting();
  const t = useTranslations();
  // #endregion

  // #region Fetching/Queries
  const {
    data: { data: targets, count } = { count: 0, data: [] },
    isPending: isProjectsPending,
    refetch,
  } = trpc.targetsRouter.getProjectTargets.useQuery(
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

  const deleteTargetMutation = trpc.targetsRouter.deleteTarget.useMutation({
    onSuccess: () => {
      console.info("Target deleted successfully");
      refetch();
    },
    onError: (error) => {
      console.error("Error deleting target:", error);
    },
  });

  const editTargetMutation = trpc.targetsRouter.editTarget.useMutation({
    onSuccess: () => {
      console.info("Target edited successfully");
      resetEditMode();
      refetch();
    },
    onError: (error) => {
      console.error("Error editing target:", error);
    },
  });

  const addTargetMutation = trpc.targetsRouter.addTarget.useMutation({
    onSuccess: () => {
      console.info("Target added successfully");
      resetEditMode();
      refetch();
    },
    onError: (error) => {
      console.error("Error adding target:", error);
    },
  });
  // #endregion

  // #region Handlers

  const resetEditMode = useCallback(() => {
    setEditTargetId(null);
    setCreateModalOpened(false);
  }, []);

  const handleHistoryTargetClick = useCallback(() => {
    console.log("TODO:");
  }, []);

  const handleDeleteTargetClick = useCallback((targetId: string) => {
    deleteTargetMutation.mutate({ targetId });
  }, [deleteTargetMutation]);

  const handleEditTargetClick = useCallback((targetId: string) => {
    setEditTargetId(targetId);
    setCreateModalOpened(true);
  }, []);

  const handleSubmit = useCallback((values: TargetFormValues) => {
    if (values.id) {
      editTargetMutation.mutate({
        projectId: projectId as string,
        targetId: values.id as string,
        data: {
          name: values.name,
          assignedToUserId: values.assignedToUserId,
          targetCategory: values.targetCategory,
          updatedAt: new Date(values.createdAt),
          description: "",
        },
      });
    } else {
      addTargetMutation.mutate({
        projectId: projectId as string,
        data: {
          ...values,
          creatorId: session?.user.id as string,
          createdAt: new Date(values.createdAt),
          description: "",
        },
      });
    }
  }, [projectId, session?.user.id, editTargetMutation, addTargetMutation]);
  //#region Dialog Config
  const initialValues = useMemo(() => generateInitialValues(targetFormModel), []);

  const formConfig = {
    name: {
      type: "text" as const,
      label: t("targetDialog.targetText"),
    },
    assignedToUserId: {
      type: "participantSelection" as const,
      label: t("targetDialog.assignedToUserEmail"),
    },
    targetCategory: {
      type: "radio" as const,
      label: t("targetDialog.category"),
      options: [
        { value: "DATE", label: t("targetDialog.dateRadioBtn") },
        { value: "COST", label: t("targetDialog.costRadioBtn") },
        { value: "PERFORMANCE", label: t("targetDialog.performanceRadioBtn") },
      ],
    },
    createdAt: {
      type: "date" as const,
      label: t("targetDialog.createdAt"),
      readOnly: true,
    },
  };

  //#endregion
  // #endregion

  //#region Options
  const options = useCallback((targetId: string) => [
    {
      name: t("routes./project/targets.edit"),
      action: () => handleEditTargetClick(targetId),
      icon: <Edit />,
    },
    {
      name: t("routes./project/targets.history"),
      action: () => handleHistoryTargetClick(),
      icon: <History />,
    },
    {
      name: t("routes./project/targets.delete"),
      action: () => handleDeleteTargetClick(targetId),
      icon: <Delete />,
    },
  ], [handleEditTargetClick, handleHistoryTargetClick, handleDeleteTargetClick, t]);
  //#endregion

  //#region Columns
  const columns = useMemo<GridColDef<(typeof targets)[number]>[]>(() => {
    const targetsCategoryMapping: { [key: string]: string } = {
      COST: t("targetDialog.costRadioBtn"),
      DATE: t("targetDialog.dateRadioBtn"),
      PERFORMANCE: t("targetDialog.performanceRadioBtn"),
    };
    return [
      {
        field: "name",
        headerName: t("routes./project/targets.column1"),
        flex: 1,
      },
      {
        field: "assignedToUser.email",
        headerName: t("routes./project/targets.column2"),
        flex: 1,
        valueGetter: (_, row) => {
          return row.assignedToUser?.name || "";
        },
      },
      {
        field: "targetCategory",
        headerName: t("routes./project/targets.column3"),
        flex: 1,
        valueGetter: (_, row) => {
          return targetsCategoryMapping[row.targetCategory] || "";
        },
      },
      {
        field: "createdAt",
        headerName: t("routes./project/targets.column4"),
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
            {t("routes./project/targets.title")}
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
              {t("routes./project/targets.addButton")}
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
            rows={targets}
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
        <DialogFactory<TargetFormValues>
          close={resetEditMode}
          projectId={projectId as string}
          open={createModalOpened}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          formConfig={formConfig}
          title={
            editTargetId
              ? t("targetDialog.editTitle")
              : t("targetDialog.addTitle")
          }
          submitButtonText={t("targetDialog.save")}
          useQuery={() =>
            trpc.targetsRouter.getTarget.useQuery(
              { projectId: projectId as string, targetId: editTargetId ?? "" },
              { enabled: !!editTargetId }
            )
          }
        />
      </Grid2>
    </StyledBox>
  );
}