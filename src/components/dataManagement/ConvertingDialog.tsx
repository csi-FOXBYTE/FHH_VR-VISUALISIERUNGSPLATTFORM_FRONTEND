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
import { useState } from "react";
import pLimit from "p-limit";

export default function ConvertingDialog({
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
      type: "TILES3D" as "TILES3D" | "TERRAIN",
      name: "",
    },
  });

  const [uploadProgress, setUploadProgress] = useState<null | number>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: {
      files: File[];
      srcSRS: { label: string; value: string };
      type: "TILES3D" | "TERRAIN";
      name: string;
    }) => {
      setUploadProgress(null);
      const { converter3DApi } = await getApis();

      const token = await converter3DApi.converter3DGetUploadTokenGet();

      const chunkSize = 4 * 1024 * 1024;
      const total = Math.ceil(values.files[0].size / chunkSize);

      const limit = pLimit(4);

      let transferredBytes = 0;

      await Promise.all(
        Array.from({ length: total }).map((_, i) =>
          limit(async () => {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, values.files[0].size);
            const chunk = values.files[0].slice(start, end);

            await converter3DApi.converter3DUploadBlockPost({
              block: chunk,
              index: String(i),
              token: String(token),
              total: String(total),
            });

            transferredBytes += end - start;

            setUploadProgress(transferredBytes / values.files[0].size);
          })
        )
      );

      await converter3DApi.converter3DCommitUploadPost({
        converter3DCommitUploadPostRequest: {
          token: token,
        },
      });

      switch (values.type) {
        case "TILES3D":
          await converter3DApi.converter3DConvert3DTilePost({
            converter3DConvertTerrainPostRequest: {
              srcSRS: values.srcSRS.value,
              token: token,
              name: values.name,
            },
          });
          break;
        case "TERRAIN":
          await converter3DApi.converter3DConvertTerrainPost({
            converter3DConvertTerrainPostRequest: {
              srcSRS: values.srcSRS.value,
              token: token,
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
      <DialogTitle>{t("actions.converting")}</DialogTitle>
      <form onSubmit={handleSubmit((values) => mutate(values))}>
        <DialogContent>
          <Grid container pt={1} flexDirection="column" spacing={2}>
            <TextField fullWidth {...register("name")} label="Name" />
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  label={t("data-management.type")}
                  fullWidth
                  value={field.value}
                  onChange={field.onChange}
                >
                  <MenuItem value={"TILES3D"}>CityGML (3D Tiles)</MenuItem>
                  <MenuItem value={"TERRAIN"}>DGM (Terrain)</MenuItem>
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
                {t("actions.uploading")}
                <LinearProgress
                  sx={{ width: 50 }}
                  variant={
                    uploadProgress === null ? "indeterminate" : "determinate"
                  }
                  value={(uploadProgress ?? 0) * 100}
                />
              </Grid>
            ) : (
              t("actions.converting")
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
