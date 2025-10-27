import { Grid, InputAdornment, TextField } from "@mui/material";
import {
  Cartesian3,
  HeadingPitchRoll,
  Matrix3,
  Matrix4,
  Quaternion,
  Transforms,
} from "cesium";
import { useEffect, useMemo, useState } from "react";

export default function RotationInput({
  origin,
  onChange,
  uiValue,
  disabled,
}: {
  uiValue: { x: string; y: string; z: string };
  origin: { x: number; y: number; z: number };
  onChange: (v: {
    value?: { x: number; y: number; z: number; w: number };
    uiValue: { x: string; y: string; z: string };
  }) => void;
  disabled?: boolean;
}) {
  const [internalUiValue, setInternalUiValue] = useState(uiValue);

  useEffect(() => {
    setInternalUiValue(uiValue);
  }, [uiValue.x, uiValue.y, uiValue.z])

  // 1. Precompute the local<->ECEF frame quaternions
  const { localToEarth } = useMemo(() => {
    const m = Transforms.eastNorthUpToFixedFrame(
      new Cartesian3(origin.x, origin.y, origin.z)
    );
    const R = Matrix4.getRotation(m, new Matrix3());
    const localToEarth = Quaternion.fromRotationMatrix(R, new Quaternion());
    const earthToLocal = Quaternion.inverse(localToEarth, new Quaternion());
    return { earthToLocal, localToEarth };
  }, [origin.x, origin.y, origin.z]);

  const handleChange = (uiValue: { x: string; y: string; z: string }) => {
    setInternalUiValue(uiValue);

    const h = parseFloat(uiValue.x);
    const p = parseFloat(uiValue.y);
    const r = parseFloat(uiValue.z);

    if ([h, p, r].some(Number.isNaN)) return { uiValue: { ...uiValue } };

    // Local quaternion from HPR
    const hpr = new HeadingPitchRoll(
      (h * Math.PI) / 180,
      (p * Math.PI) / 180,
      (r * Math.PI) / 180
    );
    const qLocal = Quaternion.fromHeadingPitchRoll(hpr, new Quaternion());

    // Correct: Q_ECEF = Q_L→E * Q_local
    const qE = Quaternion.multiply(localToEarth, qLocal, new Quaternion());

    onChange({
      uiValue: { ...uiValue },
      value: {
        x: qE.x,
        y: qE.y,
        z: qE.z,
        w: qE.w,
      },
    });
  };

  return (
    <Grid container flexDirection="column" spacing={2}>
      {(["x", "y", "z"] as const).map((field) => (
        <TextField
          disabled={disabled}
          key={field}
          variant="standard"
          type="number"
          value={internalUiValue[field]}
          onChange={(e) =>
            handleChange({ ...internalUiValue, [field]: e.target.value })
          }
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">{field}</InputAdornment>
              ),
              endAdornment: <InputAdornment position="end">°</InputAdornment>,
            },
          }}
        />
      ))}
    </Grid>
  );
}
