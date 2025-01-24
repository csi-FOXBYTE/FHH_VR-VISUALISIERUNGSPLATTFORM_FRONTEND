import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  DialogProps,
  Typography,
} from "@mui/material";
import { Formik, FormikHelpers, FormikValues } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import ParticipantSelection from "@/components/common/ParticipantsSelection";
import { useTranslations } from "next-intl";

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
  validationSchema: z.ZodType<T>;
  formConfig: FormConfig<T>;
  title: string;
  submitButtonText: string;
  projectId?: string;
}

type DialogFactoryProps<T> = BaseDialogFactoryProps<T>;

function renderError(key: string, formikProps: FormikValues) {
  console.log(formikProps)
  if (formikProps.touched[key] && formikProps.errors[key]) {
    return (
      <Typography variant="caption" color="error" style={{ marginTop: "0.5rem" }}>
        {formikProps.errors[key] as string}
      </Typography>
    );
  }
  return null;
}

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
        validate={async (values) => {
          try {
            await toFormikValidationSchema(validationSchema).validate(values);
          } catch (error) {
            const validationErrors = {};
            if (error.inner) {
              error.inner.forEach((err) => {
                validationErrors[err.path] = err.message;
              });
            }
            console.error("Validation errors:", validationErrors);
            return validationErrors;
          }
        }}
        validationSchema={toFormikValidationSchema(validationSchema)}
        onSubmit={(values, formikHelpers) => {
          console.log("Submit Triggered");
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
                          onBlur={formikProps.handleBlur}
                          error={formikProps.touched[key] && Boolean(formikProps.errors[key])}
                          helperText={formikProps.touched[key] && typeof formikProps.errors[key] === 'string' ? formikProps.errors[key] : undefined}
                          InputProps={{ readOnly: config.readOnly }}
                        />
                      </FormControl>
                    );
                  case "select":
                    return (
                      <FormControl fullWidth margin="normal" key={key}>
                        <InputLabel id={`${key}-label`}>{config.label}</InputLabel>
                        <Select
                          labelId={`${key}-label`}
                          name={key}
                          value={formikProps.values[key]}
                          onChange={formikProps.handleChange}
                          onBlur={formikProps.handleBlur}
                          error={formikProps.touched[key] && Boolean(formikProps.errors[key])}
                        >
                          {config.options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {renderError(key, formikProps)}
                      </FormControl>
                    );
                  case "participantSelection":
                    if (!projectId) {
                      console.error("projectId is required for participantSelection");
                      return null;
                    }
                    return (
                      <FormControl fullWidth margin="normal" key={key}>
                        <ParticipantSelection
                          projectId={projectId}
                          value={formikProps.values[key]}
                          onChange={(event, value) => {
                            formikProps.handleChange(value);

                            // formikProps.setFieldValue(key, value?.id || "");
                            formikProps.setFieldTouched(key, true);
                          }}
                          label={config.label}
                        />
                        {renderError(key, formikProps)}
                      </FormControl>
                    );
                  case "radio":
                    return (
                      <FormControl component="fieldset" margin="normal" key={key}>
                        <FormLabel component="legend">{config.label}</FormLabel>
                        <RadioGroup
                          name={key}
                          value={formikProps.values[key]}
                          onChange={formikProps.handleChange}
                          onBlur={formikProps.handleBlur}
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
                        {renderError(key, formikProps)}
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
                          onBlur={formikProps.handleBlur}
                          error={formikProps.touched[key] && Boolean(formikProps.errors[key])}
                          helperText={formikProps.touched[key] && typeof formikProps.errors[key] === 'string' ? formikProps.errors[key] : undefined}
                          InputProps={{ readOnly: config.readOnly }}
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
