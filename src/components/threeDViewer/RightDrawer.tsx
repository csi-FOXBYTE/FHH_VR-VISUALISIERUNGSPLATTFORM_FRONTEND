"use client";

import {
  Add,
  ArrowLeft,
  ArrowRight,
  Delete,
  LocationCity,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  Grid2,
  IconButton,
  Input,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import * as Cesium from "cesium";
import { useSnackbar } from "notistack";
import { useState } from "react";
import SplitPane, { Pane } from "react-split-pane";
import ImportProjectObjectInput from "./ImportProjectObjectInput";
import ObjectProperties from "./ObjectProperties";
import "./SplitPane.css";
import { useSelectedObject, useViewerStore } from "./ViewerProvider";

export default function RightDrawer() {
  const theme = useTheme();

  const [rightDrawerVisibility, setRightDrawerVisibility] = useState(true);

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

  const createStartingPoint = useViewerStore(
    (state) => state.startingPoints.create
  );
  const startingPoints = useViewerStore((state) => state.startingPoints.value);

  const pickPoint = useViewerStore((state) => state.tools.pickPoint);

  const visualAxes = useViewerStore((state) => state.visualAxes);

  const selectedObject = useSelectedObject();
  const setSelectedObject = useViewerStore((state) => state.setSelectedObject);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  return (
    <>
      <div
        style={{
          width: rightDrawerVisibility ? 400 : 0,
          height: "100%",
          transition: "width 0.3s ease",
        }}
      />
      <div
        style={{
          height: "100%",
          position: "absolute",
          top: 0,
          right: 0,
          zIndex: 100,
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[2],
          width: 400,
          borderTop: "1px solid #ddd",
          transition: "transform 0.3s ease",
          transform: rightDrawerVisibility
            ? "translateX(0)"
            : "translateX(400px)",
        }}
      >
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
          <Tooltip
            title={rightDrawerVisibility ? "Hide drawer" : "Show drawer"}
            arrow
          >
            <IconButton
              onClick={() => setRightDrawerVisibility(!rightDrawerVisibility)}
              style={{
                position: "absolute",
                left: -12,
                top: "50%",
                transform: "translateX(-50%)",
                boxShadow: theme.shadows[2],
                background: "white",
                borderRadius: 8,
              }}
            >
              {rightDrawerVisibility ? <ArrowRight /> : <ArrowLeft />}
            </IconButton>
          </Tooltip>
          {/** @ts-expect-error wrong types */}
          <SplitPane
            split="horizontal"
            style={{ height: "100%" }}
            minSize={50}
            defaultSize={"30%"}
          >
            {/** @ts-expect-error wrong types */}
            <Pane style={{ overflow: "hidden", overflowY: "auto" }}>
              <Typography variant="h6">Scene Graph</Typography>
              <SimpleTreeView>
                <TreeItem
                  itemId="grid"
                  contextMenu=""
                  label={
                    <Grid2
                      container
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography>
                        Clipping Polygons [{clippingPolygons.length}]
                      </Typography>
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
                    </Grid2>
                  }
                >
                  {clippingPolygons.map((clippingPolygon) => (
                    <TreeItem
                      key={clippingPolygon.id}
                      itemId={clippingPolygon.id}
                      onClick={() => setSelectedObject(clippingPolygon)}
                      label={
                        <Grid2
                          container
                          justifyContent="space-between"
                          alignItems="center"
                          wrap="nowrap"
                        >
                          <Input defaultValue={clippingPolygon.name} />
                          <ButtonGroup>
                            <Tooltip title="Toggle clipping polygon visibility">
                              <IconButton>
                                {clippingPolygon.visible ? (
                                  <Visibility />
                                ) : (
                                  <VisibilityOff />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete clipping polygon">
                              <IconButton
                                onClick={() =>
                                  deleteClippingPolygon(clippingPolygon.id)
                                }
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </ButtonGroup>
                        </Grid2>
                      }
                    />
                  ))}
                </TreeItem>
                <TreeItem
                  itemId="project_objects"
                  label={
                    <Grid2
                      container
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography>
                        Project objects [{projectObjects.length}]
                      </Typography>
                      <ButtonGroup size="small">
                        <IconButton size="small" component="label">
                          <Add />
                          <ImportProjectObjectInput />
                        </IconButton>
                      </ButtonGroup>
                    </Grid2>
                  }
                >
                  {projectObjects.map((projectObject) => (
                    <TreeItem
                      key={projectObject.id}
                      itemId={projectObject.id}
                      onClick={() => setSelectedObject(projectObject)}
                      label={
                        <>
                          {projectObject.name}
                          <Button
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

                                const translation =
                                  Cesium.Matrix4.getTranslation(
                                    modelMatrix,
                                    new Cesium.Cartesian3()
                                  );
                                const scale = Cesium.Matrix4.getScale(
                                  modelMatrix,
                                  new Cesium.Cartesian3()
                                );
                                const rotation =
                                  Cesium.Quaternion.fromRotationMatrix(
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
                              } catch {}

                              document.body.style.cursor = "auto";

                              closeSnackbar(id);
                            }}
                          >
                            Pick
                          </Button>
                        </>
                      }
                    />
                  ))}
                </TreeItem>
                <TreeItem
                  itemId="starting_points"
                  label={
                    <Grid2
                      container
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography>
                        Starting points [{startingPoints.length}]
                      </Typography>
                      <ButtonGroup size="small">
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
                      </ButtonGroup>
                    </Grid2>
                  }
                >
                  {startingPoints.map((startingPoint) => (
                    <TreeItem
                      key={startingPoint.id}
                      itemId={startingPoint.id}
                      onClick={() => setSelectedObject(startingPoint)}
                      label={<>{startingPoint.name}</>}
                    />
                  ))}
                </TreeItem>
                <TreeItem
                  itemId="visual_axes"
                  label={
                    <Grid2
                      container
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography>
                        Visual axes [{visualAxes.value.length}]
                      </Typography>
                      <ButtonGroup size="small">
                        <IconButton size="small" onClick={visualAxes.create}>
                          <Add />
                        </IconButton>
                      </ButtonGroup>
                    </Grid2>
                  }
                >
                  {visualAxes.value.map((visualAxis) => (
                    <TreeItem
                      key={visualAxis.id}
                      itemId={visualAxis.id}
                      onClick={() => setSelectedObject(visualAxis)}
                      label={
                        <>
                          {visualAxis.name}
                          <Button
                            onClick={() => visualAxes.helpers.flyTo(visualAxis)}
                          >
                            <LocationCity />
                          </Button>
                        </>
                      }
                    />
                  ))}
                </TreeItem>
              </SimpleTreeView>
            </Pane>
            {/** @ts-expect-error wrong types */}
            <Pane style={{ overflow: "hidden", overflowY: "auto" }}>
              <ObjectProperties selectedObject={selectedObject} />
            </Pane>
          </SplitPane>
        </div>
      </div>
    </>
  );
}
