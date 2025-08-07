import {
  AddLocationAlt,
  ContentCut,
  Crop169,
  Tonality,
} from "@mui/icons-material";
import { Divider, Grid, IconButton, Tooltip, useTheme } from "@mui/material";
import { useViewerStore } from "./ViewerProvider";
import { useTranslations } from "next-intl";
import useIsReadOnly from "./useIsReadOnly";

export default function Toolbar() {
  const theme = useTheme();

  const t = useTranslations();

  const createClippingPolygon = useViewerStore(
    (state) => state.clippingPolygons.create
  );

  const createStartingPoint = useViewerStore(
    (state) => state.startingPoints.create
  );

  const safeCameraZoneVisible = useViewerStore(
    (state) => state.tools.safeCameraZoneVisible
  );
  const toggleSafeCameraZoneVisibility = useViewerStore(
    (state) => state.tools.toggleSafeCameraZoneVisibility
  );

  const shadowVisible = useViewerStore((state) => state.tools.shadowVisible);
  const toggleShadowVisibility = useViewerStore(
    (state) => state.tools.toggleShadowVisibility
  );

  const isReadOnly = useIsReadOnly();

  return (
    <div
      style={{
        height: "100%",
        zIndex: 5,
        background: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
        padding: 4,
      }}
    >
      <Grid container flexDirection="column">
        <Tooltip
          arrow
          placement="right"
          title={t("editor.toggle-camera-safe-zone")}
        >
          <IconButton
            color={safeCameraZoneVisible ? "primary" : undefined}
            onClick={toggleSafeCameraZoneVisibility}
          >
            <Crop169 />
          </IconButton>
        </Tooltip>
        <Tooltip arrow placement="right" title={t("editor.toggle-shadows")}>
          <IconButton
            color={shadowVisible ? "primary" : undefined}
            onClick={toggleShadowVisibility}
          >
            <Tonality />
          </IconButton>
        </Tooltip>
        <Divider />
        <Tooltip
          arrow
          placement="right"
          title={t("editor.create-clipping-polygon")}
        >
          <IconButton disabled={isReadOnly} onClick={createClippingPolygon}>
            <ContentCut />
          </IconButton>
        </Tooltip>
        <Tooltip
          arrow
          placement="right"
          title={t("editor.create-starting-point")}
        >
          <IconButton disabled={isReadOnly} onClick={createStartingPoint}>
            <AddLocationAlt />
          </IconButton>
        </Tooltip>
      </Grid>
    </div>
  );
}
