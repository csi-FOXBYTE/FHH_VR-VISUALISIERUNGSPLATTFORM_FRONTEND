"use client";

import { CircularProgress, Grid2 } from "@mui/material";
import "cesium/Build/Cesium/Widgets/widgets.css";
import dynamic from "next/dynamic";
import AppBar from "./AppBar";
import RightDrawer from "./RightDrawer";
import Toolbar from "./Toolbar";

const ResiumViewer = dynamic(async () => (await import("./Viewer")).default, {
  ssr: false,
  loading: () => (
    <Grid2
      width="100%"
      height="100%"
      flexDirection="column"
      alignItems="center"
      style={{ background: "white" }}
      justifyContent="center"
      alignContent="center"
      justifyItems="center"
    >
      <CircularProgress />
      <div>Loading Viewer component... </div>
    </Grid2>
  ),
});

export function ThreeDViewer() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <AppBar />
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          background: "rgba(0, 0, 0, 0.75)",
        }}
      >
        <Toolbar />
        <Grid2 container height="100%">
          <Grid2 flex={1} position="relative" height="100%">
            <ResiumViewer />
          </Grid2>
          <RightDrawer />
        </Grid2>
      </div>
    </div>
  );
}
