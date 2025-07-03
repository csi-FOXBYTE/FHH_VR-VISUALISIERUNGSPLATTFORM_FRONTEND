import {
  Autocomplete,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { createFormFactory } from ".";
import TranslationInput from "../threeDViewer/TransformInputs/TranslationInput";
import { ComponentProps } from "react";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

export type AppFormFactoryProps = ComponentProps<typeof AppFormFactory>;

export const AppFormFactory = createFormFactory(
  {
    number: {
      render(name, { label }: { label?: string }, { register }) {
        return <TextField label={label} {...register(name)} />;
      },
      valueType: 0 as number,
    },
    text: {
      render(name, { label }: { label?: string }, { register }) {
        return <TextField label={label} {...register(name)} />;
      },
      valueType: "" as string,
    },
    switch: {
      render(name, { label }: { label?: string }, { control }) {
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <FormControlLabel
                label={label}
                checked={field.value}
                onChange={(_, checked) => field.onChange(checked)}
                control={<Switch />}
              />
            )}
          />
        );
      },
      valueType: true as boolean,
    },
    georeferencedTranslation: {
      render(name, { label }: { label?: string }, { control }) {
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <TranslationInput
                label={label}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        );
      },
      valueType: { x: 0, y: 0, z: 0 } as { x: number; y: number; z: number },
    },
    search: {
      render(
        name,
        {
          label,
          search,
          onSearchChange,
          options,
          multiple,
        }: {
          multiple?: boolean;
          label?: string;
          search: string;
          onSearchChange: (value: string) => void;
          options: { value: string; label: string }[];
        },
        { control }
      ) {
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Autocomplete
                filterOptions={(x) => x}
                filterSelectedOptions
                includeInputInList
                autoComplete
                multiple={multiple}
                onInputChange={(_, value) => onSearchChange(value)}
                inputValue={search}
                onChange={(_, value) => field.onChange(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    ref={field.ref}
                    label={label}
                    fullWidth
                  />
                )}
                value={field.value}
                getOptionKey={(opt) => opt.value}
                getOptionLabel={(opt) => opt.label}
                options={options}
              />
            )}
          />
        );
      },
      valueType: { value: "", label: "" },
    },
    dateTime: {
      render(name, { label }: { label?: string }, { control }) {
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <DateTimePicker
                sx={{ flex: 1 }}
                ref={field.ref}
                disabled={field.disabled}
                value={dayjs(field.value)}
                onChange={(value) => field.onChange(value?.toDate())}
                label={label}
              />
            )}
          />
        );
      },
      valueType: new Date(),
    },
  },
  {
    split: {
      render({ children }) {
        return (
          <Grid container spacing={2}>
            {children}
          </Grid>
        );
      },
    },
    node: {
      render({ children }) {
        return children;
      },
    },
  }
);
