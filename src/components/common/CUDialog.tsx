import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect } from "react";
import {
  DefaultValues,
  FieldValues,
  useForm,
  UseFormReturn,
} from "react-hook-form";

export type CUDialogProps<Data extends FieldValues> = {
  mode: "CREATE" | "UPDATE";
  open: boolean;
  entity: string;
  close: () => void;
  onCreate: (data: Data) => void;
  onUpdate: (data: Data) => void;
  defaultData: Data;
  fetchedData: Data | null;
  isLoading: boolean;
  children: (form: UseFormReturn<Data>) => ReactNode;
};

export default function CUDialog<Data extends FieldValues>({
  mode,
  open,
  entity,
  close,
  onCreate,
  defaultData,
  fetchedData,
  isLoading,
  onUpdate,
  children,
}: CUDialogProps<Data>) {
  const form = useForm({
    defaultValues: defaultData as DefaultValues<Data>,
  });

  const t = useTranslations();

  useEffect(() => {
    if (fetchedData !== null) {
      form.reset(fetchedData);
    }
  }, [fetchedData, form, form.reset]);

  useEffect(() => {
    if (!open) {
      form.reset(defaultData);
    }
  }, [open, form.reset, form, defaultData]);

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
        <DialogContent>{children(form)}</DialogContent>
        <DialogActions>
          <Button onClick={close} variant="outlined">
            {t("actions.cancel")}
          </Button>
          <Button variant="contained" loading={isLoading} type="submit">
            {mode}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
