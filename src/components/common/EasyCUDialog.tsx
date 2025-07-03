import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import { DefaultValues, FieldValues, useForm } from "react-hook-form";
import {
  AppFormFactory,
  AppFormFactoryProps,
} from "../formFactory/AppFormFactory";
import { parseAsJson, useQueryState } from "nuqs";
import { z } from "zod";
import { useTranslations } from "next-intl";

const easyCUStateZod = z.object({
  mode: z.enum(["CREATE", "UPDATE"]),
  open: z.boolean(),
  id: z.string().optional(),
});
export type EasyCUStateType = z.infer<typeof easyCUStateZod>;

export function useEasyCUDialogState(key: string) {
  const [state, setState] = useQueryState(
    key,
    parseAsJson(easyCUStateZod.parse).withDefault({
      mode: "CREATE",
      open: false,
      id: undefined,
    })
  );

  return useMemo(() => {
    return [
      state,
      {
        openCreate: () => setState({ mode: "CREATE", open: true }),
        openUpdate: (id: string) =>
          setState({ id, mode: "UPDATE", open: true }),
        close: () =>
          setState({
            mode: "CREATE",
            open: false,
            id: undefined,
          }),
      },
    ] as const;
  }, [setState, state]);
}

export function EasyCUDialog<Data extends FieldValues>({
  model,
  onCreate,
  onUpdate,
  close,
  defaultData,
  fetchedData,
  isLoading,
  state: { mode, open },
}: {
  defaultData: Data;
  model: (Omit<AppFormFactoryProps["model"][number], "name"> & {
    name: keyof Data;
  })[];
  state: EasyCUStateType;
  close: () => void;
  onCreate: (data: Data) => void;
  onUpdate: (data: Data) => void;
  fetchedData: Data | null;
  isLoading: boolean;
}) {
  const t = useTranslations();

  const form = useForm({
    defaultValues: defaultData as DefaultValues<Data>,
  });

  const { reset } = form;

  useEffect(() => {
    if (fetchedData !== null) {
      reset(fetchedData);
    }
  }, [fetchedData, reset]);

  useEffect(() => {
    if (!open) {
      reset(defaultData);
    }
  }, [defaultData, open, reset]);

  return (
    <Dialog fullWidth open={open} onClose={close}>
      <form
        onSubmit={form.handleSubmit((values) => {
          switch (mode) {
            case "CREATE":
              return onCreate(values);
            case "UPDATE":
              return onUpdate(values);
          }
        })}
      >
        <DialogTitle>{t(`actions.${mode.toLowerCase()}`)}</DialogTitle>
        <DialogContent>
          <Grid container paddingTop={1} flexDirection="column" spacing={2}>
            {/** @ts-expect-error wrong types */}
            <AppFormFactory model={model} form={form} />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} variant="outlined">
            {t("actions.cancel")}
          </Button>
          <Button variant="contained" loading={isLoading} type="submit">
            {t(`actions.${mode.toLowerCase()}`)}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
