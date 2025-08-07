import { Grid, InputAdornment, TextField } from "@mui/material";
import { useEffect, useState } from "react";

export default function ScaleInput({
  value,
  onImmediateChange,
  disabled,
}: {
  value?: { x: number; y: number; z: number };
  onImmediateChange?: (value: { x: number; y: number; z: number }) => void;
  disabled?: boolean;
}) {
  const [prevTransformedValue, setPrevTransformedValue] = useState<{
    x: string;
    y: string;
    z: string;
  }>({ x: "1", y: "1", z: "1" });
  const [transformedValue, setTransformedValue] = useState<{
    x: string;
    y: string;
    z: string;
  }>({ x: "1", y: "1", z: "1" });

  useEffect(() => {
    if (!value) return;

    const x = value.x.toFixed(5);
    const y = value.y.toFixed(5);
    const z = value.z.toFixed(5);

    setPrevTransformedValue({
      x,
      y,
      z,
    });
    setTransformedValue({
      x,
      y,
      z,
    });
  }, [value]);

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

    if (x === 0 || y === 0 || z === 0) return;

    if (x < 0) {
      return setTransformedValue((value) => ({ ...value, x: "0.00001" }));
    }
    if (y < 0) {
      return setTransformedValue((value) => ({ ...value, y: "0.00001" }));
    }
    if (z < 0) {
      return setTransformedValue((value) => ({ ...value, z: "0.00001" }));
    }

    onImmediateChange?.({ x, y, z });
  }, [
    onImmediateChange,
    prevTransformedValue.x,
    prevTransformedValue.y,
    prevTransformedValue.z,
    transformedValue.x,
    transformedValue.y,
    transformedValue.z,
  ]);

  return (
    <Grid container flexDirection="column" spacing={2}>
      <TextField
        disabled={disabled}
        variant="standard"
        type="number"
        value={transformedValue.x}
        onChange={(event) =>
          setTransformedValue({
            ...transformedValue,
            x: event.target.value,
          })
        }
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">X</InputAdornment>,
          },
        }}
      />
      <TextField
        disabled={disabled}
        variant="standard"
        type="number"
        value={transformedValue.y}
        onChange={(event) =>
          setTransformedValue({
            ...transformedValue,
            y: event.target.value,
          })
        }
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">Y</InputAdornment>,
          },
        }}
      />
      <TextField
        disabled={disabled}
        variant="standard"
        type="number"
        value={transformedValue.z}
        onChange={(event) =>
          setTransformedValue({
            ...transformedValue,
            z: event.target.value,
          })
        }
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">Z</InputAdornment>,
          },
        }}
      />
    </Grid>
  );
}
