import { getApis } from "@/server/gatewayApi/client";
import { trpc } from "@/server/trpc/client";
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import pLimit from "p-limit";
import { Fragment, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import DragAndDropzone from "../common/DragAndDropZone";
import EPSGInput from "../common/EPSGInput";
import MapLayerSelect from "../common/MapLayerSelect";
import { useConfigurationProviderContext } from "../configuration/ConfigurationProvider";
import { BlobReader, ZipReader } from "@zip.js/zip.js";

type ConversionType = "TILES3D" | "TERRAIN" | "IMAGERY";

const worker = new Worker(
  new URL("./findAppearanceInZippedCityGMLWorker.ts", import.meta.url),
);

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

  const { handleSubmit, control, register, watch, setValue, formState } =
    useForm({
      defaultValues: {
        file: null as File | null,
        terrainFile: null as File | null,
        srcSRS: defaultEPSGLabelValue,
        type: "TILES3D" as ConversionType,
        appearance: "",
        name: "",
        zoomLevels: "10-18",
        layer: "",
        url: "",
        hasAlphaEnabled: false,
      },
    });

  const [appearanceSuggestions, setAppearanceSuggestions] = useState<string[]>(
    [],
  );
  const [appearanceSuggestionsPending, setAppearanceSuggestionsPending] =
    useState(false);

  type FormValues = Parameters<Parameters<typeof handleSubmit>[0]>[0];

  const type = watch("type");

  const [uploadProgress, setUploadProgress] = useState<null | number>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const { converter3DApi } = await getApis();

      if (values.type === "IMAGERY") {
        const [startZoom, endZoom] = values.zoomLevels
          .split("-")
          .map((d) => parseInt(d));

        return await converter3DApi.converter3DConvertWMSWMTSPost({
          converter3DConvertWMSWMTSPostRequest: {
            layer: values.layer,
            name: values.name,
            url: values.url,
            endZoom,
            startZoom,
          },
        });
      }

      const file = values.type === "TERRAIN" ? values.terrainFile : values.file;

      if (!file) return;

      setUploadProgress(null);

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
          }),
        ),
      );

      await converter3DApi.converter3DCommitUploadPost({
        converter3DCommitUploadPostRequest: {
          token: token,
        },
      });

      switch (values.type) {
        case "TILES3D":
          await converter3DApi.converter3DConvert3DTilePost({
            converter3DConvert3DTilePostRequest: {
              srcSRS: values.srcSRS.value,
              token: token,
              appearance: values.appearance,
              name: values.name,
              hasAlphaEnabled: values.hasAlphaEnabled,
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

  console.log(formState.errors.file);

  const controllers = useMemo(() => {
    switch (type) {
      case "TILES3D":
        return (
          <Fragment key={type}>
            <Controller
              control={control}
              name="srcSRS"
              render={({ field }) => (
                <EPSGInput value={field.value} onChange={field.onChange} />
              )}
            />
            <Select></Select>
            <TextField
              fullWidth
              {...register("appearance")}
              label={t("data-management.appearance")}
            />
            <Typography>
              {t("converting-dialog.found-appearances")}{" "}
              {appearanceSuggestions.length === 0
                ? "-"
                : appearanceSuggestions.map((a) => (
                    <Chip
                      key={a}
                      onClick={() => setValue("appearance", a)}
                      label={a}
                    />
                  ))}
              {appearanceSuggestionsPending ? (
                <>
                  , <CircularProgress size="1rem" />
                </>
              ) : null}
            </Typography>
            <FormControlLabel
              {...register("hasAlphaEnabled")}
              control={<Switch />}
              label={t("data-management.has-alpha-enabled")}
            />
            <Controller
              control={control}
              name="file"
              rules={{
                required: true,
                validate: async (file) => {
                  if (!file) return false;
                  const reader = new ZipReader(new BlobReader(file));

                  for await (const entry of reader.getEntriesGenerator()) {
                    if (
                      !entry.directory &&
                      entry.filename.toLowerCase().endsWith(".gml")
                    ) {
                      return true;
                    }
                  }

                  return t("converting-dialog.no-gml-files-found");
                },
              }}
              render={({ field, formState }) => (
                <DragAndDropzone
                  name="file"
                  required
                  error={!!formState.errors?.file}
                  helperText={formState.errors.file?.message?.toString()}
                  value={field.value ? [field.value] : []}
                  onChange={async (event) => {
                    field.onChange(event[0] ?? null);
                    setAppearanceSuggestionsPending(true);
                    setAppearanceSuggestions([]);
                    worker.onmessage = (event) => {
                      if (typeof event.data.theme === "string")
                        setAppearanceSuggestions((themes) => {
                          const themesSet = new Set(themes);

                          themesSet.add(event.data.theme);

                          return Array.from(themesSet);
                        });
                      if (event.data.status === "finished")
                        setAppearanceSuggestionsPending(false);
                    };
                    worker.onerror = () =>
                      setAppearanceSuggestionsPending(false);
                    worker.postMessage({ file: event[0] });
                  }}
                  accept={{ "application/zip": [".zip"] }}
                />
              )}
            />
          </Fragment>
        );
      case "IMAGERY":
        return (
          <Fragment key={type}>
            <TextField
              label={t("converting-dialog.zoom-levels")}
              error={!!formState.errors.zoomLevels}
              helperText={formState.errors.zoomLevels?.message}
              {...register("zoomLevels", {
                required: true,
                validate: (value) => {
                  const zoomLevelsRegexp = new RegExp(/^\d+-\d+$/);

                  if (!zoomLevelsRegexp.test(value))
                    return t(
                      "converting-dialog.zoomlevels-must-be-of-form-10-18-for-example",
                    );

                  const [startZoom, endZoom] = value
                    .split("-")
                    .map((v) => parseInt(v));

                  if (startZoom < 0)
                    return t(
                      "converting-dialog.start-zoom-level-must-be-greater-than-0",
                    );

                  if (startZoom > endZoom)
                    return t(
                      "converting-dialog.start-zoom-must-be-smaller-than-endzoom",
                    );

                  if (endZoom > 20)
                    return t(
                      "converting-dialog.end-zoom-cant-be-greater-than-20",
                    );

                  return true;
                },
              })}
            />
            <MapLayerSelect control={control} layerName="layer" urlName="url" />
          </Fragment>
        );
      case "TERRAIN":
        return (
          <Fragment key={type}>
            <Controller
              control={control}
              name="srcSRS"
              render={({ field }) => (
                <EPSGInput value={field.value} onChange={field.onChange} />
              )}
            />
            <Controller
              control={control}
              name="terrainFile"
              rules={{
                required: true,
                validate: async (file) => {
                  if (!file) return false;
                  const reader = new ZipReader(new BlobReader(file));

                  const supportedExtensions = [
                    ".dxf",
                    ".dgn",
                    ".shp",
                    ".geojson",
                    ".gpkg",
                    ".gpx",
                    ".kml",
                    ".kmz",
                    ".mvt",
                    ".pbf",
                    ".sqlite",
                    ".svg",
                  ];

                  for await (const entry of reader.getEntriesGenerator()) {
                    if (
                      !entry.directory &&
                      supportedExtensions.some((extension) =>
                        entry.filename.toLowerCase().endsWith(extension),
                      )
                    ) {
                      return true;
                    }
                  }

                  return t("converting-dialog.no-dgm-files-found");
                },
              }}
              render={({ field }) => (
                <DragAndDropzone
                  name="terrainFile"
                  required
                  error={!!formState.errors?.terrainFile}
                  helperText={formState.errors.terrainFile?.message?.toString()}
                  value={field.value ? [field.value] : []}
                  onChange={(event) => field.onChange(event[0] ?? null)}
                  accept={{ "application/zip": [".zip"] }}
                />
              )}
            />
          </Fragment>
        );
    }
  }, [control, register, t, type, formState]);

  return (
    <Dialog open={open} onClose={close} fullWidth>
      <DialogTitle>{t("actions.converting")}</DialogTitle>
      <form onSubmit={handleSubmit((values) => mutate(values))}>
        <DialogContent>
          <Grid container pt={1} flexDirection="column" spacing={2}>
            <TextField
              required
              fullWidth
              {...register("name")}
              label={t("data-management.name")}
            />
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  label={t("data-management.type")}
                  fullWidth
                  required
                  value={field.value}
                  onChange={field.onChange}
                >
                  <MenuItem value={"TILES3D"}>
                    CityGML ({t("data-management.3d-tiles")})
                  </MenuItem>
                  <MenuItem value={"TERRAIN"}>
                    DGM ({t("data-management.terrain")})
                  </MenuItem>
                  <MenuItem value={"IMAGERY"}>Imagery (WMS, WMTS)</MenuItem>
                </Select>
              )}
            />
            {controllers}
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
