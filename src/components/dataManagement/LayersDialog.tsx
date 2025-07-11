import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
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
import GatewayAPI from "@/server/gatewayApi/client";

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

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: {
      files: File[];
      srcSRS: { label: string; value: string };
      type: "3D-TILES" | "TERRAIN";
      name: string;
    }) => {
      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("srcSRS", values.srcSRS.value);

      formData.append("file", values.files[0]);

      switch (values.type) {
        case "3D-TILES":
          await GatewayAPI.converter3DApi.converter3DUpload3DTilePost({
            srcSRS: values.srcSRS.value,
            file: values.files[0],
            name: values.name,
          });
          break;
        case "TERRAIN":
          await GatewayAPI.converter3DApi.converter3DUploadTerrainPost({
            srcSRS: values.srcSRS.value,
            file: values.files[0],
            name: values.name,
          });
          break;
        default:
          throw new Error("Found no matching type!");
      }

      close();
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
    },
    onError: (error) => {
      console.error(error);
      enqueueSnackbar({
        variant: "error",
        message: t("generic.crud-notifications.create-failed", {
          entity: t("entities.base-layer"),
        }),
      });
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
          <Button loading={isPending} variant="contained" type="submit">
            Wandeln
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
