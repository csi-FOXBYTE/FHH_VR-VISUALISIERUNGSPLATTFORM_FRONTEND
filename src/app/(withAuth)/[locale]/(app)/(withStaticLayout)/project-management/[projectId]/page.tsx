"use client";

import PageContainer from "@/components/common/PageContainer";
import { TabPanel } from "@/components/common/TabPanel";
import BaseLayers from "@/components/projectManagement/BaseAndProjectLayers";
import { Link, useRouter } from "@/server/i18n/routing";
import { trpc } from "@/server/trpc/client";
import { Cancel, Edit, Save } from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  Divider,
  Grid,
  InputAdornment,
  styled,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { skipToken } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";

const CustomTitleInput = styled(TextField)(({ theme }) => ({
  ["& > div > input"]: {
    ...theme.typography.h4,
  },
}));

const CustomDescriptionInput = styled(TextField)(({ theme }) => ({
  ["& > div > input"]: {
    ...theme.typography.subtitle1,
  },
}));

export default function ProjectPage() {
  const t = useTranslations();

  const params = useParams();

  const projectId = params.projectId as string;

  const isNew = projectId === "new";

  const { data: projectData } = trpc.projectRouter.getFull.useQuery(
    isNew ? skipToken : { id: projectId }
  );

  const { register, handleSubmit, reset, formState } = useForm<{
    title: string;
    description: string;
  }>({
    values: {
      title: projectData?.title ?? "",
      description: projectData?.description ?? "",
    },
  });

  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const utils = trpc.useUtils();

  const {
    mutate: createProjectMutation,
    isPending: isCreateProjectMutationPending,
  } = trpc.projectRouter.create.useMutation({
    onSuccess: () => {
      utils.projectRouter.invalidate();
      enqueueSnackbar({
        variant: "success",
        message: t("generic.crud-notifications.create-success", {
          entity: t("entities.project"),
        }),
      });
      close();
    },
    onError: () =>
      enqueueSnackbar({
        variant: "error",
        message: t("generic.crud-notifications.create-failed", {
          entity: t("entities.project"),
        }),
      }),
  });

  const {
    mutate: updateProjectMutation,
    isPending: isUpdateProjectMutationPending,
  } = trpc.projectRouter.update.useMutation({
    onSuccess: () => {
      utils.projectRouter.invalidate();
      enqueueSnackbar({
        variant: "success",
        message: t("generic.crud-notifications.update-success", {
          entity: t("entities.project"),
        }),
      });
      close();
    },
    onError: () =>
      enqueueSnackbar({
        variant: "error",
        message: t("generic.crud-notifications.update-failed", {
          entity: t("entities.project"),
        }),
      }),
  });

  return (
    <PageContainer flexWrap="nowrap">
      <Grid
        flexDirection="column"
        spacing={2}
        gap={2}
        component="form"
        display="flex"
        flexWrap="nowrap"
        onSubmit={handleSubmit((data) => {
          if (isNew) {
            createProjectMutation(data);
          } else {
            updateProjectMutation({ id: projectId, ...data });
          }
        })}
      >
        <CustomTitleInput
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Edit fontSize="medium" />
                </InputAdornment>
              ),
            },
          }}
          required
          variant="standard"
          defaultValue={projectData?.title}
          {...register("title")}
          placeholder={
            isNew ? t("project-management.title-placeholder") : undefined
          }
        />
        <CustomDescriptionInput
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Edit fontSize="medium" />
                </InputAdornment>
              ),
            },
          }}
          variant="standard"
          multiline
          required
          defaultValue={projectData?.description}
          {...register("description")}
          minRows={2}
          maxRows={10}
          placeholder={
            isNew ? t("project-management.description-placeholder") : undefined
          }
        />
        <Grid container justifyContent="flex-end" gap={2}>
          <ButtonGroup variant="outlined">
            <Button
              variant="outlined"
              disabled={!formState.isDirty}
              onClick={() => reset()}
              startIcon={<Cancel />}
            >
              {t("actions.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              startIcon={<Save />}
              loading={
                isCreateProjectMutationPending || isUpdateProjectMutationPending
              }
              disabled={!formState.isDirty}
            >
              {isNew ? t("actions.create") : t("actions.save")}
            </Button>
          </ButtonGroup>
          <Divider orientation="vertical" />
          <Button
            variant="contained"
            color="secondary"
            LinkComponent={Link}
            startIcon={<Edit />}
            disabled={isNew}
            href={`/project-management/${projectId}/editor`}
          >
            {t("project-management.open-editor")}
          </Button>
        </Grid>
      </Grid>
      {isNew ? null : (
        <>
          <Divider />
          <Tabs>
            <Tab label="Basisdatensätze"></Tab>
          </Tabs>
          <TabPanel>
            <BaseLayers />
          </TabPanel>
        </>
      )}
    </PageContainer>
  );
}
