"use client";

import EPSGInput from "@/components/common/EPSGInput";
import PageContainer from "@/components/common/PageContainer";
import TranslationInput from "@/components/threeDViewer/TransformInputs/TranslationInput";
import { trpc } from "@/server/trpc/client";
import { Save } from "@mui/icons-material";
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

  const { register, control, handleSubmit } = useForm({
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

  return (
    <PageContainer>
      <Button startIcon={<Save />}>Save</Button>
      <form onSubmit={handleSubmit(console.log)}>
        <Accordion title="Common">
          <AccordionSummary>
            <Typography>Common</Typography>
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
              <Typography>Global Start point</Typography>
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
            <Typography>Conversions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container flexDirection="column" spacing={2}>
              <TextField
                {...register("localProcessorFolder")}
                label="Local processor folder"
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
                label="Max parallel base layer conversions"
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
                label="Max parallel file conversions"
                {...register("maxParallelFileConversions")}
              />
            </Grid>
          </AccordionDetails>
        </Accordion>
      </form>
    </PageContainer>
  );
}
