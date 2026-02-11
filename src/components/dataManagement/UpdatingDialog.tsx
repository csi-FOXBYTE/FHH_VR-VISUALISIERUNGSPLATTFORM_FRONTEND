import { getApis } from "@/server/gatewayApi/client";
import { trpc } from "@/server/trpc/client";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { AppFormFactory } from "../formFactory/AppFormFactory";
import { useEffect, useState } from "react";

export default function UpdatingDialog({
  open,
  close,
  row,
}: {
  open: boolean;
  close: () => void;
  row: null | {
    id: string;
    href: string | null;
    isPublic: boolean;
    visibleForGroups: { id: string; name: string }[];
  };
}) {
  const t = useTranslations();

  const form = useForm({
    defaultValues: {
      href: row?.href ?? "",
      visibleForGroups:
        row?.visibleForGroups.map((v) => ({ label: v.name, value: v.id })) ??
        [],
      isPublic: false,
      id: row?.id,
    },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (!row) return;

    reset({
      href: row.href ?? undefined,
      id: row.id,
      isPublic: row.isPublic,
      visibleForGroups: row.visibleForGroups.map((v) => ({
        label: v.name,
        value: v.id,
      })),
    });
  }, [row?.href, row?.id, row?.visibleForGroups, row?.isPublic, row, reset]);

  const utils = trpc.useUtils();

  const { enqueueSnackbar } = useSnackbar();

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: {
      id?: string;
      href: string;
      isPublic: boolean;
      visibleForGroups: { label: string; value: string }[];
    }) => {
      if (!values.id) throw new Error("No id supplied!");

      const apis = await getApis();

      await apis.baseLayerApi.baseLayerPatch({
        baseLayerPatchRequest: {
          href: row?.href === null ? null : values.href,
          id: values.id,
          visibleForGroups: values.visibleForGroups.map((v) => v.value) ?? [],
          isPublic: values.isPublic,
        },
      });

      return true;
    },
    onSuccess: () => {
      utils.dataManagementRouter.invalidate();
      enqueueSnackbar({
        variant: "success",
        message: t("generic.crud-notifications.update-success", {
          entity: t("entities.base-layer"),
        }),
      });
      close();
    },
    onError: (error) => {
      console.error(error);
      enqueueSnackbar({
        variant: "error",
        message: t("generic.crud-notifications.update-failed", {
          entity: t("entities.base-layer"),
        }),
      });
    },
  });

  const [searchVisibleForGroups, setSearchVisibleForGroups] = useState("");

  const { data: possibleVisibleForGroups = [] } =
    trpc.dataManagementRouter.getVisibleForGroups.useQuery({
      search: searchVisibleForGroups,
    });

  return (
    <Dialog fullWidth open={open} onClose={close}>
      <DialogTitle>{t("actions.update")}</DialogTitle>
      <form onSubmit={handleSubmit((values) => mutate(values))}>
        <DialogContent>
          <Grid container pt={1} flexDirection="column" spacing={2}>
            <AppFormFactory
              form={form}
              model={[
                {
                  name: "href",
                  type: "text",
                  props: {
                    disabled: row?.href === null || row?.href === undefined,
                    label: t("data-management.href"),
                  },
                },
                {
                  type: "search",
                  name: "visibleForGroups",
                  props: {
                    search: searchVisibleForGroups,
                    onSearchChange: setSearchVisibleForGroups,
                    multiple: true,
                    options: possibleVisibleForGroups,
                    label: t("data-management.visible-for-groups"),
                  },
                },
                {
                  type: "switch",
                  name: "isPublic",
                  props: {
                    label: t("data-management.public"),
                  },
                },
              ]}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} variant="outlined">
            {t("actions.cancel")}
          </Button>
          <Button variant="contained" loading={isPending} type="submit">
            {t("actions.update")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
