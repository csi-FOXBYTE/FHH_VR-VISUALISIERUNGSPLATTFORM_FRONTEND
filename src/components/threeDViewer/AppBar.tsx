import { Redo, Save, Undo, Upload } from "@mui/icons-material";
import {
  Autocomplete,
  Grid,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { useTranslations } from "next-intl";
import BreadCrumbs from "../navbar/BreadCrumbs";
import ImportProjectObjectDialog from "./ImportProjectObjectDialog";
import TimePicker from "./TimePicker";
import { useViewerStore } from "./ViewerProvider";
import useIsReadOnly from "./useIsReadOnly";
import { useState } from "react";

export default function AppBar() {
  const history = useViewerStore((state) => state.history);

  const t = useTranslations();

  const toggleImport = useViewerStore(
    (state) => state.projectObjects.toggleImport
  );

  const updateProject = useViewerStore((state) => state.updateProject);

  const project = useViewerStore((state) => state.project);
  const saveProject = useViewerStore((state) => state.saveProject);

  const pickRegion = useViewerStore((state) => state.pickRegion);

  const flyTo = useViewerStore((state) => state.startingPoints.helpers.flyTo);

  const isReadOnly = useIsReadOnly();

  const [selectedVisualAxis, setSelectedVisualAxis] = useState<null | {
    label: string;
    value: string;
  }>(null);

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
          <Tooltip arrow title={t("editor.import-model")}>
            <IconButton
              disabled={isReadOnly}
              color="secondary"
              onClick={() => toggleImport()}
            >
              <Upload />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title={t("editor.save-project")}>
            <IconButton
              color="primary"
              disabled={history.index === 0 || isReadOnly}
              onClick={() => saveProject()}
            >
              <Save />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title={t("editor.undo")}>
            <IconButton
              disabled={history.index === 0 || isReadOnly}
              onClick={history.undo}
            >
              <Undo />
            </IconButton>
          </Tooltip>
          <Tooltip arrow title={t("editor.redo")}>
            <IconButton
              disabled={
                history.value.length === history.index + 1 || isReadOnly
              }
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
        <TextField
          defaultValue={project.title}
          disabled={isReadOnly}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;

            updateProject({
              title: (event.target as HTMLInputElement).value,
            });
          }}
          onBlur={(event) => {
            updateProject({ title: (event.target as HTMLInputElement).value });
          }}
          label={t("editor.project-name")}
        />

        <TextField
          sx={{ flex: 1 }}
          disabled={isReadOnly}
          defaultValue={project.description}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;

            updateProject({
              description: (event.target as HTMLInputElement).value,
            });
          }}
          onBlur={(event) => {
            updateProject({
              description: (event.target as HTMLInputElement).value,
            });
          }}
          label={t("editor.project-description")}
        />
        <TimePicker />
        <Autocomplete
          options={project.visualAxes.map((v) => ({
            label: v.name,
            value: v.id,
          }))}
          onChange={(_, option) => {
            setSelectedVisualAxis(option);

            if (!option) return;

            const foundVisualAxis = project.visualAxes.find(
              (v) => v.id === option.value
            );

            if (!foundVisualAxis) return;

            flyTo({
              position: foundVisualAxis.startPoint,
              target: foundVisualAxis.endPoint,
            });
          }}
          value={selectedVisualAxis}
          renderInput={(params) => (
            <TextField
              sx={{ width: 200, minWidth: 100 }}
              label={t("editor.visual-axes")}
              {...params}
            />
          )}
        />
        {/* <Button disabled={isReadOnly} onClick={pickRegion}>Pick region</Button> */}
      </Grid>
    </Grid>
  );
}
