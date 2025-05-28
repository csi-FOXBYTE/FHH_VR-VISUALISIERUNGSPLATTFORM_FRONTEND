import { Autocomplete, Grid2, InputAdornment, TextField } from "@mui/material";
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

export default function TranslateInput({
  value,
  readOnly = false,
  onImmediateChange,
}: {
  value?: { x: number; y: number; z: number };
  onChange?: (value: { x: number; y: number; z: number }) => void;
  onImmediateChange?: (value: { x: number; y: number; z: number }) => void;
  readOnly?: boolean;
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

    setTransformedValue({ x: x.toString(), y: y.toString(), z: z.toString() });
  }, [value, transformer]);

  useEffect(() => {
    if (transformedValue === undefined) return;

    const x = parseFloat(transformedValue.x);
    const y = parseFloat(transformedValue.y);
    const z = parseFloat(transformedValue.z);

    if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) return;

    const [xNew, yNew, zNew] = transformer.inverse([x, y, z]);

    const newValue = { x: xNew, y: yNew, z: zNew };

    onImmediateChange?.(newValue);
  }, [onImmediateChange, transformedValue, transformer]);

  return (
    <Grid2
      container
      flexDirection="column"
      spacing={2}
    >
      <Autocomplete
        disablePortal
        renderInput={(params) => <TextField {...params} label="EPSG" />}
        value={selectedEpsg}
        disableClearable
        size="small"
        onChange={(_, newValue) => setSelectedEpsg(newValue)}
        options={epsgValues}
      />
      <TextField
        type="number"
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">X</InputAdornment>,
            endAdornment: <InputAdornment position="end"> m</InputAdornment>
          }
        }}
        inputRef={xRef}
        variant="standard"
        onChange={(event) =>
          setTransformedValue((value) => ({
            ...value,
            x: event.target?.value,
          }))
        }
        value={transformedValue?.x ?? ""}
        disabled={readOnly}
      />
      <TextField
        type="number"
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">Y</InputAdornment>,
            endAdornment: <InputAdornment position="end"> m</InputAdornment>
          }
        }}
        inputRef={yRef}
        variant="standard"
        onChange={(event) =>
          setTransformedValue((value) => ({
            ...value,
            y: event.target?.value,
          }))
        }
        value={transformedValue?.y ?? ""}
        disabled={readOnly}
      />
      <TextField
        type="number"
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">Z</InputAdornment>,
            endAdornment: <InputAdornment position="end"> m</InputAdornment>
          }
        }}
        inputRef={zRef}
        variant="standard"
        onChange={(event) =>
          setTransformedValue((value) => ({
            ...value,
            z: event.target?.value,
          }))
        }
        value={transformedValue?.z ?? ""}
        disabled={readOnly}
      />
    </Grid2>
  );
}
