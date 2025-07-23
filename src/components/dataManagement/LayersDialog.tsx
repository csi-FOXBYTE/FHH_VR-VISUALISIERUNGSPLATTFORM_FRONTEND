import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Controller, useForm } from "react-hook-form";
import DragAndDropzone from "../common/DragAndDropZone";
import EPSGInput from "../common/EPSGInput";
import { useConfigurationProviderContext } from "../configuration/ConfigurationProvider";
import { useTranslations } from "next-intl";
import { trpc } from "@/server/trpc/client";
import { getApis } from "@/server/gatewayApi/client";
import { BlockBlobClient } from "@azure/storage-blob";
import { useState } from "react";

export default function LayersDialog({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();

  const t = useTranslations();

  const utils = trpc.useUtils();

  const { defaultEPSGLabelValue } = useConfigurationProviderContext();

  const { handleSubmit, control, register } = useForm({
    defaultValues: {
      files: [] as File[],
      srcSRS: defaultEPSGLabelValue,
      type: "3D-TILES" as "3D-TILES" | "TERRAIN",
      name: "",
    },
  });

  const [uploadProgress, setUploadProgress] = useState<null | number>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: {
      files: File[];
      srcSRS: { label: string; value: string };
      type: "3D-TILES" | "TERRAIN";
      name: string;
    }) => {
      setUploadProgress(null);
      const { converter3DApi } = await getApis();

      const sasUrl = await converter3DApi.converter3DGetUploadSASTokenGet();

      const blockBlobClient = new BlockBlobClient(sasUrl);

      await blockBlobClient.uploadData(values.files[0], {
        blockSize: 8 * 1024 * 1024, // 8 Mibs
        concurrency: 4,
        onProgress: (progress) =>
          setUploadProgress(progress.loadedBytes / values.files[0].size),
      });

      switch (values.type) {
        case "3D-TILES":
          await converter3DApi.converter3DConvert3DTilePost({
            converter3DConvertTerrainPostRequest: {
              srcSRS: values.srcSRS.value,
              blobRef: sasUrl,
              name: values.name,
            },
          });
          break;
        case "TERRAIN":
          await converter3DApi.converter3DConvertTerrainPost({
            converter3DConvertTerrainPostRequest: {
              srcSRS: values.srcSRS.value,
              blobRef: sasUrl,
              name: values.name,
            },
          });
          break;
        default:
          throw new Error("Found no matching type!");
      }
    },
    onSuccess: () => {
      utils.dataManagementRouter.invalidate();
      enqueueSnackbar({
        variant: "success",
        message: t("generic.crud-notifications.create-success", {
          entity: t("entities.base-layer"),
        }),
      });
      close();
      setUploadProgress(null);
    },
    onError: (error) => {
      console.error(error);
      enqueueSnackbar({
        variant: "error",
        message: t("generic.crud-notifications.create-failed", {
          entity: t("entities.base-layer"),
        }),
      });
      setUploadProgress(null);
    },
  });

  return (
    <Dialog open={open} onClose={close} fullWidth>
      <DialogTitle>Basisdatensatz wandeln</DialogTitle>
      <form onSubmit={handleSubmit((values) => mutate(values))}>
        <DialogContent>
          <Grid container pt={1} flexDirection="column" spacing={2}>
            <TextField fullWidth {...register("name")} label="Name" />
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  label="Typ"
                  fullWidth
                  value={field.value}
                  onChange={field.onChange}
                >
                  <MenuItem value={"3D-TILES"}>CityGML</MenuItem>
                  <MenuItem value={"TERRAIN"}>DGM (e.g. dxf, geojson)</MenuItem>
                </Select>
              )}
            />
            <Controller
              control={control}
              name="srcSRS"
              render={({ field }) => (
                <EPSGInput value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="files"
              render={({ field }) => (
                <DragAndDropzone
                  name="file"
                  value={field.value}
                  onChange={field.onChange}
                  accept={{ "application/zip": [".zip"] }}
                />
              )}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button disabled={isPending} variant="contained" type="submit">
            {isPending ? (
              <Grid container spacing={1} alignItems="center">
                Hochladen
                <LinearProgress
                  sx={{ width: 50 }}
                  variant={
                    uploadProgress === null ? "indeterminate" : "determinate"
                  }
                  value={(uploadProgress ?? 0) * 100}
                />
              </Grid>
            ) : (
              "Wandeln"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
