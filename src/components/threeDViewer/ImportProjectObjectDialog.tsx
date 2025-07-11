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
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { ReactNode, useState } from "react";
import proj4List from "proj4-list";
import { Add } from "@mui/icons-material";
import { useMutation } from "@tanstack/react-query";
import { useViewerStore } from "./ViewerProvider";
import { Cartesian3, Matrix3, Matrix4, Quaternion } from "cesium";
import { useSnackbar } from "notistack";
import type { Job } from "bullmq";
import GatewayAPI from "@/server/gatewayApi/client";

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

  const [pendingState, setPendingState] = useState<
    Awaited<ReturnType<Job["getState"]>> | "uploading"
  >("uploading");

  const [progress, setProgress] = useState(0);

  const messageMap: Record<typeof pendingState | "uploading", ReactNode> = {
    active: (
      <Grid container spacing={1} alignItems="center">
        Konvertierung im Gange
        <LinearProgress
          variant="determinate"
          style={{ width: 50 }}
          value={progress * 100}
        />
      </Grid>
    ),
    waiting: (
      <>
        <CircularProgress size="small" />
        Warten in der Warteschlange...
      </>
    ),
    uploading: "Hochladen...",
    "waiting-children": null,
    completed: "Konvertierung abgeschlossen...",
    delayed: "Verzögert",
    failed: "Fehlgeschlagen",
    prioritized: "Bevorzugt",
    unknown: "Unbekannt",
  };

  const { mutate: importFileMutation, isPending: isImportFileMutationPending } =
    useMutation({
      onSuccess: () => {
        enqueueSnackbar({
          variant: "success",
          message: "File import successful!",
        });
      },
      onError: (error) => {
        console.error(error);
        enqueueSnackbar({ variant: "error", message: "File import failed!" });
      },
      mutationFn: async () => {
        if (!file) return;

        setPendingState("uploading");

        const formData = new FormData();
        formData.append("epsgCode", selectedEpsg.label);
        formData.append("fileName", file.name);
        formData.append("file", file);

        const { jobId, secret } =
          await GatewayAPI.converter3DApi.converter3DUploadProjectModelPost({
            epsgCode: selectedEpsg.label,
            file: file,
            fileName: file.name,
          });

        let modelMatrixRaw: number[] | undefined = undefined;

        for (let i = 0; i < 512; i++) {
          const result =
            await GatewayAPI.converter3DApi.converter3DGetProjectModelStatusPost(
              {
                converter3DUploadProjectModelPost200Response: {
                  jobId,
                  secret,
                },
              }
            );

          setPendingState(result.state);
          setProgress(result.progress);

          console.log(result);

          if (result.state === "completed") {
            modelMatrixRaw = result.modelMatrix!;
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        if (!modelMatrixRaw) throw new Error("FAILED");

        const blob =
          await GatewayAPI.converter3DApi.converter3DDownloadProjectModelPost({
            converter3DUploadProjectModelPost200Response: {
              jobId,
              secret,
            },
          });

        const arrayBuffer = await blob.arrayBuffer();
        console.log("Got ArrayBuffer of length", arrayBuffer.byteLength);

        // 3. Wrap the ArrayBuffer back into a Blob (preserving original type)
        // const downloadable = new Blob([arrayBuffer], { type: blob.type });

        // // 4. Create an object URL for the Blob
        // const url = URL.createObjectURL(downloadable);

        // // 5. Create a temporary <a> and click it to start download
        // const a = document.createElement("a");
        // a.style.display = "none";
        // a.href = url;
        // a.download = "my-file.glb";
        // document.body.appendChild(a);
        // a.click();

        // // 6. Clean up
        // URL.revokeObjectURL(url);
        // document.body.removeChild(a);

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
            fileContent: Buffer.from(arrayBuffer),
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

        return true;
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
            onClick={() => importFileMutation()}
            disabled={file === undefined || isImportFileMutationPending}
          >
            {isImportFileMutationPending ? messageMap[pendingState] : "Upload"}
          </Button>
        </ButtonGroup>
      </DialogActions>
    </Dialog>
  );
}
