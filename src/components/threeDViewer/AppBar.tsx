import { Redo, Save, Undo, Upload } from "@mui/icons-material";
import {
  Autocomplete,
  Grid,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import BreadCrumbs from "../navbar/BreadCrumbs";
import ImportProjectObjectDialog from "./ImportProjectObjectDialog";
import TimePicker from "./TimePicker";
import { useViewerStore } from "./ViewerProvider";

export default function AppBar() {
  const history = useViewerStore((state) => state.history);

  const toggleImport = useViewerStore(
    (state) => state.projectObjects.toggleImport
  );

  return (
    <Grid
      width="100%"
      zIndex={5}
      boxShadow={2}
      container
      flexDirection="column"
    >
      <ImportProjectObjectDialog />
      <Grid
        container
        padding="8px 32px"
        alignItems="center"
        justifyContent="space-between"
        flexDirection="row"
      >
        <BreadCrumbs style={{ marginBottom: 0 }} />
        <Grid container spacing={1}>
          <Tooltip arrow title="Import project model">
            <IconButton onClick={() => toggleImport()}>
              <Upload />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title="Save project">
            <IconButton>
              <Save />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title="Undo">
            <IconButton disabled={history.index === 0} onClick={history.undo}>
              <Undo />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title="Redo">
            <IconButton
              disabled={history.value.length === history.index + 1}
              onClick={history.redo}
            >
              <Redo />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      <Grid
        padding="8px 32px"
        boxShadow={2}
        spacing={2}
        container
        sx={{ backgroundColor: "#eee" }}
      >
        <TimePicker />
        <Autocomplete
          options={[]}
          renderInput={(params) => (
            <TextField
              sx={{ width: 200, minWidth: 100 }}
              label="Sichtachsen"
              {...params}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
