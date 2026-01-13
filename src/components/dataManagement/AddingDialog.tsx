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
import { useTranslations } from "next-intl";
import { trpc } from "@/server/trpc/client";
import { getApis } from "@/server/gatewayApi/client";
import { $Enums } from "@prisma/client";

export default function AddingDialog({
  open,
  close,
}: {
  open: boolean;
  close: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();

  const t = useTranslations();

  const utils = trpc.useUtils();

  const { handleSubmit, control, register } = useForm({
    defaultValues: {
      type: "TILES3D" as "TILES3D" | "TERRAIN",
      name: "",
      href: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: {
      type: $Enums.LAYER_TYPE;
      name: string;
      href: string;
    }) => {
      const apis = await getApis();

      await apis.baseLayerApi.baseLayerPut({
        baseLayerPutRequest: values,
      });
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
      <DialogTitle>{t("actions.add")}</DialogTitle>
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
                  required
                  label={t("data-management.type")}
                  fullWidth
                  value={field.value}
                  onChange={field.onChange}
                >
                  <MenuItem value={"TILES3D"}>
                    {t("data-management.3d-tiles")}
                  </MenuItem>
                  <MenuItem value={"TERRAIN"}>
                    {t("data-management.terrain")}
                  </MenuItem>
                  <MenuItem value={"IMAGERY"}>
                    {t("data-management.imagery")}
                  </MenuItem>
                </Select>
              )}
            />
            <TextField
              required
              fullWidth
              {...register("href")}
              label={t("data-management.href")}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button disabled={isPending} variant="contained" type="submit">
            {t("actions.add")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
