import {
  Autocomplete,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import proj4 from "proj4";
import proj4List from "proj4-list";
import { useEffect, useState } from "react";

const epsgValues = Object.values(proj4List)
  .map(([epsg, proj4]) => ({
    value: proj4,
    label: epsg,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const targetSRS = "+proj=geocent +datum=WGS84 +units=m +no_defs +type=crs";

export default function TranslationInput({
  uiValue,
  uiEpsg,
  readOnly = false,
  label,
  onChange,
  disabled,
  required,
}: {
  uiEpsg: string;
  uiValue: { x: string; y: string; z: string };
  onChange: (v: {
    value?: { x: number; y: number; z: number };
    uiValue: { x: string; y: string; z: string };
    uiEpsg: string;
  }) => void;
  label?: string;
  readOnly?: boolean;
  required?: boolean;
  disabled?: boolean;
}) {
  const [selectedEpsg, setSelectedEpsg] = useState<{
    value: string;
    label: string;
  }>(epsgValues.find((epsg) => epsg.label === uiEpsg)!);

  useEffect(() => {
    setSelectedEpsg(epsgValues.find((epsg) => epsg.label === uiEpsg)!);
  }, [uiEpsg]);

  const [internalUiValue, setInternalUiValue] = useState(uiValue);

  useEffect(() => {
    setInternalUiValue(uiValue);
  }, [uiValue.x, uiValue.y, uiValue.z]);

  const handleChange = (
    epsg: {
      value: string;
      label: string;
    },
    uiValue: { x: string; y: string; z: string }
  ) => {
    setInternalUiValue(uiValue);

    const transformedValue = { x: Number.NaN, y: Number.NaN, z: Number.NaN };

    const transformer = proj4(epsg.value, targetSRS);

    try {
      const [x, y, z] = transformer.forward([
        parseFloat(uiValue.x),
        parseFloat(uiValue.y),
        parseFloat(uiValue.z),
      ]);

      transformedValue.x = x;
      transformedValue.y = y;
      transformedValue.z = z;
    } catch {}

    if (
      Number.isNaN(transformedValue.x) ||
      Number.isNaN(transformedValue.y) ||
      Number.isNaN(transformedValue.z)
    )
      return onChange({ uiValue, uiEpsg: epsg.label });

    onChange({
      value: transformedValue,
      uiValue,
      uiEpsg: epsg.label,
    });
  };

  const handleEpsgChange = (epsg: { label: string; value: string }) => {
    const transformer = proj4(selectedEpsg.value, epsg.value);

    setSelectedEpsg(epsg);

    const transformedValue = { x: Number.NaN, y: Number.NaN, z: Number.NaN };

    try {
      const [x, y, z] = transformer.forward([
        parseFloat(uiValue.x),
        parseFloat(uiValue.y),
        parseFloat(uiValue.z),
      ]);

      transformedValue.x = x;
      transformedValue.y = y;
      transformedValue.z = z;
    } catch {}

    handleChange(epsg, {
      x: transformedValue.x.toFixed(10),
      y: transformedValue.y.toFixed(10),
      z: transformedValue.z.toFixed(10),
    });
  };

  return (
    <Grid container flexDirection="column" spacing={2}>
      {label ? <Typography>{label}</Typography> : null}
      <Autocomplete
        disablePortal
        renderInput={(params) => <TextField {...params} label="EPSG" />}
        value={selectedEpsg}
        disableClearable
        disabled={disabled}
        size="small"
        onChange={(_, newValue) => handleEpsgChange(newValue)}
        options={epsgValues}
      />
      <TextField
        type="number"
        required={required}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">X</InputAdornment>,
            endAdornment: <InputAdornment position="end"> m</InputAdornment>,
          },
        }}
        variant="outlined"
        onChange={(event) =>
          handleChange(selectedEpsg, {
            ...internalUiValue,
            x: event.target?.value,
          })
        }
        value={internalUiValue.x ?? ""}
        disabled={readOnly || disabled}
      />
      <TextField
        type="number"
        required={required}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">Y</InputAdornment>,
            endAdornment: <InputAdornment position="end"> m</InputAdornment>,
          },
        }}
        variant="outlined"
        onChange={(event) =>
          handleChange(selectedEpsg, {
            ...internalUiValue,
            y: event.target?.value,
          })
        }
        value={internalUiValue.y ?? ""}
        disabled={readOnly || disabled}
      />
      <TextField
        type="number"
        required={required}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">Z</InputAdornment>,
            endAdornment: <InputAdornment position="end"> m</InputAdornment>,
          },
        }}
        variant="outlined"
        onChange={(event) =>
          handleChange(selectedEpsg, {
            ...internalUiValue,
            z: event.target?.value,
          })
        }
        value={internalUiValue.z ?? ""}
        disabled={readOnly || disabled}
      />
    </Grid>
  );
}
