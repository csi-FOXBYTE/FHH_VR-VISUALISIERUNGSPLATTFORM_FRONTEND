"use client";

import { Add, ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ButtonGroup,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  InputAdornment,
  List,
  Select,
  styled,
  Tooltip,
  Typography
} from "@mui/material";
import * as Cesium from "cesium";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import SceneGraphListItem from "./SceneGraph/ListItem";
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
  const updateClippingPolygon = useViewerStore(
    (state) => state.clippingPolygons.update
  );

  const projectObjects = useViewerStore((state) => state.projectObjects.value);
  const updateProjectObject = useViewerStore(
    (state) => state.projectObjects.update
  );
  const deleteProjectObject = useViewerStore(
    (state) => state.projectObjects.delete
  );
  const toggleVisibilityProjectObject = useViewerStore(
    (state) => state.projectObjects.toggleVisibility
  );

  const createStartingPoint = useViewerStore(
    (state) => state.startingPoints.create
  );
  const startingPoints = useViewerStore((state) => state.startingPoints);

  const pickPoint = useViewerStore((state) => state.tools.pickPoint);

  // const visualAxes = useViewerStore((state) => state.visualAxes);

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
      <Card variant="outlined">
        <CardHeader subheader="Ebene" />
        <CardContent sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
          <Grid container flexDirection="row">
            <Select
              sx={{ background: "white", flex: 1 }}
              endAdornment={<InputAdornment position="end"></InputAdornment>}
            ></Select>
            <IconButton>
              <Add />
            </IconButton>
          </Grid>
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
                  Models&nbsp;
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
                {projectObjects
                  .concat([
                    {
                      attributes: {},
                      fileContent: Buffer.from([]),
                      id: "asdasd",
                      name: "Test",
                      rotation: { w: 0, x: 0, y: 0, z: 0 },
                      scale: { x: 0, y: 0, z: 0 },
                      translation: { x: 0, y: 0, z: 0 },
                      type: "PROJECT_OBJECT",
                      visible: true,
                    },
                  ])
                  .map((projectObject) => (
                    <SceneGraphListItem
                      name={projectObject.name}
                      onSelected={() => setSelectedObject(projectObject)}
                      key={projectObject.id}
                      visible={projectObject.visible}
                      onToggleVisibility={() =>
                        toggleVisibilityProjectObject(projectObject.id)
                      }
                      onDelete={() => {
                        deleteProjectObject(projectObject.id);
                      }}
                      onPlace={async () => {
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

                          console.log(pickedPoint);

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
                      selected={selectedObject?.id === projectObject.id}
                    ></SceneGraphListItem>
                  ))}
              </List>
            </AccordionDetails>
          </Accordion>
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
                  <SceneGraphListItem
                    key={clippingPolygon.id}
                    name={clippingPolygon.name}
                    onSelected={() => setSelectedObject(clippingPolygon)}
                    visible={clippingPolygon.visible}
                    onToggleVisibility={() =>
                      updateClippingPolygon({
                        id: clippingPolygon.id,
                        visible: !clippingPolygon.visible,
                      })
                    }
                    onDelete={() => {
                      deleteClippingPolygon(clippingPolygon.id);
                    }}
                    selected={selectedObject?.id === clippingPolygon.id}
                  />
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
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
              <SceneGraphListItem
                name={startingPoint.name}
                onSelected={() => setSelectedObject(startingPoint)}
                selected={selectedObject?.id === startingPoint.id}
                key={startingPoint.id}
                onDelete={() => startingPoints.delete(startingPoint.id)}
                onFlyTo={() => startingPoints.helpers.flyTo(startingPoint)}
                visible={startingPoint.visible}
                onToggleVisibility={() =>
                  startingPoints.update({
                    id: startingPoint.id,
                    visible: !startingPoint.visible,
                  })
                }
              />
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}
