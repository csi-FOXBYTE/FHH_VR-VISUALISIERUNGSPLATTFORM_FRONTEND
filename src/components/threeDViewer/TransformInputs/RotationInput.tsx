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
  value,
  origin,
  onImmediateChange,
  disabled
}: {
  value?: { x: number; y: number; z: number; w: number };
  origin: { x: number; y: number; z: number };
  onImmediateChange?: (value: {
    x: number;
    y: number;
    z: number;
    w: number;
  }) => void;
  disabled?: boolean;
}) {
  const [prevHprText, setPrevHprText] = useState({
    heading: "0",
    pitch: "0",
    roll: "0",
  });
  const [hprText, setHprText] = useState({
    heading: "0",
    pitch: "0",
    roll: "0",
  });

  // 1. Precompute the local<->ECEF frame quaternions
  const { earthToLocal, localToEarth } = useMemo(() => {
    const m = Transforms.eastNorthUpToFixedFrame(
      new Cartesian3(origin.x, origin.y, origin.z)
    );
    const R = Matrix4.getRotation(m, new Matrix3());
    const localToEarth = Quaternion.fromRotationMatrix(R, new Quaternion());
    const earthToLocal = Quaternion.inverse(localToEarth, new Quaternion());
    return { earthToLocal, localToEarth };
  }, [origin.x, origin.y, origin.z]);

  // 2. Whenever the prop "value" (an ECEF quaternion) changes, convert it into local HPR
  useEffect(() => {
    if (!value) return;

    const qE = new Quaternion(value.x, value.y, value.z, value.w);
    // Correct: Q_local = Q_E→L * Q_ECEF
    const qLocal = Quaternion.multiply(earthToLocal, qE, new Quaternion());
    const hpr = HeadingPitchRoll.fromQuaternion(qLocal);

    let heading = ((hpr.heading * 180) / Math.PI).toFixed(5);
    let pitch = ((hpr.pitch * 180) / Math.PI).toFixed(5);
    let roll = ((hpr.roll * 180) / Math.PI).toFixed(5);

    if (heading === "-0.00000") heading = "0.00000";
    if (pitch === "-0.00000") pitch = "0.00000";
    if (roll === "-0.00000") roll = "0.00000";

    setHprText({
      heading,
      pitch,
      roll,
    });
    setPrevHprText({
      heading,
      pitch,
      roll,
    });
  }, [value, earthToLocal]);

  // 3. When the user edits H/P/R, convert back to an ECEF quaternion
  useEffect(() => {
    if (
      hprText.heading === prevHprText.heading &&
      hprText.pitch === prevHprText.pitch &&
      hprText.roll === prevHprText.roll
    )
      return;

    const h = parseFloat(hprText.heading);
    const p = parseFloat(hprText.pitch);
    const r = parseFloat(hprText.roll);

    if ([h, p, r].some(Number.isNaN)) return;

    // Local quaternion from HPR
    const hpr = new HeadingPitchRoll(
      (h * Math.PI) / 180,
      (p * Math.PI) / 180,
      (r * Math.PI) / 180
    );
    const qLocal = Quaternion.fromHeadingPitchRoll(hpr, new Quaternion());

    // Correct: Q_ECEF = Q_L→E * Q_local
    const qE = Quaternion.multiply(localToEarth, qLocal, new Quaternion());

    onImmediateChange?.({
      x: qE.x,
      y: qE.y,
      z: qE.z,
      w: qE.w,
    });
  }, [
    hprText.heading,
    hprText.pitch,
    hprText.roll,
    localToEarth,
    onImmediateChange,
    prevHprText.heading,
    prevHprText.roll,
    prevHprText.pitch
  ]);

  return (
    <Grid container flexDirection="column" spacing={2}>
      {(["heading", "pitch", "roll"] as const).map((field) => (
        <TextField
          disabled={disabled}
          key={field}
          variant="standard"
          type="number"
          value={hprText[field]}
          onChange={(e) => setHprText({ ...hprText, [field]: e.target.value })}
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
