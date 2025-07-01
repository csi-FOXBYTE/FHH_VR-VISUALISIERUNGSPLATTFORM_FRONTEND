import {
  Autocomplete,
  MenuItem,
  Paper,
  PaperProps,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { keepPreviousData, SkipToken } from "@tanstack/react-query";
import { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

export type SearchSelectOption = {
  label: string;
  value: string;
};

export type SearchSelectProps = {
  label: string;
  container?: HTMLElement;
  getOptions: (searchValue: string) => Promise<SearchSelectOption[]>;
  value: string | null;
  onChange: (value: string | null) => void;
  addOption?: (label: string) => Promise<string | null> | string | null;
  textFieldProps?: TextFieldProps;
  disabled?: boolean;
  regex?: RegExp;
};

type OptionsProps = PaperProps & {
  onAddClicked?: () => void;
  addOptionLabel?: string;
};

function Options(props: OptionsProps) {
  const { children, onAddClicked, addOptionLabel, ...other } = props;
  return (
    <Paper {...other}>
      {children}
      {!!onAddClicked && !!addOptionLabel ? (
        <MenuItem
          onClick={onAddClicked}
          onMouseDown={(e) => e.preventDefault()}
        >
          <Typography color="text.secondary" fontStyle="italic">
            + &quot;{addOptionLabel}&quot; hinzufügen
          </Typography>
        </MenuItem>
      ) : null}
    </Paper>
  );
}

export type SearchInputQuery<
  TResult extends { label: string; value: string }[],
  TError,
  TExtraInput extends Record<string, unknown>
> = (
  props:
    | ({
        name: string;
      } & TExtraInput)
    | SkipToken,
  options?: {
    placeholderData: typeof keepPreviousData;
  }
) => UseTRPCQueryResult<TResult, TError>;

export function useSearchSelectTrpcQuery<
  TResult extends SearchSelectOption[],
  TError,
  TExtraInput extends Record<string, unknown>
>(
  queryHook: SearchInputQuery<TResult, TError, TExtraInput>,
  extraInput: TExtraInput
) {
  const [name, setName] = useState("");

  const query = queryHook(
    { name, ...extraInput } as { name: string } & TExtraInput,
    { placeholderData: keepPreviousData }
  );

  const getOptions = useCallback(
    async (searchValue: string): Promise<SearchSelectOption[]> => {
      setName(searchValue);
      const { data } = await query.refetch();
      return data ?? [];
    },
    [query]
  );

  return getOptions;
}

export default function SearchSelect({
  label,
  getOptions,
  value,
  onChange,
  addOption,
  textFieldProps,
  disabled,
  container,
  regex,
}: SearchSelectProps) {
  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const [inputText, setInputText] = useState("");
  const searchValue = useDebouncedValue(inputText, 500);
  const displayAddOption = useMemo(() => {
    if (!addOption) return false;
    if (isLoading || searchValue != inputText) {
      return false;
    }
    if (options.find((val) => val.label == searchValue)) return false;
    if (regex && !regex.test(inputText)) return false;
    return true;
  }, [addOption, isLoading, searchValue, inputText, options, regex]);

  const loadOptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getOptions(searchValue);
      setOptions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [searchValue, getOptions]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    if (hasLoaded && !isLoading && value !== null) {
      const exists = options.some((opt) => opt.value === value);
      if (!exists) {
        onChange(null);
      }
    }
  }, [hasLoaded, isLoading, options, value, onChange]);

  const addOptionClicked = useCallback(async () => {
    if (!addOption) return console.error("Add option became undefined");
    const res = await addOption(searchValue);
    if (res) {
      onChange(res);
      loadOptions();
    }
  }, [searchValue, addOption, onChange, loadOptions]);

  const OptionsSlot = useCallback(
    (paperProps: PaperProps) => {
      return (
        <Options
          {...paperProps}
          onAddClicked={addOptionClicked}
          addOptionLabel={
            displayAddOption && searchValue !== "" ? searchValue : undefined
          }
        ></Options>
      );
    },
    [displayAddOption, searchValue, addOptionClicked]
  );

  return (
    <Autocomplete
      slotProps={{ popper: { container } }}
      disabled={disabled}
      inputValue={inputText}
      onInputChange={(_, newInputValue) => {
        setInputText(newInputValue);
      }}
      options={options}
      renderInput={(params) => (
        <TextField
          {...textFieldProps}
          {...params}
          disabled={disabled}
          label={label}
          placeholder="eintippen um zu suchen..."
        />
      )}
      slots={{
        paper: OptionsSlot,
      }}
      getOptionLabel={(opt) => opt.label}
      value={options.find((opt) => opt.value === value) ?? null}
      onChange={(_, option) => {
        onChange(option?.value ?? null);
      }}
    />
  );
}
