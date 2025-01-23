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
  Refresh,
  Delete,
  Edit,
  History,
  SettingsOutlined,
} from "@mui/icons-material";
import OptionsButton from "@/components/common/OptionsButton";
import RequirementHistoryDialog from "@/components/project/RequirementHistoryDialog";
import { Requirement, REQUIREMENT_CATEGORY } from "@prisma/client";

type RequirementFormValues = {
  id?: string;
  name?: string;
  description: string;
  assignedToUserId: string;
  requirementCategory: REQUIREMENT_CATEGORY;
  createdAt: string;
};
import { DialogFactory } from "@/components/project/Dialog/DialogFactory";
import { useSession } from "next-auth/react";

const StyledBox = styled(Box)({
  display: "flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "flex-start",
  height: "100%",
});

// #region Component
export const requirementFormModel = {
  name: {
    initialValue: "",
    validation: z.string().min(1, "Name is required"),
  },
  description: {
    initialValue: "",
    validation: z.string().min(1, "Description is required"),
  },
  assignedToUserId: {
    initialValue: "",
    validation: z
      .string()
      .email("Invalid user")
      .min(1, "User is required"),
  },
  requirementCategory: {
    initialValue: "TECHNICAL" as REQUIREMENT_CATEGORY,
    validation: z.enum(["ORGANIZATIONAL", "TECHNICAL"], {
      required_error: "Category is required",
    }),
  },
  createdAt: {
    initialValue: new Date().toISOString().split("T")[0],
    validation: z.string().refine(
      (val) => {
        return !isNaN(Date.parse(val)); // Ensures it's a valid date
      },
      {
        message: "Creation date is required",
      }
    ),
  },
};

// Generate validation schema dynamically
export const generateZodValidationSchema = <
  T extends Record<string, { validation: z.ZodTypeAny }>
>(
  model: T
) => {
  const shape = Object.keys(model).reduce((acc, key) => {
    acc[key as keyof T] = model[key].validation;
    return acc;
  }, {} as Record<keyof T, z.ZodTypeAny>);
  return z.object(shape);
};


// Usage example: validationSchema
const validationSchema = generateZodValidationSchema(requirementFormModel);

export default function Requirements() {
  const { projectId } = useParams();
  const { data: session } = useSession();
  const [editRequirement, setEditRequirement] = useState<Requirement | null>(
    null
  );
  const [historyRequirement, setHistoryRequirement] =
    useState<Requirement | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [historyModalOpened, setHistoryModalOpened] = useState(false);

  const t = useTranslations();

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

  // #region Data Fetching
  const {
    data: project,
    isPending: isProjectsPending,
    refetch,
  } = trpc.projectRouter.getProjectRequirements.useQuery(
    { projectId: projectId as string },
    {
      enabled: !!projectId,
      placeholderData: keepPreviousData,
    }
  );
  // #endregion

  // #region Handlers

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

  const handleDeleteRequirementClick = useCallback((requirementId: string) => {
    trpc.requirementsRouter.deleteRequirement.useMutation().mutate({
      requirementId,
    });
  }, []);
  const handleEditRequirementClick = useCallback((requirementId: string) => {
    console.log("TODO");
  }, []);

  //TODO:RequirementFormValues
  const handleSubmit = (values: RequirementFormValues) => {
    //if "id" then existing one is edited
    if (values.id) {
      trpc.requirementsRouter.editRequirement.useMutation().mutate({
        projectId: projectId as string,
        requirementId: values.id as string,
        data: {
          name: values.name,
          description: values.description,
          assignedToUserId: values.assignedToUserId,
          requirementCategory: values.requirementCategory,
          updatedAt: new Date(values.createdAt),
        },
      });
    } else {
      console.log("ok");
      trpc.requirementsRouter.addRequirement.useMutation().mutate({
        projectId: projectId as string,
        data: {
          ...values,
          name: values.name ?? "",
          creatorId: session?.user.id as string,
          createdAt: new Date(values.createdAt),
        },
      });
    }
  };

  const formConfig = {
    description: {
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
        { value: "Org", label: t("requirementDialog.orgRequirement") },
        { value: "Tec", label: t("requirementDialog.techRequirement") },
      ],
    },
    createdAt: {
      type: "date" as const,
      label: t("requirementDialog.createdAt"),
      readOnly: true,
    },
  };

  // #endregion

  //#region options

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
  //#endregion

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
      setPage(page);
      setPageSize(pageSize);
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
            ]}
          />
        </Grid2>
        <DialogFactory<RequirementFormValues>
          close={resetEditMode}
          projectId={projectId as string}
          open={createModalOpened}
          initialValues={
            editRequirement
              ? {
                ...generateInitialValues(requirementFormModel),
                ...editRequirement,
                assignedToUserId: editRequirement.assignedToUserId,
                requirementCategory: editRequirement.requirementCategory,
                createdAt: new Date(editRequirement.createdAt)
                  .toISOString()
                  .split("T")[0],
              }
              : generateInitialValues(requirementFormModel)
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          formConfig={formConfig}
          title={
            editRequirement
              ? t("requirementDialog.editTitle")
              : t("requirementDialog.addTitle")
          }
          submitButtonText={t("requirementDialog.save")}
        />
        <RequirementHistoryDialog
          open={historyModalOpened}
          close={resetHistoryMode}
          requirement={historyRequirement}
        />
      </Grid2>
    </StyledBox>
  );
}
