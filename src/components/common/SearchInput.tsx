import { Autocomplete, AutocompleteProps, TextField } from "@mui/material";
import { SkipToken, skipToken } from "@tanstack/react-query";
import { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useEffect, useMemo, useState } from "react";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";

export default function SearchInput<
  TError,
  TExtraInput extends Record<string, any>
>({
  useQuery,
  value,
  label,
  extraInput,
  onChange = () => {},
  ...props
}: Omit<
  AutocompleteProps<{ value: string; label: string }, false, false, false>,
  "renderInput" | "options" | "value" | "onChange" | "label"
> & {
  extraInput: TExtraInput;
  label?: string;
  useQuery: (
    props:
      | ({
          name: string;
        } & TExtraInput)
      | SkipToken
  ) => UseTRPCQueryResult<{ label: string; value: string }[], TError>;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [tempOptions, setTempOptions] =
    useState<{ label: string; value: string }[]>();

  const { data: options = [], isLoading } = useQuery(
    open ? { name: debouncedSearchTerm, ...extraInput } : skipToken
  );

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);

    return () => window.clearTimeout(id);
  }, [searchTerm]);

  const foundOption = useMemo(() => {
    return (
      options.find((option) => option.value === value) ??
      tempOptions?.find((tempOption) => tempOption.value === value) ??
      null
    );
  }, [value, options, tempOptions]);

  return (
    <Autocomplete
      {...props}
      value={foundOption}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" />
      )}
      onInputChange={(_, newInputValue) => {
        setSearchTerm(newInputValue);
      }}
      onChange={(_, newValue) => {
        setTempOptions(options);
        onChange(newValue?.value ?? "");
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        const matches = match(option.label, debouncedSearchTerm, {
          insideWords: true,
          findAllOccurrences: true,
        });
        const parts = parse(option.label, matches);

        return (
          <li key={key} {...optionProps}>
            <div>
              {parts.map((part, index) => (
                <span
                  key={part.text + index}
                  style={{
                    fontWeight: part.highlight ? 700 : undefined,
                    textDecoration: part.highlight ? "underline" : undefined,
                  }}
                >
                  {part.text}
                </span>
              ))}
            </div>
          </li>
        );
      }}
      loading={isLoading}
      options={options}
    />
  );
}
