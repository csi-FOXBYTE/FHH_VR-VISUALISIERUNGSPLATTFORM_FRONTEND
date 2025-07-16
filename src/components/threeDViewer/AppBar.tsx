import { ImportExport, Redo, Save, Undo, Upload } from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  Divider,
  Grid,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import BreadCrumbs from "../navbar/BreadCrumbs";
import { useViewerStore } from "./ViewerProvider";
import TimePicker from "./TimePicker";
import ImportProjectObjectDialog from "./ImportProjectObjectDialog";

export default function AppBar() {
  const history = useViewerStore((state) => state.history);

  const toggleImport = useViewerStore(
    (state) => state.projectObjects.toggleImport
  );

  return (
    <Grid width="100%" boxShadow={2} container flexDirection="column">
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
      <Grid padding="8px 32px" container backgroundColor="#eee">
        <TimePicker />
      </Grid>
    </Grid>
  );
}
