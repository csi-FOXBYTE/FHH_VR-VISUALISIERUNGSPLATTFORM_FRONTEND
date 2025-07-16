import { Box } from "@mui/material";
import * as Cesium from "cesium";
import { useLayoutEffect, useRef } from "react";
import { useCesium } from "resium";

function getNiceDistance(x: number) {
  const exp = Math.floor(Math.log10(x));
  const base = x / Math.pow(10, exp);
  let niceBase;
  if (base < 1.5) niceBase = 1;
  else if (base < 3) niceBase = 2;
  else if (base < 7.5) niceBase = 5;
  else niceBase = 10;
  return niceBase * Math.pow(10, exp);
}

export function ScaleBar() {
  const { viewer } = useCesium();

  const labelRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!viewer || !labelRef.current || !scaleRef.current) return;

    const handler = () => {
      if (!viewer || !labelRef.current || !scaleRef.current) return;
      const basePx = 50;

      const canvas = viewer.scene.canvas;
      const centerY = canvas.clientHeight / 2;
      const leftScreen = new Cesium.Cartesian2(
        (canvas.clientWidth - basePx) / 2,
        centerY
      );
      const rightScreen = new Cesium.Cartesian2(
        (canvas.clientWidth + basePx) / 2,
        centerY
      );

      // Raycast to the ellipsoid
      const leftCartesian = viewer.camera.pickEllipsoid(
        leftScreen,
        viewer.scene.globe.ellipsoid
      );
      const rightCartesian = viewer.camera.pickEllipsoid(
        rightScreen,
        viewer.scene.globe.ellipsoid
      );

      if (!leftCartesian || !rightCartesian) {
        // camera may be looking off‐world
        return;
      }

      const leftCarto = Cesium.Cartographic.fromCartesian(leftCartesian);
      const rightCarto = Cesium.Cartographic.fromCartesian(rightCartesian);

      // Compute surface distance on the ellipsoid
      const geodesic = new Cesium.EllipsoidGeodesic(leftCarto, rightCarto);
      const meters = geodesic.surfaceDistance;

      // Round to a “nice” value (e.g., 1, 2, 5 × 10ⁿ)
      const niceMeters = getNiceDistance(meters);

      scaleRef.current.style.width = `${basePx * (niceMeters / meters)}px`;

      labelRef.current.textContent =
        niceMeters >= 1000
          ? `${(niceMeters / 1000).toFixed(1)} km`
          : `${Math.round(niceMeters)} m`;
    };

    viewer.scene.postRender.addEventListener(handler);

    return () => {
      viewer.scene.postRender.removeEventListener(handler);
    };
  }, [viewer]);

  return (
    <Box
      sx={(theme) => ({
        position: "absolute",
        background: "white",
        bottom: 16,
        left: 64,
        width: 100,
        padding: 1,
        boxShadow: theme.shadows[4],
        color: "black",
      })}
    >
      <div ref={labelRef} />
      <Box
        sx={{
          height: 2,
          marginTop: 1,
          background: "black",
          position: "relative",
          "&:after": {
            display: "block",
            content: '""',
            height: 8,
            width: 2,
            left: 0,
            bottom: 0,
            position: "absolute",
            backgroundColor: "black",
          },
          "&:before": {
            display: "block",
            content: '""',
            height: 8,
            width: 2,
            right: 0,
            bottom: 0,
            position: "absolute",
            backgroundColor: "black",
          },
        }}
        ref={scaleRef}
      />
    </Box>
  );
}
