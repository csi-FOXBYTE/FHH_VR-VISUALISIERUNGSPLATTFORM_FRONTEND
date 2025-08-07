"use client";

import { getApis } from "@/server/gatewayApi/client";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useMutation } from "@tanstack/react-query";
import type { Job } from "bullmq";
import { Cartesian3, Matrix3, Matrix4, Quaternion } from "cesium";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useSnackbar } from "notistack";
import proj4List from "proj4-list";
import { ReactNode, useCallback, useMemo, useState } from "react";
import DragAndDropzone from "../common/DragAndDropZone";
import { useViewerStore } from "./ViewerProvider";
import pLimit from "p-limit";

const epsgValues = Object.values(proj4List)
  .map(([epsg, proj4]) => ({
    value: proj4,
    label: epsg,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const initialEpsg = epsgValues.find((epsg) => epsg.label === "EPSG:25832");

export default function ImportProjectObjectDialog() {
  const t = useTranslations();

  const importerOpen = useViewerStore(
    (state) => state.projectObjects._importerOpen
  );

  const params = useParams<{ projectId: string }>();

  const [selectedEpsg, setSelectedEpsg] = useState<{
    value: string;
    label: string;
  }>(initialEpsg!);

  const [file, setFile] = useState<File | undefined>(undefined);

  const addProjectObject = useViewerStore((state) => state.projectObjects.add);
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

  const layers = useViewerStore((state) => {
    return state.layers;
  });

  const models = useMemo(() => {
    return layers.value
      .filter((layer) => layer.id !== layers.selectedLayerId)
      .flatMap((layer) => layer.projectObjects)
      .concat(projectObjects);
  }, [layers, projectObjects]);

  const [selectedModelRows, setSelectedModelRows] = useState<string[]>([]);

  const messageMap: Partial<
    Record<typeof pendingState | "uploading", ReactNode>
  > = {
    active: (
      <Grid container spacing={1} alignItems="center">
        {t("actions.converting")}
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
        {t("actions.waiting-in-line")}
      </>
    ),
    uploading: (
      <Grid container spacing={1} alignItems="center">
        {t("actions.uploading")}
        <LinearProgress
          sx={{ width: 50 }}
          variant={uploadProgress === null ? "indeterminate" : "determinate"}
          value={(uploadProgress ?? 0) * 100}
        />
      </Grid>
    ),
    completed: t("actions.completed"),
    delayed: t("actions.delayed"),
    failed: t("actions.failed"),
  };

  const reuseFile = useCallback(() => {
    const foundProjectObject = models.find(
      (p) => p.id === selectedModelRows[0]
    );

    if (!foundProjectObject)
      throw new Error("No matching project object found!");

    addProjectObject({
      ...foundProjectObject,
      name: foundProjectObject.name + "-copy",
      id: crypto.randomUUID(),
    });
  }, [models, selectedModelRows, addProjectObject]);

  const { mutate: importFileMutation, isPending: isImportFileMutationPending } =
    useMutation({
      onSuccess: () => {
        enqueueSnackbar({
          variant: "success",
          message: t("import-model-dialog.import-successful"),
        });
      },
      onError: (error) => {
        console.error(error);
        enqueueSnackbar({ variant: "error", message: t("import-model-dialog.import-failed") });
      },
      mutationFn: async () => {
        if (!file) return;

        const { converter3DApi } = await getApis();

        // upload test

        setPendingState("uploading");

        const token = await converter3DApi.converter3DGetUploadTokenGet();

        const chunkSize = 4 * 1024 * 1024;
        const total = Math.ceil(file.size / chunkSize);

        const limit = pLimit(4);

        let transferredBytes = 0;

        await Promise.all(
          Array.from({ length: total }).map((_, i) =>
            limit(async () => {
              const start = i * chunkSize;
              const end = Math.min(start + chunkSize, file.size);
              const chunk = file.slice(start, end);

              await converter3DApi.converter3DUploadBlockPost({
                block: chunk,
                index: String(i),
                token: String(token),
                total: String(total),
              });

              transferredBytes += end - start;

              setUploadProgress(transferredBytes / file.size);
            })
          )
        );

        await converter3DApi.converter3DCommitUploadPost({
          converter3DCommitUploadPostRequest: {
            token: token,
          },
        });

        const { jobId, secret } =
          await converter3DApi.converter3DConvertProjectModelPost({
            converter3DConvertProjectModelPostRequest: {
              epsgCode: selectedEpsg.label,
              token: token,
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

        const { href } =
          await converter3DApi.converter3DDownloadProjectModelPost({
            converter3DDownloadProjectModelPostRequest: {
              jobId,
              secret,
              projectId: params.projectId,
            },
          });

        const modelMatrix = Matrix4.fromColumnMajorArray(modelMatrixRaw);

        const translation = Matrix4.getTranslation(
          modelMatrix,
          new Cartesian3()
        );

        const rotationMatrix = Matrix4.getRotation(modelMatrix, new Matrix3());

        const rotation = Quaternion.fromRotationMatrix(rotationMatrix);

        const scale = Matrix4.getScale(modelMatrix, new Cartesian3());
        addProjectObject({
          href,
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
        });

        toggleImport();

        return true;
      },
    });

  return (
    <Dialog fullWidth open={importerOpen}>
      <DialogContent>
        <Grid container flexDirection="column" spacing={2}>
          <Typography variant="h6">
            {t("import-model-dialog.upload-new-model")}
          </Typography>
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
          {t("actions.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={() => importFileMutation()}
          disabled={file === undefined || isImportFileMutationPending}
        >
          {isImportFileMutationPending
            ? messageMap[pendingState]
            : t("actions.upload")}
        </Button>
      </DialogActions>
      <Divider />
      <DialogContent>
        <Typography variant="h6">
          {t("import-model-dialog.reuse-existing-model")}
        </Typography>
        <DataGrid
          rowSelectionModel={selectedModelRows}
          onRowSelectionModelChange={(rowSelectionModel) =>
            setSelectedModelRows(rowSelectionModel as string[])
          }
          rowSelection={true}
          disableMultipleRowSelection
          columns={[
            {
              field: "name",
              headerName: t("import-model-dialog.name"),
              flex: 1,
            },
          ]}
          rows={models}
        />
      </DialogContent>
      <DialogActions>
        <Button loading={isImportFileMutationPending} onClick={toggleImport}>
          {t("actions.cancel")}
        </Button>
        <Button
          disabled={selectedModelRows.length === 0}
          variant="contained"
          onClick={() => reuseFile()}
        >
          {t("actions.add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
