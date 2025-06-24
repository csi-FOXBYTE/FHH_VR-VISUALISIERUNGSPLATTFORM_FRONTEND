import {
  Autocomplete,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import { useState } from "react";
import proj4List from "proj4-list";
import { Add } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import { useViewerStore } from "./ViewerProvider";
import { Cartesian3, Matrix3, Matrix4, Quaternion } from "cesium";
import { useSnackbar } from "notistack";

const epsgValues = Object.values(proj4List)
  .map(([epsg, proj4]) => ({
    value: proj4,
    label: epsg,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const initialEpsg = epsgValues.find((epsg) => epsg.label === "EPSG:25832");

export default function ImportProjectObjectDialog() {
  const importerOpen = useViewerStore(
    (state) => state.projectObjects._importerOpen
  );

  const [selectedEpsg, setSelectedEpsg] = useState<{
    value: string;
    label: string;
  }>(initialEpsg!);

  const [file, setFile] = useState<File | undefined>(undefined);

  const setProjectObjects = useViewerStore((state) => state.projectObjects.set);
  const projectObjects = useViewerStore((state) => state.projectObjects.value);

  const toggleImport = useViewerStore(
    (state) => state.projectObjects.toggleImport
  );

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: importFileMutation, isPending: isImportFileMutationPending } =
    useMutation({
      onSuccess: () => {
        enqueueSnackbar({
          variant: "success",
          message: "File import successful!",
        });
      },
      onError: () => {
        enqueueSnackbar({ variant: "error", message: "File import failed!" });
      },
      mutationFn: async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("epsgCode", selectedEpsg.label);
        formData.append("fileType", file.type);
        formData.append("fileName", file.name);

        const response = await fetch("/api/backend/converter3D/convert", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error(await response.json());

        const { buffer64, modelMatrix: modelMatrixRaw } = await response.json();

        const modelMatrix = Matrix4.fromColumnMajorArray(modelMatrixRaw);

        const translation = Matrix4.getTranslation(
          modelMatrix,
          new Cartesian3()
        );

        const rotationMatrix = Matrix4.getRotation(modelMatrix, new Matrix3());

        const rotation = Quaternion.fromRotationMatrix(rotationMatrix);

        const scale = Matrix4.getScale(modelMatrix, new Cartesian3());

        setProjectObjects([
          ...projectObjects,
          {
            fileContent: Buffer.from(buffer64, "base64"),
            id: crypto.randomUUID(),
            metaData: {},
            scale: { x: scale.x, y: scale.y, z: scale.z },
            rotation: {
              x: rotation.x,
              y: rotation.y,
              z: rotation.z,
              w: rotation.w,
            },
            translation: {
              x: translation.x,
              y: translation.y,
              z: translation.z,
            },
            name: file.name,
            visible: true,
            type: "PROJECT_OBJECT",
          },
        ]);

        toggleImport();
      },
    });

  return (
    <Dialog fullWidth open={importerOpen}>
      <DialogTitle>Import project object</DialogTitle>
      <DialogContent>
        <Grid container flexDirection="column" spacing={2}>
          <Autocomplete
            disablePortal
            style={{ marginTop: 16 }}
            renderInput={(params) => <TextField {...params} label="EPSG" />}
            value={selectedEpsg}
            disableClearable
            size="small"
            onChange={(_, newValue) => setSelectedEpsg(newValue)}
            options={epsgValues}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<Add />}
            component="label"
          >
            <input
              type="file"
              style={{ display: "none" }}
              accept=".fbx,.obj,.dae,.xml,.blend,.stl,.dxg,.3ds,.ter,.ifc,.glb,.gltf"
              onChange={(event) =>
                setFile((event.target as HTMLInputElement).files?.[0])
              }
            />
            <div style={{ flex: 1 }}>{file ? file.name : "Upload File"}</div>
          </Button>
        </Grid>
      </DialogContent>
      <DialogActions>
        <ButtonGroup variant="outlined">
          <Button loading={isImportFileMutationPending} onClick={toggleImport}>
            Close
          </Button>
          <Button
            loading={isImportFileMutationPending}
            onClick={() => importFileMutation()}
            disabled={file === undefined}
          >
            Upload
          </Button>
        </ButtonGroup>
      </DialogActions>
    </Dialog>
  );
}
