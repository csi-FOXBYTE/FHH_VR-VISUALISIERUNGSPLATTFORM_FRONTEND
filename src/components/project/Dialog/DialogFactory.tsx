import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  DialogProps,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { Formik, FormikHelpers, FormikValues } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useTranslations } from "next-intl";
import SearchInput, { SearchInputQuery } from "@/components/common/SearchInput";
import { trpc } from "@/server/trpc/client";

// Typen
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
  useQuery?: () => {
    data?: Partial<T>;
    isLoading: boolean;
    error?: unknown;
  };
  initialValues: T;
  validationSchema: z.ZodType<T>;
  formConfig: FormConfig<T>;
  title: string;
  submitButtonText: string;
  projectId?: string;
}

type DialogFactoryProps<T> = BaseDialogFactoryProps<T>;

// Helper: Validierungsfunktion
const validateFormValues = async<T>(schema: z.ZodType<T>, values: T) => {
  try {
    await schema.parseAsync(values);
    return {};
  } catch (error: any) {
    const validationErrors: Record<string, string> = {};
    error.errors.forEach((err: any) => {
      validationErrors[err.path[0]] = err.message;
      console.log(err.message);
    });
    return validationErrors;
  }
};

// Helper: Fehleranzeige
const renderErrorText = (key: string, formikProps: FormikValues) => {
  return formikProps.touched[key] && formikProps.errors[key]
    ? (
      <Typography variant="caption" color="error" style={{ marginTop: "0.5rem" }}>
        {formikProps.errors[key]}
      </Typography>
    )
    : null;
};

// Helper: Modularisierte Feldlogik
const renderTextField = (key: string, config: FormConfig<any>[string], formikProps: FormikValues) => (
  <FormControl fullWidth margin="normal" key={key}>
    <TextField
      name={key}
      label={config.label}
      variant="filled"
      value={formikProps.values[key]}
      onChange={formikProps.handleChange}
      onBlur={formikProps.handleBlur}
      error={formikProps.touched[key] && Boolean(formikProps.errors[key])}
      helperText={formikProps.touched[key] && typeof formikProps.errors[key] === "string" ? formikProps.errors[key] : undefined}
      InputProps={{ readOnly: config.readOnly }}
    />
  </FormControl>
);

const renderDateField = (key: string, config: FormConfig<any>[string], formikProps: FormikValues) => (
  <FormControl fullWidth margin="normal" key={key}>
    <TextField
      name={key}
      label={config.label}
      type="date"
      variant="filled"
      value={formikProps.values[key] ? new Date(formikProps.values[key]).toISOString().split("T")[0] : ""}
      onChange={formikProps.handleChange}
      onBlur={formikProps.handleBlur}
      error={formikProps.touched[key] && Boolean(formikProps.errors[key])}
      helperText={formikProps.touched[key] && typeof formikProps.errors[key] === "string" ? formikProps.errors[key] : undefined}
      InputLabelProps={{ shrink: true }}
      inputProps={{ readOnly: config.readOnly }}
    />
  </FormControl>
);

const renderSelectField = (key: string, config: FormConfig<any>[string], formikProps: FormikValues, query: SearchInputQuery<{ label: string; value: string }[], any, any>) => (

  <FormControl fullWidth margin="normal" key={key}>
    <SearchInput
      label={config.label}
      extraInput={{}}
      style={{ flex: 1 }}
      value={formikProps.values[key]}
      onChange={(value) => formikProps.setFieldValue(key, value)}
      useQuery={query}
    />
    {renderErrorText(key, formikProps)}
  </FormControl>
);

const renderRadioField = (key: string, config: FormConfig<any>[string], formikProps: FormikValues) => (
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
    {renderErrorText(key, formikProps)}
  </FormControl>
);

// Hauptkomponente
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
  useQuery,
}: DialogFactoryProps<T>) {
  const t = useTranslations();
  const { data: queryData, isLoading } = useQuery?.() ?? {};
  const renderField = (key: string, config: FormConfig<any>[string], formikProps: FormikValues) => {
    switch (config.type) {
      case "text":
        return renderTextField(key, config, formikProps);
      case "date":
        return renderDateField(key, config, formikProps);
      case "participantSelection":
        return renderSelectField(key, config, formikProps, trpc.participantsRouter.searchParticipant.useQuery);
      case "radio":
        return renderRadioField(key, config, formikProps);
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      {isLoading ? (
        <Box position="relative" height="200px">
          <CircularProgress style={{ position: "absolute", top: "50%", left: "50%" }} />
        </Box>
      ) : (
        <Formik
          initialValues={queryData as T ?? initialValues}
          validate={(values) => validateFormValues(validationSchema, values)}
          validationSchema={toFormikValidationSchema(validationSchema)}
          onSubmit={(values, formikHelpers) => {
            console.log("Submit Triggered", values);
            onSubmit(values, formikHelpers)
          }}
        >
          {(formikProps) => (
            <form onSubmit={formikProps.handleSubmit}>
              <DialogContent>
                {Object.keys(formConfig).map((key) => renderField(key, formConfig[key], formikProps))}
              </DialogContent>
              <DialogActions>
                <Button variant="outlined" onClick={close}>
                  {t("common.cancelButton")}
                </Button>
                <Button variant="outlined" type="submit">
                  {submitButtonText}
                </Button>
              </DialogActions>
            </form>
          )}
        </Formik>
      )}
    </Dialog>
  );
}
