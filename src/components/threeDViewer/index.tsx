"use client";

import { CircularProgress, Grid } from "@mui/material";
import "cesium/Build/Cesium/Widgets/widgets.css";
import dynamic from "next/dynamic";
import AppBar from "./AppBar";
import RightDrawer from "./RightDrawer";
import Toolbar from "./Toolbar";
import ImportProjectObjectDialog from "./ImportProjectObjectDialog";
import { PreventClosing } from "./PreventClosing";
import SavingBlocker from "./SavingBlocker";

const ResiumViewer = dynamic(async () => (await import("./Viewer")).default, {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <CircularProgress
        size={64}
        sx={{
          position: "absolute",
          top: "calc(50% - 32px)",
          left: "calc(50% - 32px)",
        }}
      />
    </div>
  ),
});

// @ts-ignore
if (typeof window !== "undefined") window.CESIUM_BASE_URL = "/cesium";

export function ThreeDViewer() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SavingBlocker />
      <PreventClosing />
      <AppBar />
      <ImportProjectObjectDialog />
      <Grid
        container
        flex={1}
        overflow="hidden"
        position="relative"
        sx={{ backgroundColor: "white" }}
      >
        <Toolbar />
        <Grid flex={1} container height="100%">
          <Grid flex={1} position="relative" height="100%">
            <ResiumViewer />
          </Grid>
          <RightDrawer />
        </Grid>
      </Grid>
    </div>
  );
}
