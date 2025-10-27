import { Grid, InputAdornment, TextField } from "@mui/material";
import { useEffect, useState } from "react";

export default function ScaleInput({
  onChange,
  disabled,
  uiValue,
}: {
  uiValue: { x: string; y: string; z: string };
  onChange: (v: {
    value?: { x: number; y: number; z: number };
    uiValue: { x: string; y: string; z: string };
  }) => void;
  disabled?: boolean;
}) {
  const [internalUiScale, setInternalUiScale] = useState(uiValue);

  useEffect(() => {
    setInternalUiScale(uiValue);
  }, [uiValue.x, uiValue.y, uiValue.z]);

  const handleChange = (uiValue: { x: string; y: string; z: string }) => {
    let x = parseFloat(uiValue.x);
    let y = parseFloat(uiValue.y);
    let z = parseFloat(uiValue.z);

    setInternalUiScale(uiValue);

    if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z))
      return onChange({ uiValue: { ...uiValue } });

    if (x === 0 || y === 0 || z === 0) return;

    x = x === 0 ? 0.00001 : x;
    y = y === 0 ? 0.00001 : y;
    z = z === 0 ? 0.00001 : z;

    onChange({ value: { x, y, z }, uiValue: { ...uiValue } });
  };

  return (
    <Grid container flexDirection="column" spacing={2}>
      <TextField
        disabled={disabled}
        variant="standard"
        type="number"
        value={internalUiScale.x}
        onChange={(event) =>
          handleChange({
            ...internalUiScale,
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
        value={internalUiScale.y}
        onChange={(event) =>
          handleChange({
            ...internalUiScale,
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
        value={internalUiScale.z}
        onChange={(event) =>
          handleChange({
            ...internalUiScale,
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
