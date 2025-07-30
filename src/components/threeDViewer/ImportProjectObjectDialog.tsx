import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  TextField,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import type { Job } from "bullmq";
import { Cartesian3, Matrix3, Matrix4, Quaternion } from "cesium";
import { useSnackbar } from "notistack";
import proj4List from "proj4-list";
import { ReactNode, useState } from "react";
import DragAndDropzone from "../common/DragAndDropZone";
import { useViewerStore } from "./ViewerProvider";
import { getApis } from "@/server/gatewayApi/client";
import { BlockBlobClient } from "@azure/storage-blob";

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

  const [uploadProgress, setUploadProgress] = useState<null | number>(null);

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
    uploading: (
      <Grid container spacing={1} alignItems="center">
        Hochladen
        <LinearProgress
          sx={{ width: 50 }}
          variant={uploadProgress === null ? "indeterminate" : "determinate"}
          value={(uploadProgress ?? 0) * 100}
        />
      </Grid>
    ),
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

        const { converter3DApi } = await getApis();

        const sasUrl = await converter3DApi.converter3DGetUploadSASTokenGet();

        const blockBlobClient = new BlockBlobClient(sasUrl);

        await blockBlobClient.uploadData(file, {
          blockSize: 8 * 1024 * 1024, // 8 Mibs
          concurrency: 4,
          onProgress: (progress) =>
            setUploadProgress(progress.loadedBytes / file.size),
        });

        setPendingState("uploading");

        const { jobId, secret } =
          await converter3DApi.converter3DConvertProjectModelPost({
            converter3DConvertProjectModelPostRequest: {
              epsgCode: selectedEpsg.label,
              blobRef: sasUrl,
              fileName: file.name,
            },
          });

        let modelMatrixRaw: number[] | undefined = undefined;

        for (let i = 0; i < 512; i++) {
          const result =
            await converter3DApi.converter3DGetProjectModelStatusPost({
              converter3DConvertProjectModelPost200Response: {
                jobId,
                secret,
              },
            });

          setPendingState(result.state as "uploading");
          setProgress(result.progress);

          if (result.state === "completed") {
            modelMatrixRaw = result.modelMatrix!;
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        if (!modelMatrixRaw) throw new Error("FAILED");

        const blob = await converter3DApi.converter3DDownloadProjectModelPost({
          converter3DConvertProjectModelPost200Response: {
            jobId,
            secret,
          },
        });

        const arrayBuffer = await blob.arrayBuffer();

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
            attributes: {},
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
          <DragAndDropzone
            name="file"
            value={file ? [file] : []}
            onChange={(files) => setFile(files[0])}
            accept={{
              "3d-files": [
                ".fbx",
                ".obj",
                ".dae",
                ".xml",
                ".blend",
                ".stl",
                ".dxg",
                ".3ds",
                ".ter",
                ".ifc",
                ".glb",
                ".gltf",
              ],
            }}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button loading={isImportFileMutationPending} onClick={toggleImport}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => importFileMutation()}
          disabled={file === undefined || isImportFileMutationPending}
        >
          {isImportFileMutationPending ? messageMap[pendingState] : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
