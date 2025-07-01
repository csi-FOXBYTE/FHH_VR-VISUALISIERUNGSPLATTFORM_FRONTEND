import { DefaultValues, FieldValues, useForm } from "react-hook-form";
import {
  AppFormFactory,
  AppFormFactoryProps,
} from "../formFactory/AppFormFactory";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { useEffect } from "react";

export function EasyCUDialog<Data extends FieldValues>({
  model,
  onCreate,
  onUpdate,
  open,
  close,
  defaultData,
  entity,
  fetchedData,
  isLoading,
  mode,
}: {
  defaultData: Data;
  model: (Omit<AppFormFactoryProps["model"][number], "name"> & {
    name: keyof Data;
  })[];
  mode: "CREATE" | "UPDATE";
  open: boolean;
  entity: string;
  close: () => void;
  onCreate: (data: Data) => void;
  onUpdate: (data: Data) => void;
  fetchedData: Data | null;
  isLoading: boolean;
}) {
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
  }, [open, reset, defaultData]);

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
        <DialogTitle>
          {mode} {entity}
        </DialogTitle>
        <DialogContent>
          <Grid container flexDirection="column" spacing={2}>
            {/** @ts-expect-error wrong types */}
            <AppFormFactory model={model} form={form} />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" loading={isLoading} type="submit">
            {mode}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
