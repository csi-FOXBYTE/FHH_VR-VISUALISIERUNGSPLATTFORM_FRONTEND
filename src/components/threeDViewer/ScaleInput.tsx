import { Grid2, InputAdornment, TextField } from "@mui/material";
import { useEffect, useState } from "react";

export default function ScaleInput({
  value,
  onImmediateChange,
}: {
  value?: { x: number; y: number; z: number };
  onImmediateChange?: (value: { x: number; y: number; z: number }) => void;
}) {
  const [transformedValue, setTransformedValue] = useState<{
    x: string;
    y: string;
    z: string;
  }>({ x: "1", y: "1", z: "1" });

  useEffect(() => {
    if (!value) return;

    setTransformedValue({
      x: value.x.toFixed(5),
      y: value.y.toFixed(5),
      z: value.z.toFixed(5),
    });
  }, [value]);

  useEffect(() => {
    const x = parseFloat(transformedValue.x);
    const y = parseFloat(transformedValue.y);
    const z = parseFloat(transformedValue.z);

    console.log({ x, y, z });

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
    transformedValue.x,
    transformedValue.y,
    transformedValue.z,
  ]);

  return (
    <Grid2 container flexDirection="column" spacing={2}>
      <TextField
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
    </Grid2>
  );
}
