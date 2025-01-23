import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  DialogProps,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from "@mui/material";
import { Formik, FormikHelpers, FormikValues } from "formik";
import { useTranslations } from "next-intl";
import ParticipantSelection from "@/components/common/ParticipantsSelection";

type FormConfig<T> = {
  [K in keyof T]: {
    type: "text" | "select" | "participantSelection" | "radio" | "date";
    label: string;
    options?: { value: string; label: string }[];
    readOnly?: boolean;
  };
};

interface BaseDialogFactoryProps<T> extends Omit<DialogProps, "onSubmit"> {
  close: () => void;
  onSubmit: (values: T, formikHelpers: FormikHelpers<T>) => void;
  initialValues: T;
  validationSchema: object;
  formConfig: FormConfig<T>;
  title: string;
  submitButtonText: string;
  projectId?: string;
}

type DialogFactoryProps<T> = BaseDialogFactoryProps<T>;

export function DialogFactory<T extends FormikValues>({
  close,
  open,
  initialValues,
  validationSchema,
  onSubmit,
  formConfig,
  title,
  submitButtonText,
  projectId,
}: DialogFactoryProps<T>) {
  const t = useTranslations();

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, formikHelpers) => {
          console.log("test");
          onSubmit(values, formikHelpers);
        }}
      >
        {(formikProps) => (
          <form onSubmit={formikProps.handleSubmit}>
            <DialogContent>
              {Object.keys(formConfig).map((key) => {
                const config = formConfig[key as keyof T];
                switch (config.type) {
                  case "text":
                    return (
                      <FormControl fullWidth margin="normal" key={key}>
                        <TextField
                          name={key}
                          label={config.label}
                          variant="filled"
                          value={formikProps.values[key]}
                          onChange={formikProps.handleChange}
                          slotProps={{
                            input: {
                              readOnly: config.readOnly,
                            },
                          }}
                        />
                      </FormControl>
                    );
                  case "select":
                    return (
                      <FormControl fullWidth margin="normal" key={key}>
                        <InputLabel id={`${key}-label`}>
                          {config.label}
                        </InputLabel>
                        <Select
                          labelId={`${key}-label`}
                          name={key}
                          value={formikProps.values[key]}
                          onChange={formikProps.handleChange}
                          variant="filled"
                        >
                          {config.options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  case "participantSelection":
                    if (!projectId) {
                      console.error(
                        "projectId is required for participantSelection"
                      );
                      return null;
                    }
                    return (
                      <ParticipantSelection
                        key={key}
                        projectId={projectId}
                        value={formikProps.values[key]}
                        onChange={(event, value) => {
                          formikProps.handleChange(value);
                        }}
                        label={config.label}
                      />
                    );
                  case "radio":
                    return (
                      <FormControl
                        component="fieldset"
                        margin="normal"
                        key={key}
                      >
                        <FormLabel component="legend">{config.label}</FormLabel>
                        <RadioGroup
                          name={key}
                          value={formikProps.values[key]}
                          onChange={formikProps.handleChange}
                        >
                          {config.options?.map((option) => (
                            <FormControlLabel
                              key={option.value}
                              value={option.value}
                              control={<Radio />}
                              label={option.label}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    );
                  case "date":
                    return (
                      <FormControl fullWidth margin="normal" key={key}>
                        <TextField
                          name={key}
                          label={config.label}
                          type="date"
                          variant="filled"
                          value={formikProps.values[key]}
                          onChange={formikProps.handleChange}
                          slotProps={{
                            input: {
                              readOnly: config.readOnly,
                            },
                          }}
                        />
                      </FormControl>
                    );
                  default:
                    return null;
                }
              })}
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" color="inherit" onClick={close}>
                {t("common.cancelButton")}
              </Button>
              <Button variant="outlined" type="submit">
                {submitButtonText}
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
}
