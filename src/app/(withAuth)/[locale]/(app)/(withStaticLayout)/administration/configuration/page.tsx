"use client";

import EPSGInput from "@/components/common/EPSGInput";
import PageContainer from "@/components/common/PageContainer";
import { TabPanel } from "@/components/common/TabPanel";
import MailTemplateInput from "@/components/inputs/MailTemplateInput";
import TranslationInput from "@/components/threeDViewer/TransformInputs/TranslationInput";
import { trpc } from "@/server/trpc/client";
import { Save, Undo } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Divider,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import proj4list from "proj4-list";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

const userContext = {
  user: {
    name: "Max Mustermann",
    email: "max@mustermann.de",
  },
};

const eventContext = {
  ...userContext,
  event: {
    startDate: dayjs().minute(0).add(0, "hour").format("DD.MM.YYYY"),
    startTime: dayjs().minute(0).add(0, "hour").format("HH:mm"),
    endDate: dayjs().minute(0).add(1.5, "hour").format("DD.MM.YYYY"),
    endTime: dayjs().minute(0).add(1.5, "hour").format("HH:mm"),
    title: "Musterevent",
  },
};

const oldEventContext = {
  ...userContext,
  ...eventContext,
  oldEvent: {
    startDate: dayjs()
      .subtract(1, "day")
      .minute(15)
      .add(0, "hour")
      .format("DD.MM.YYYY"),
    startTime: dayjs()
      .subtract(1, "day")
      .minute(15)
      .add(0, "hour")
      .format("HH:mm"),
    endDate: dayjs()
      .subtract(1, "day")
      .minute(15)
      .add(2, "hour")
      .format("DD.MM.YYYY"),
    endTime: dayjs()
      .subtract(1, "day")
      .minute(15)
      .add(2, "hour")
      .format("HH:mm"),
  },
};

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

  const [mailTemplateLanguage, setMailTemplateLanguage] = useState<"de" | "en">(
    "de"
  );

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
      onError: (error) => {
        console.error(error);
        enqueueSnackbar({
          variant: "error",
          message: t("generic.crud-notifications.update-failed", {
            entity: t("entities.configuration"),
          }),
        });
      },
    });

  return (
    <PageContainer>
      <form
        onSubmit={handleSubmit(async (values) => {
          updateConfigurationMutation({
            ...values,
            defaultEPSG: values.defaultEPSG.label,
            globalStartPointX: values.globalStartPoint.x,
            globalStartPointY: values.globalStartPoint.y,
            globalStartPointZ: values.globalStartPoint.z,
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
              <Typography>{t("configuration.global-start-point")}</Typography>
              <Controller
                control={control}
                name="globalStartPoint"
                render={({ field }) => (
                  <TranslationInput
                    value={field.value}
                    onImmediateChange={field.onChange}
                  />
                )}
              />
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <Typography>{t("configuration.conversions")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container flexDirection="column" spacing={2}>
              <TextField
                {...register("localProcessorFolder")}
                label={t("configuration.local-processor-folder")}
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
                label={t("configuration.max-parallel-base-layer-conversions")}
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
                label={t("configuration.max-parallel-file-conversions")}
                {...register("maxParallelFileConversions")}
              />
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <Typography>{t("configuration.unity")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container flexDirection="column" spacing={2}>
            <TextField
              type="number"
              label={t("configuration.maximum-flying-height")}
              {...register("maximumFlyingHeight")}
            />
            </Grid>
          </AccordionDetails>
          
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <Typography>{t("configuration.links")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container flexDirection="column" spacing={2}>
            <TextField
              label={t("configuration.system-logs-link")}
              {...register("systemActivityLink")}
            />
            <TextField
              label={t("configuration.user-profile-link")}
              {...register("userProfileLink")}
            />
            <TextField
              label={t("configuration.unity-download-link")}
              {...register("unityDownloadLink")}
            />
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <Typography>{t("configuration.email")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container flexDirection="column" spacing={2}>
            <TextField
              label={t("configuration.email-host")}
              {...register("emailHost")}
            />
            <TextField
              type="number"
              label={t("configuration.email-port")}
              {...register("emailPort")}
            />
            <FormControlLabel
              control={<Switch {...register("emailSecure")} />}
              label={t("configuration.email-secure")}
            ></FormControlLabel>
            <TextField
              label={t("configuration.email-user")}
              {...register("emailUser")}
            />
            <TextField
              label={t("configuration.email-password")}
              {...register("emailPassword")}
            />
            <TextField
              label={t("configuration.email-platform-address")}
              {...register("emailPlatformAddress")}
            />
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <Typography>{t("configuration.mail-templates")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Select
              fullWidth
              value={mailTemplateLanguage}
              onChange={(event) =>
                setMailTemplateLanguage(event.target.value as "de")
              }
            >
              <MenuItem value="de">DE</MenuItem>
              <MenuItem value="en">EN</MenuItem>
            </Select>
            <TabPanel visible index={"de"} value={mailTemplateLanguage}>
              <FormLabel>
                {t("configuration.mail-invitation-template")}
              </FormLabel>
              <Controller
                name="invitationEmailDE"
                control={control}
                render={({ field }) => (
                  <MailTemplateInput
                    context={eventContext}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Divider />
              <FormLabel>
                {t("configuration.mail-invitation-canceled-template")}
              </FormLabel>
              <Controller
                name="invitationCancelledEmailDE"
                control={control}
                render={({ field }) => (
                  <MailTemplateInput
                    context={eventContext}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Divider />
              <FormLabel>
                {t("configuration.mail-invitation-updated-template")}
              </FormLabel>
              <Controller
                name="invitationUpdatedEmailDE"
                control={control}
                render={({ field }) => (
                  <MailTemplateInput
                    context={oldEventContext}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Divider />
              <FormLabel>
                {t("configuration.mail-predeletion-template")}
              </FormLabel>
              <Controller
                name="predeletionEmailDE"
                control={control}
                render={({ field }) => (
                  <MailTemplateInput
                    context={userContext}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </TabPanel>
            <TabPanel visible index={"en"} value={mailTemplateLanguage}>
              <FormLabel>
                {t("configuration.mail-invitation-template")}
              </FormLabel>
              <Controller
                name="invitationEmailEN"
                control={control}
                render={({ field }) => (
                  <MailTemplateInput
                    context={eventContext}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Divider />
              <FormLabel>
                {t("configuration.mail-invitation-canceled-template")}
              </FormLabel>
              <Controller
                name="invitationCancelledEmailEN"
                control={control}
                render={({ field }) => (
                  <MailTemplateInput
                    context={eventContext}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Divider />
              <FormLabel>
                {t("configuration.mail-invitation-updated-template")}
              </FormLabel>
              <Controller
                name="invitationUpdatedEmailEN"
                control={control}
                render={({ field }) => (
                  <MailTemplateInput
                    context={oldEventContext}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Divider />
              <FormLabel>
                {t("configuration.mail-predeletion-template")}
              </FormLabel>
              <Controller
                name="predeletionEmailEN"
                control={control}
                render={({ field }) => (
                  <MailTemplateInput
                    context={userContext}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </TabPanel>
          </AccordionDetails>
        </Accordion>
      </form>
    </PageContainer>
  );
}
