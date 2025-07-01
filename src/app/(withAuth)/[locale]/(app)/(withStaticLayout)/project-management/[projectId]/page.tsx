"use client";

import PageContainer from "@/components/common/PageContainer";
import BaseAndProjectLayers from "@/components/projectManagement/BaseAndProjectLayers";
import { Link, useRouter } from "@/server/i18n/routing";
import { trpc } from "@/server/trpc/client";
import {
  Add,
  Cancel,
  Edit,
  KeyboardArrowDown,
  Save,
} from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  Divider,
  Grid,
  InputAdornment,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  styled,
  TextField,
} from "@mui/material";
import { skipToken } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useSnackbar } from "notistack";
import { useState } from "react";
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
  const params = useParams();

  const [menuNewRef, setMenuNewRef] = useState<HTMLElement | null>(null);
  const [menuNewOpen, setMenuNewOpen] = useState(false);

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

  const {
    mutate: createProjectMutation,
    isPending: isCreateProjectMutationPending,
  } = trpc.projectRouter.create.useMutation({
    onSuccess: (data) => {
      enqueueSnackbar({
        variant: "success",
        message: "Projekt erfolgreich erstellt!",
      });
      router.push(`/project-management/${data.id}`);
    },
    onError: () =>
      enqueueSnackbar({
        variant: "error",
        message:
          "Beim erstellen des Projekts ist ein unbekannter Fehler aufgetreten!",
      }),
  });

  const {
    mutate: updateProjectMutation,
    isPending: isUpdateProjectMutationPending,
  } = trpc.projectRouter.update.useMutation({
    onSuccess: (data) => {
      enqueueSnackbar({
        variant: "success",
        message: "Projekt erfolgreich geändert!",
      });
      router.push(`/project-management/${data.id}`);
    },
    onError: () =>
      enqueueSnackbar({
        variant: "error",
        message:
          "Beim ändern des Projekts ist ein unbekannter Fehler aufgetreten!",
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
          placeholder={isNew ? "Neues Projekt..." : undefined}
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
          placeholder={isNew ? "Beschreibung..." : undefined}
        />
        <Grid container justifyContent="flex-end" gap={2}>
          <ButtonGroup variant="outlined">
            <Button
              variant="outlined"
              disabled={!formState.isDirty}
              onClick={() => reset()}
              startIcon={<Cancel />}
            >
              Abbrechen
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
              {isNew ? "Erstellen" : "Speichern"}
            </Button>
          </ButtonGroup>
          <Divider orientation="vertical" />
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Add />}
            disabled={isNew}
            endIcon={<KeyboardArrowDown />}
            onClick={() => setMenuNewOpen(true)}
            ref={(ref) => setMenuNewRef(ref ?? null)}
          >
            Neu
          </Button>
          <Menu
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            open={menuNewOpen}
            onClose={() => setMenuNewOpen(false)}
            anchorEl={menuNewRef}
          >
            <ListItemButton
              LinkComponent={Link}
              href={`/project-management/${projectId}/editor`}
            >
              <ListItemIcon>
                <Add />
              </ListItemIcon>
              <ListItemText>Ebene hinzufügen</ListItemText>
            </ListItemButton>
          </Menu>
        </Grid>
      </Grid>
      {isNew ? null : (
        <>
          <Divider />
          <BaseAndProjectLayers />
        </>
      )}
    </PageContainer>
  );
}
