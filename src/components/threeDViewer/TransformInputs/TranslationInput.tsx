import {
  Autocomplete,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import proj4 from "proj4";
import proj4List from "proj4-list";
import { useEffect, useMemo, useRef, useState } from "react";

const epsgValues = Object.values(proj4List)
  .map(([epsg, proj4]) => ({
    value: proj4,
    label: epsg,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const initialEpsg = epsgValues.find((epsg) => epsg.label === "EPSG:25832");

const srcSRS = "+proj=geocent +datum=WGS84 +units=m +no_defs +type=crs";

// TODO does not work correctly yet!
export default function TranslationInput({
  value,
  readOnly = false,
  onImmediateChange,
  label,
  disabled,
}: {
  value?: { x: number; y: number; z: number };
  onChange?: (value: { x: number; y: number; z: number }) => void;
  onImmediateChange?: (value: { x: number; y: number; z: number }) => void;
  label?: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  const [selectedEpsg, setSelectedEpsg] = useState<{
    value: string;
    label: string;
  }>(initialEpsg!);

  const targetSRS = selectedEpsg.value;

  const transformer = useMemo(() => {
    return proj4(srcSRS, targetSRS);
  }, [targetSRS]);

  const xRef = useRef<HTMLInputElement>(null);
  const yRef = useRef<HTMLInputElement>(null);
  const zRef = useRef<HTMLInputElement>(null);

  const [prevTransformedValue, setPrevTransformedValue] = useState<{
    x: string;
    y: string;
    z: string;
  }>({ x: "1", y: "1", z: "1" });
  const [transformedValue, setTransformedValue] = useState<{
    x: string;
    y: string;
    z: string;
  }>({
    x: "",
    y: "",
    z: "",
  });

  useEffect(() => {
    if (!value) return;

    const [x, y, z] = transformer.forward([value.x, value.y, value.z]);

    setPrevTransformedValue({
      x: x.toString(),
      y: y.toString(),
      z: z.toString(),
    });
    setTransformedValue({ x: x.toString(), y: y.toString(), z: z.toString() });
  }, [value, transformer]);

  useEffect(() => {
    if (
      prevTransformedValue.x === transformedValue.x &&
      prevTransformedValue.y === transformedValue.y &&
      prevTransformedValue.z === transformedValue.z
    )
      return;

    const x = parseFloat(transformedValue.x);
    const y = parseFloat(transformedValue.y);
    const z = parseFloat(transformedValue.z);

    if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) return;

    const [xNew, yNew, zNew] = transformer.inverse([x, y, z]);

    const newValue = { x: xNew, y: yNew, z: zNew };

    onImmediateChange?.(newValue);
  }, [
    onImmediateChange,
    prevTransformedValue.x,
    prevTransformedValue.y,
    prevTransformedValue.z,
    transformedValue,
    transformer,
  ]);

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
        onChange={(_, newValue) => setSelectedEpsg(newValue)}
        options={epsgValues}
      />
      <TextField
        type="number"
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">X</InputAdornment>,
            endAdornment: <InputAdornment position="end"> m</InputAdornment>,
          },
        }}
        inputRef={xRef}
        variant="outlined"
        onChange={(event) =>
          setTransformedValue((value) => ({
            ...value,
            x: event.target?.value,
          }))
        }
        value={transformedValue?.x ?? ""}
        disabled={readOnly || disabled}
      />
      <TextField
        type="number"
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">Y</InputAdornment>,
            endAdornment: <InputAdornment position="end"> m</InputAdornment>,
          },
        }}
        inputRef={yRef}
        variant="outlined"
        onChange={(event) =>
          setTransformedValue((value) => ({
            ...value,
            y: event.target?.value,
          }))
        }
        value={transformedValue?.y ?? ""}
        disabled={readOnly || disabled}
      />
      <TextField
        type="number"
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">Z</InputAdornment>,
            endAdornment: <InputAdornment position="end"> m</InputAdornment>,
          },
        }}
        inputRef={zRef}
        variant="outlined"
        onChange={(event) =>
          setTransformedValue((value) => ({
            ...value,
            z: event.target?.value,
          }))
        }
        value={transformedValue?.z ?? ""}
        disabled={readOnly || disabled}
      />
    </Grid>
  );
}
