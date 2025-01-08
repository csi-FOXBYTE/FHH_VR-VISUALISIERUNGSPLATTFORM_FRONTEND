"use client";

import { trpc } from "@/server/trpc/client";
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Refresh } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useQueryState, parseAsBoolean } from "nuqs";
import { DataGrid } from "@mui/x-data-grid";
import CreateProjectDialog from "@/components/project/CreateProjectDialog";

export default function ProjectPage() {
  const [createModalOpen, setCreateModalOpen] = useQueryState(
    "createModalOpen",
    parseAsBoolean.withDefault(false)
  );

  const { data = [], isPending: isDataPending } =
    trpc.testRouter.getProjects.useQuery();

  const t = useTranslations();

  return (
    <Box>
      <Grid2 container spacing={2} alignItems="center">
        <Grid2 size="grow">
          <Typography variant="h1">Übersicht Projekte</Typography>
        </Grid2>
        <Grid2 size="auto">
          <ButtonGroup>
            <Button variant="text" startIcon={<Refresh />}>
              Daten aktualisieren
            </Button>
            <Button
              variant="contained"
              onClick={() => setCreateModalOpen(true)}
              startIcon={<Add />}
            >
              Projekt anlegen
            </Button>
          </ButtonGroup>
        </Grid2>
      </Grid2>
      <Paper elevation={3}>
        <DataGrid
          loading={isDataPending}
          columns={[{ field: "name" }, { field: "id" }]}
          rows={data}
        />
      </Paper>
      <CreateProjectDialog
        close={() => setCreateModalOpen(false)}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </Box>
  );
}
