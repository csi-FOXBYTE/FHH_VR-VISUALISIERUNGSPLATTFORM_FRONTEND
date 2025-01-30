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
import SelectCustom from "@/components/common/SelectCustom";

export const generateZodValidationSchema = <
  T extends Record<string, { validation: z.ZodTypeAny }>
>(
  model: T
): z.ZodObject<{ [K in keyof T]: T[K]["validation"] }> => {
  const shape = Object.keys(model).reduce((acc, key) => {
    const field = model[key];

    if (field.validation instanceof z.ZodString) {
      acc[key as keyof T] = field.validation.nullish().default(""); // Fix für optionale Strings
    } else {
      acc[key as keyof T] = field.validation;
    }

    return acc;
  }, {} as { [K in keyof T]: T[K]["validation"] });

  return z.object(shape);
};

export const generateInitialValues = <
  T extends Record<
    string,
    { initialValue: string | string[] | number | boolean | Date | undefined }
  >
>(
  model: T
) => {
  return Object.keys(model).reduce((acc, key) => {
    const typedKey = key as keyof T;
    acc[typedKey] = model[typedKey].initialValue;
    return acc;
  }, {} as { [K in keyof T]: T[K]["initialValue"] });
};

type FormConfig<T> = {
  [K in keyof T]: {
    type:
      | "text"
      | "select"
      | "searchSelection"
      | "radio"
      | "date"
      | "attachment"
      | "textArea";
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
async function validateFormValues<T>(schema: z.ZodType<T>, values: T) {
  try {
    await schema.parseAsync(values);
    return {};
  } catch (error: unknown) {
    const validationErrors: Record<string, string> = {};
    error.errors.forEach((err: unknown) => {
      validationErrors[err.path[0]] = err.message;
      console.error(err);
    });
    return validationErrors;
  }
}
//#region Renderer Fields

const renderErrorText = (key: string, formikProps: FormikValues) => {
  return formikProps.touched[key] && formikProps.errors[key] ? (
    <Typography variant="caption" color="error" style={{ marginTop: "0.5rem" }}>
      {formikProps.errors[key]}
    </Typography>
  ) : null;
};

function renderTextField<T>(
  key: string,
  config: FormConfig<any>[string],
  formikProps: FormikValues,
  rows?: number
) {
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
        helperText={
          formikProps.touched[key] &&
          typeof formikProps.errors[key] === "string"
            ? formikProps.errors[key]
            : undefined
        }
        InputProps={{ readOnly: config.readOnly }}
        rows={rows}
      />
    </FormControl>
  );
}

const renderDateField = (
  key: string,
  config: FormConfig<any>[string],
  formikProps: FormikValues
) => (
  <FormControl fullWidth margin="normal" key={key}>
    <TextField
      name={key}
      label={config.label}
      type="date"
      variant="filled"
      value={
        formikProps.values[key]
          ? new Date(formikProps.values[key]).toISOString().split("T")[0]
          : ""
      }
      onChange={formikProps.handleChange}
      onBlur={formikProps.handleBlur}
      error={formikProps.touched[key] && Boolean(formikProps.errors[key])}
      helperText={
        formikProps.touched[key] && typeof formikProps.errors[key] === "string"
          ? formikProps.errors[key]
          : undefined
      }
      InputLabelProps={{ shrink: true }}
      inputProps={{ readOnly: config.readOnly }}
    />
  </FormControl>
);

const renderSelectField = (
  key: string,
  config: FormConfig<any>[string],
  formikProps: FormikValues
) => (
  <FormControl fullWidth margin="normal" key={key}>
    <SelectCustom
      label={config.label}
      style={{ flex: 1 }}
      value={formikProps.values[key]}
      onChange={(value: string) => formikProps.setFieldValue(key, value)}
      options={config.options ?? []}
    />
    {renderErrorText(key, formikProps)}
  </FormControl>
);

const renderSearchSelectField = (
  key: string,
  config: FormConfig<any>[string],
  formikProps: FormikValues,
  query: SearchInputQuery<{ label: string; value: string }[], any, any>
) => (
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

const renderRadioField = (
  key: string,
  config: FormConfig<any>[string],
  formikProps: FormikValues
) => (
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

const renderAttachmentField = (
  key: string,
  config: FormConfig<any>[string],
  formikProps: FormikValues
) => (
  <FormControl component="fieldset" margin="normal" key={key}>
    <FormLabel component="legend">{config.label}</FormLabel>
    <div>TODO:</div>
    {renderErrorText(key, formikProps)}
  </FormControl>
);
const formatDateFields = <T extends FormikValues>(
  values: T,
  formConfig: FormConfig<T>
): T => {
  const formattedValues = { ...values };

  Object.keys(formConfig).forEach((key) => {
    if (formConfig[key].type === "date" && formattedValues[key]) {
      const dateValue = formattedValues[key];
      if (dateValue instanceof Date) {
        (formattedValues as any)[key] = dateValue.toISOString().split("T")[0];
      }
    }
  });

  return formattedValues;
};
//#region Component Start

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
  const renderField = (
    key: string,
    config: FormConfig<any>[string],
    formikProps: FormikValues
  ) => {
    switch (config.type) {
      case "text":
        return renderTextField(key, config, formikProps);
      case "textArea":
        return renderTextField(key, config, formikProps, 4);
      case "date":
        return renderDateField(key, config, formikProps);
      case "select":
        return renderSelectField(key, config, formikProps);
      case "searchSelection":
        return renderSearchSelectField(
          key,
          config,
          formikProps,
          trpc.participantsRouter.searchParticipant.useQuery
        );
      case "radio":
        return renderRadioField(key, config, formikProps);
      case "attachment":
        return renderAttachmentField(key, config, formikProps);
      default:
        return null;
    }
  };

  //#region Render
  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      {isLoading ? (
        <Box position="relative" height="200px">
          <CircularProgress
            style={{ position: "absolute", top: "50%", left: "50%" }}
          />
        </Box>
      ) : (
        <Formik
          initialValues={formatDateFields(
            (queryData as T) ?? initialValues,
            formConfig
          )}
          validate={(values) => validateFormValues(validationSchema, values)}
          validationSchema={toFormikValidationSchema(validationSchema)}
          onSubmit={(values, formikHelpers) => {
            console.info("Submit Triggered", values);
            onSubmit(values, formikHelpers);
          }}
        >
          {(formikProps) => (
            <form onSubmit={formikProps.handleSubmit}>
              <DialogContent>
                {Object.keys(formConfig).map((key) =>
                  renderField(key, formConfig[key], formikProps)
                )}
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
