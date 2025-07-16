"use client";

import {
  Add,
  Adjust,
  Delete,
  ExpandLess,
  ExpandMore,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ButtonGroup,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import * as Cesium from "cesium";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import {
  SelectedObject,
  useSelectedObject,
  useViewerStore,
} from "./ViewerProvider";

const StyledCount = styled("div")`
  display: inline-block;
  padding: 0px 8px;
  color: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.25);
`;

export default function SceneGraph() {
  const clippingPolygons = useViewerStore(
    (state) => state.clippingPolygons.value
  );
  const createClippingPolygon = useViewerStore(
    (state) => state.clippingPolygons.create
  );
  const deleteClippingPolygon = useViewerStore(
    (state) => state.clippingPolygons.delete
  );

  const projectObjects = useViewerStore((state) => state.projectObjects.value);
  const updateProjectObject = useViewerStore(
    (state) => state.projectObjects.update
  );
  const toggleVisibilityProjectObject = useViewerStore(
    (state) => state.projectObjects.toggleVisibility
  );

  const createStartingPoint = useViewerStore(
    (state) => state.startingPoints.create
  );
  const startingPoints = useViewerStore((state) => state.startingPoints);

  const pickPoint = useViewerStore((state) => state.tools.pickPoint);

  const visualAxes = useViewerStore((state) => state.visualAxes);

  const selectedObject = useSelectedObject();
  const setSelectedObject = useViewerStore((state) => state.setSelectedObject);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const toggleImport = useViewerStore(
    (state) => state.projectObjects.toggleImport
  );

  const [selectedTab, setSelectedTab] = useState<"" | SelectedObject["type"]>(
    ""
  );

  useEffect(() => {
    setSelectedTab(selectedObject?.type ?? "");
  }, [selectedObject?.type]);

  return (
    <Grid container spacing={2} flexDirection="column" padding={2}>
      <Accordion
        expanded={selectedTab === "CLIPPING_POLYGON"}
        onChange={() => setSelectedTab("CLIPPING_POLYGON")}
        square
        style={{ width: "100%" }}
        disableGutters
      >
        <AccordionSummary>
          <Grid
            container
            justifyContent="space-between"
            width="100%"
            alignItems="center"
          >
            <IconButton>
              {selectedTab === "CLIPPING_POLYGON" ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )}
            </IconButton>
            <Typography>
              Clipping Polygons&nbsp;
              <StyledCount style={{ backgroundColor: "#fef2f2" }}>
                [{clippingPolygons.length}]
              </StyledCount>
            </Typography>
            <Box flex="1" />
            <ButtonGroup size="small">
              <IconButton
                size="small"
                onClick={async (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  await createClippingPolygon();
                }}
              >
                <Add />
              </IconButton>
            </ButtonGroup>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
          <List disablePadding>
            {clippingPolygons.map((clippingPolygon) => (
              <ListItem
                sx={(theme) => ({
                  background:
                    selectedObject?.id === clippingPolygon.id
                      ? theme.palette.secondary.main
                      : undefined,
                  color:
                    selectedObject?.id === clippingPolygon.id
                      ? theme.palette.secondary.contrastText
                      : undefined,
                })}
                key={clippingPolygon.id}
                onClick={() => setSelectedObject(clippingPolygon)}
              >
                <ListItemText>{clippingPolygon.name}</ListItemText>
                <Tooltip title="Toggle clipping polygon visibility">
                  <ListItemIcon>
                    {clippingPolygon.visible ? (
                      <Visibility />
                    ) : (
                      <VisibilityOff />
                    )}
                  </ListItemIcon>
                </Tooltip>
                <Tooltip title="Delete clipping polygon">
                  <ListItemIcon
                    onClick={() => deleteClippingPolygon(clippingPolygon.id)}
                  >
                    <Delete />
                  </ListItemIcon>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
      <Accordion
        style={{ width: "100%" }}
        disableGutters
        expanded={selectedTab === "PROJECT_OBJECT"}
        onChange={() => setSelectedTab("PROJECT_OBJECT")}
        square
      >
        <AccordionSummary>
          <Grid
            container
            justifyContent="space-between"
            width="100%"
            alignItems="center"
          >
            <IconButton>
              {selectedTab === "PROJECT_OBJECT" ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )}
            </IconButton>
            <Typography>
              Project objects&nbsp;
              <StyledCount style={{ backgroundColor: "#eff6ff" }}>
                [{projectObjects.length}]
              </StyledCount>
            </Typography>
            <Box flex="1" />
            <ButtonGroup size="small">
              <IconButton size="small" onClick={toggleImport}>
                <Add />
              </IconButton>
            </ButtonGroup>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
          <List>
            {projectObjects.map((projectObject) => (
              <ListItem
                sx={(theme) => ({
                  background:
                    selectedObject?.id === projectObject.id
                      ? theme.palette.secondary.main
                      : undefined,
                  color:
                    selectedObject?.id === projectObject.id
                      ? theme.palette.secondary.contrastText
                      : undefined,
                })}
                key={projectObject.id}
                onClick={() => setSelectedObject(projectObject)}
              >
                <ListItemText
                  style={{
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {projectObject.name}
                </ListItemText>
                <ListItemButton>
                  <ListItemIcon
                    style={{ color: "inherit" }}
                    onClick={() =>
                      toggleVisibilityProjectObject(projectObject.id)
                    }
                  >
                    {projectObject.visible ? <Visibility /> : <VisibilityOff />}
                  </ListItemIcon>
                </ListItemButton>
                <ListItemButton
                  onClick={async () => {
                    const id = crypto.randomUUID();

                    enqueueSnackbar({
                      variant: "info",
                      message:
                        "Picking a point. To abort press either right click or escape.",
                      key: id,
                      autoHideDuration: null,
                    });

                    document.body.style.cursor = "crosshair";

                    try {
                      const pickedPoint = await pickPoint();

                      const modelMatrix =
                        Cesium.Transforms.eastNorthUpToFixedFrame(
                          new Cesium.Cartesian3(
                            pickedPoint.x,
                            pickedPoint.y,
                            pickedPoint.z
                          )
                        );

                      const translation = Cesium.Matrix4.getTranslation(
                        modelMatrix,
                        new Cesium.Cartesian3()
                      );
                      const scale = Cesium.Matrix4.getScale(
                        modelMatrix,
                        new Cesium.Cartesian3()
                      );
                      const rotation = Cesium.Quaternion.fromRotationMatrix(
                        Cesium.Matrix4.getRotation(
                          modelMatrix,
                          new Cesium.Matrix3()
                        ),
                        new Cesium.Quaternion()
                      );

                      updateProjectObject({
                        translation,
                        scale,
                        rotation,
                        id: projectObject.id,
                      });
                    } catch (e) {
                      console.error(e);
                    }

                    document.body.style.cursor = "auto";

                    closeSnackbar(id);
                  }}
                >
                  Place
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
      <Accordion
        style={{ width: "100%" }}
        expanded={selectedTab === "STARTING_POINT"}
        onChange={() => setSelectedTab("STARTING_POINT")}
        square
        disableGutters
      >
        <AccordionSummary>
          <Grid
            container
            justifyContent="space-between"
            width="100%"
            alignItems="center"
          >
            <IconButton>
              {selectedTab === "STARTING_POINT" ? (
                <ExpandLess />
              ) : (
                <ExpandMore />
              )}
            </IconButton>
            <Typography>
              Starting points&nbsp;
              <StyledCount style={{ backgroundColor: "#f0fdf4" }}>
                [{startingPoints.value.length}]
              </StyledCount>
            </Typography>
            <Box flex="1" />
            <ButtonGroup size="small">
              <Tooltip title="Add starting point">
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    createStartingPoint();
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </ButtonGroup>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
          <List>
            {startingPoints.value.map((startingPoint) => (
              <ListItem
                sx={(theme) => ({
                  background:
                    selectedObject?.id === startingPoint.id
                      ? theme.palette.secondary.main
                      : undefined,
                  color:
                    selectedObject?.id === startingPoint.id
                      ? theme.palette.secondary.contrastText
                      : undefined,
                })}
                key={startingPoint.id}
                onClick={() => setSelectedObject(startingPoint)}
              >
                <ListItemText>{startingPoint.name}</ListItemText>
                <div style={{ flex: 1 }} />
                <ListItemIcon>
                  <ButtonGroup>
                    <Tooltip title="Delete starting point">
                      <IconButton
                        onClick={() => startingPoints.delete(startingPoint.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Fly to starting point">
                      <IconButton
                        onClick={() =>
                          startingPoints.helpers.flyTo(startingPoint)
                        }
                      >
                        <Adjust />
                      </IconButton>
                    </Tooltip>
                  </ButtonGroup>
                </ListItemIcon>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
      <Accordion
        style={{ width: "100%" }}
        expanded={selectedTab === "VISUAL_AXIS"}
        onChange={() => setSelectedTab("VISUAL_AXIS")}
        square
        disableGutters
      >
        <AccordionSummary>
          <Grid
            container
            justifyContent="space-between"
            width="100%"
            alignItems="center"
          >
            <IconButton>
              {selectedTab === "VISUAL_AXIS" ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
            <Typography>
              Visual axes&nbsp;
              <StyledCount style={{ backgroundColor: "#faf5ff" }}>
                [{visualAxes.value.length}]
              </StyledCount>
            </Typography>
            <Box flex="1" />
            <ButtonGroup size="small">
              <IconButton size="small" onClick={visualAxes.create}>
                <Add />
              </IconButton>
            </ButtonGroup>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
          <List>
            {visualAxes.value.map((visualAxis) => (
              <ListItem
                key={visualAxis.id}
                onClick={() => setSelectedObject(visualAxis)}
              >
                <ListItemText>{visualAxis.name}</ListItemText>
                <div style={{ flex: 1 }} />
                <ListItemIcon>
                  <ButtonGroup>
                    <Tooltip title="Delete visual axis">
                      <IconButton
                        onClick={() => visualAxes.delete(visualAxis.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Fly to visual axis">
                      <IconButton
                        onClick={() => visualAxes.helpers.flyTo(visualAxis)}
                      >
                        <Adjust />
                      </IconButton>
                    </Tooltip>
                  </ButtonGroup>
                </ListItemIcon>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}
