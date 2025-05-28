import {
  AddAPhoto,
  AddLocationAlt,
  ContentCut,
  Crop169,
  Expand,
  OpenWith,
  ThreeSixty,
  Tonality
} from "@mui/icons-material";
import { Divider, Grid2, IconButton, Tooltip, useTheme } from "@mui/material";
import { useViewerStore } from "./ViewerProvider";

export default function Toolbar() {
  const theme = useTheme();

  const createClippingPolygon = useViewerStore(
    (state) => state.clippingPolygons.create
  );

  const createStartingPoint = useViewerStore(
    (state) => state.startingPoints.create
  );
  const createVisualAxis = useViewerStore((state) => state.visualAxes.create);

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

  return (
    <div
      style={{
        top: "50%",
        transform: "translateY(-50%)",
        left: 0,
        position: "absolute",
        zIndex: 100,
        background: theme.palette.background.paper,
        boxShadow: theme.shadows[2],
        borderRadius: "0 8px 8px 0px",
      }}
    >
      <Grid2 container flexDirection="column">
        <Tooltip arrow placement="right" title="Toggle camera safe zone">
          <IconButton
            color={safeCameraZoneVisible ? "primary" : undefined}
            onClick={toggleSafeCameraZoneVisibility}
          >
            <Crop169 />
          </IconButton>
        </Tooltip>
        <Tooltip arrow placement="right" title="Toggle shadows">
          <IconButton
            color={shadowVisible ? "primary" : undefined}
            onClick={toggleShadowVisibility}
          >
            <Tonality />
          </IconButton>
        </Tooltip>
        <Divider />
        <Tooltip arrow placement="right" title="Translate">
          <IconButton>
            <OpenWith />
          </IconButton>
        </Tooltip>
        <Tooltip arrow placement="right" title="Rotate">
          <IconButton>
            <ThreeSixty />
          </IconButton>
        </Tooltip>
        <Tooltip arrow placement="right" title="Scale">
          <IconButton>
            <Expand />
          </IconButton>
        </Tooltip>
        <Divider />
        <Tooltip arrow placement="right" title="Create clipping polygon">
          <IconButton onClick={createClippingPolygon}>
            <ContentCut />
          </IconButton>
        </Tooltip>
        <Tooltip arrow placement="right" title="Create starting point">
          <IconButton onClick={createStartingPoint}>
            <AddLocationAlt />
          </IconButton>
        </Tooltip>
        <Tooltip arrow placement="right" title="Create visual axis">
          <IconButton onClick={createVisualAxis}>
            <AddAPhoto />
          </IconButton>
        </Tooltip>
      </Grid2>
    </div>
  );
}
