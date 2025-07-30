"use client";

import EPSGInput from "@/components/common/EPSGInput";
import PageContainer from "@/components/common/PageContainer";
import TranslationInput from "@/components/threeDViewer/TransformInputs/TranslationInput";
import { trpc } from "@/server/trpc/client";
import { Save, Undo } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Divider,
  TextField,
  Grid,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import proj4list from "proj4-list";
import { Controller, useForm } from "react-hook-form";

export default function ConfigurationPage() {
  const [
    {
      globalStartPointX,
      globalStartPointY,
      globalStartPointZ,
      defaultEPSG,
      ...data
    },
  ] = trpc.configurationRouter.getFull.useSuspenseQuery();

  const utils = trpc.useUtils();

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      ...data,
      defaultEPSG: {
        label: proj4list[defaultEPSG][0],
        value: proj4list[defaultEPSG][1],
      },
      globalStartPoint: {
        x: globalStartPointX,
        y: globalStartPointY,
        z: globalStartPointZ,
      },
    },
  });

  const t = useTranslations();

  const { enqueueSnackbar } = useSnackbar();

  const { mutate: updateConfigurationMutation } =
    trpc.configurationRouter.update.useMutation({
      onSuccess: () => {
        utils.configurationRouter.invalidate();
        enqueueSnackbar({
          variant: "success",
          message: t("generic.crud-notifications.update-success", {
            entity: t("entities.configuration"),
          }),
        });
        close();
      },
      onError: () =>
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.update-failed", {
            entity: t("entities.configuration"),
          }),
        }),
    });

  return (
    <PageContainer>
      <form
        onSubmit={handleSubmit(async (values) => {
          updateConfigurationMutation({
            id: data.id,
            defaultEpsg: values.defaultEPSG.value,
            globalStartPointX: values.globalStartPoint.x,
            globalStartPointY: values.globalStartPoint.y,
            globalStartPointZ: values.globalStartPoint.z,
            invitationEmailText: values.invitationEmailText,
            localProcessorFolder: values.localProcessorFolder,
            maxParallelBaseLayerConversions:
              values.maxParallelBaseLayerConversions,
            maxParallelFileConversions: values.maxParallelFileConversions,
          });
        })}
      >
        <Grid pb={2} container justifyContent="flex-end" spacing={2}>
          <Button type="submit" variant="contained" startIcon={<Save />}>
            {t("actions.save")}
          </Button>
          <Button
            onClick={() => reset()}
            variant="outlined"
            color="secondary"
            startIcon={<Undo />}
          >
            {t("actions.revert")}
          </Button>
        </Grid>

        <Accordion>
          <AccordionSummary>
            <Typography>{t("configuration.common")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container flexDirection="column" spacing={2}>
              <Controller
                control={control}
                name="defaultEPSG"
                render={({ field }) => (
                  <EPSGInput value={field.value} onChange={field.onChange} />
                )}
              />
              <Typography>{t('configuration.global-start-point')}</Typography>
              <Controller
                control={control}
                name="globalStartPoint"
                render={({ field }) => (
                  <TranslationInput
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <Typography>{t('configuration.conversions')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container flexDirection="column" spacing={2}>
              <TextField
                {...register("localProcessorFolder")}
                label={t('configuration.local-processor-folder')}
              />
              <Divider />
              <TextField
                type="number"
                slotProps={{
                  htmlInput: {
                    min: 1,
                    max: 9999,
                  },
                }}
                label={t('configuration.max-parallel-base-layer-conversions')}
                {...register("maxParallelBaseLayerConversions")}
              />
              <Divider />
              <TextField
                type="number"
                slotProps={{
                  htmlInput: {
                    min: 1,
                    max: 9999,
                  },
                }}
                label={t('configuration.max-parallel-file-conversions')}
                {...register("maxParallelFileConversions")}
              />
            </Grid>
          </AccordionDetails>
        </Accordion>
      </form>
    </PageContainer>
  );
}
