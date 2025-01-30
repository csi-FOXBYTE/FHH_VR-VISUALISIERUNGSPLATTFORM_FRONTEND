import { Add, Refresh } from "@mui/icons-material";
import { Button, ButtonGroup, Grid2 } from "@mui/material";

export default function TableToolbar({
  openCreateModel,
  refreshData,
}: {
  openCreateModel?: () => void;
  refreshData?: () => void;
}) {
  return (
    <Grid2>
      <Grid2 container spacing={2} flexGrow={1}></Grid2>
      <Grid2 container spacing={2} justifyContent="stretch">
        <ButtonGroup fullWidth>
          <Button variant="text" onClick={refreshData} startIcon={<Refresh />}>
            Daten aktualisieren
          </Button>
          <Button
            onClick={openCreateModel}
            variant="contained"
            startIcon={<Add />}
          >
            Projekt anlegen
          </Button>
        </ButtonGroup>
      </Grid2>
    </Grid2>
  );
}
