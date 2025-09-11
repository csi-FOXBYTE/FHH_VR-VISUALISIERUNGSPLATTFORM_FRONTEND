"use client";

import {
  Add,
  Adjust,
  CameraAlt,
  Delete,
  ExpandLess,
  ExpandMore,
  Terrain,
  TerrainOutlined,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ButtonGroup,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  styled,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import * as Cesium from "cesium";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { useEffect, useRef, useState } from "react";
import SceneGraphListItem from "./SceneGraph/ListItem";
import {
  SelectedObject,
  useSelectedObject,
  useViewerStore,
} from "./ViewerProvider";
import useIsReadOnly from "./useIsReadOnly";

const StyledCount = styled("div")`
  display: inline-block;
  padding: 0px 8px;
  color: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(0, 0, 0, 0.25);
`;

export default function SceneGraph() {
  const t = useTranslations();

  const clippingPolygons = useViewerStore((state) => state.clippingPolygons);
  const createClippingPolygon = useViewerStore(
    (state) => state.clippingPolygons.create
  );
  const deleteClippingPolygon = useViewerStore(
    (state) => state.clippingPolygons.delete
  );
  const updateClippingPolygon = useViewerStore(
    (state) => state.clippingPolygons.update
  );

  const projectObjects = useViewerStore((state) => state.projectObjects);
  const updateProjectObject = useViewerStore(
    (state) => state.projectObjects.update
  );
  const deleteProjectObject = useViewerStore(
    (state) => state.projectObjects.delete
  );
  const toggleVisibilityProjectObject = useViewerStore(
    (state) => state.projectObjects.toggleVisibility
  );

  const layers = useViewerStore((state) => state.layers);

  const layerNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!layerNameInputRef.current) return;

    layerNameInputRef.current.value =
      layers.value.find((layer) => layer.id === layers.selectedLayerId)?.name ??
      "-";
  }, [layers.selectedLayerId, layers.value]);

  const createStartingPoint = useViewerStore(
    (state) => state.startingPoints.create
  );
  const startingPoints = useViewerStore((state) => state.startingPoints);

  const baseLayers = useViewerStore((state) => state.baseLayers);

  const pickPoint = useViewerStore((state) => state.tools.pickPoint);

  const selectedObject = useSelectedObject();
  const setSelectedObject = useViewerStore((state) => state.setSelectedObject);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const toggleImport = useViewerStore(
    (state) => state.projectObjects.toggleImport
  );

  const [selectedTab, setSelectedTab] = useState<
    "" | SelectedObject["type"] | "BASE_LAYER"
  >("");

  const viewer = useViewerStore((state) => state.ctx?.viewer);

  const isReadOnly = useIsReadOnly();

  useEffect(() => {}, []);

  useEffect(() => {
    setSelectedTab(selectedObject?.type ?? "");
  }, [selectedObject?.type]);

  return (
    <Grid container spacing={2} flexDirection="column" padding={2}>
      <Card variant="outlined">
        <CardContent sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
          <Grid container flexDirection="row">
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id="editor-layer-select">
                {t("editor.variants")}
              </InputLabel>
              <Select
                fullWidth
                label={t("editor.variants")}
                labelId="editor-layer-select"
                value={layers.selectedLayerId}
                onChange={(event) => {
                  layers.changeToLayer(event.target.value);
                }}
                sx={{ color: "black", background: "white", flex: 1 }}
                endAdornment={<InputAdornment position="end"></InputAdornment>}
              >
                {layers.value.map((layer) => (
                  <MenuItem key={layer.id} value={layer.id}>
                    {layer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title={t("actions.add")}>
              <IconButton
                disabled={isReadOnly}
                onClick={() => {
                  const layer = layers.add();
                  layers.changeToLayer(layer.id);
                }}
              >
                <Add />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("actions.delete")}>
              <IconButton
                onClick={() => {
                  layers.remove(layers.selectedLayerId);
                }}
                disabled={layers.value.length === 1 || isReadOnly}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Grid>
          <TextField
            fullWidth
            inputRef={layerNameInputRef}
            disabled={isReadOnly}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;

              layers.update({
                id: layers.selectedLayerId,
                name: (event.target as HTMLInputElement).value,
              });
            }}
            onBlur={(event) => {
              layers.update({
                id: layers.selectedLayerId,
                name: (event.target as HTMLInputElement).value,
              });
            }}
            label={t("editor.name-of-the-variant")}
            sx={{ background: "white" }}
          />
          <Divider />
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
                  {t("editor.models")}&nbsp;
                  <StyledCount style={{ backgroundColor: "#eff6ff" }}>
                    [{projectObjects.value.length}]
                  </StyledCount>
                </Typography>
                <Box flex="1" />
                <ButtonGroup size="small">
                  <IconButton
                    disabled={isReadOnly}
                    size="small"
                    onClick={toggleImport}
                  >
                    <Add />
                  </IconButton>
                </ButtonGroup>
              </Grid>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
              <List>
                {projectObjects.value.map((projectObject) => (
                  <SceneGraphListItem
                    name={projectObject.name}
                    onSelected={() => setSelectedObject(projectObject)}
                    key={projectObject.id}
                    visible={projectObject.visible}
                    disabled={isReadOnly}
                    onFlyTo={() => projectObjects.helpers.flyTo(projectObject)}
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
                        message: t("editor.pick-a-point-message"),
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
                    selected={selectedObject?.id === projectObject.id}
                  />
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
                  {t("editor.clipping-polygons")}&nbsp;
                  <StyledCount style={{ backgroundColor: "#fef2f2" }}>
                    [{clippingPolygons.value.length}]
                  </StyledCount>
                </Typography>
                <Box flex="1" />
                <ButtonGroup size="small">
                  <IconButton
                    size="small"
                    disabled={isReadOnly}
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
                {clippingPolygons.value.map((clippingPolygon) => (
                  <SceneGraphListItem
                    disabled={isReadOnly}
                    key={clippingPolygon.id}
                    name={clippingPolygon.name}
                    onSelected={() => setSelectedObject(clippingPolygon)}
                    visible={clippingPolygon.visible}
                    onFlyTo={() =>
                      clippingPolygons.helpers.flyTo(clippingPolygon)
                    }
                    onToggleVisibility={() =>
                      updateClippingPolygon({
                        id: clippingPolygon.id,
                        visible: !clippingPolygon.visible,
                      })
                    }
                    onDelete={() => {
                      deleteClippingPolygon(clippingPolygon.id);
                    }}
                    extras={
                      <IconButton
                        sx={{ color: "inherit" }}
                        onClick={() =>
                          updateClippingPolygon({
                            id: clippingPolygon.id,
                            affectsTerrain: !clippingPolygon.affectsTerrain,
                          })
                        }
                      >
                        {clippingPolygon.affectsTerrain ? (
                          <Terrain />
                        ) : (
                          <TerrainOutlined />
                        )}
                      </IconButton>
                    }
                    selected={selectedObject?.id === clippingPolygon.id}
                  />
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={selectedTab === "BASE_LAYER"}
            onChange={() => setSelectedTab("BASE_LAYER")}
            style={{ width: "100%" }}
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
                  {selectedTab === "BASE_LAYER" ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </IconButton>
                <Typography>
                  {t("editor.base-layers")}&nbsp;
                  <StyledCount style={{ backgroundColor: "#f0fdf4" }}>
                    [{baseLayers.selected.length}]
                  </StyledCount>
                </Typography>
                <Box flex="1" />
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {baseLayers.value.map((baseLayer) => (
                  <ListItem key={baseLayer.id}>
                    <Checkbox
                      onChange={(_, checked) => {
                        if (checked) return baseLayers.select(baseLayer.id);
                        baseLayers.unselect(baseLayer.id);
                      }}
                      disabled={isReadOnly}
                      checked={baseLayers.selected.includes(baseLayer.id)}
                    />
                    <ListItemText sx={{ flex: 1 }} primary={baseLayer.name} />
                    <Tooltip arrow title={t("actions.fly-to")}>
                      <IconButton
                        disabled={!baseLayers.selected.includes(baseLayer.id)}
                        onClick={() => {
                          for (
                            let i = 0;
                            i < (viewer?.scene.primitives.length ?? 0);
                            i++
                          ) {
                            const primitive = viewer?.scene.primitives.get(i);

                            if (
                              primitive?._resource?.request?.url ===
                              baseLayer.href
                            ) {
                              viewer?.zoomTo(primitive);
                            }
                          }
                        }}
                      >
                        <Adjust />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
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
              {t("editor.starting-points")}&nbsp;
              <StyledCount style={{ backgroundColor: "#f0fdf4" }}>
                [{startingPoints.value.length}]
              </StyledCount>
            </Typography>
            <Box flex="1" />
            <ButtonGroup size="small">
              <Tooltip title={t("editor.add-starting-point")}>
                <IconButton
                  disabled={isReadOnly}
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
                extras={
                  <IconButton
                    disabled={isReadOnly}
                    onClick={() => {
                      startingPoints.helpers.takeScreenshot(startingPoint);
                    }}
                    sx={{ color: "inherit" }}
                  >
                    <CameraAlt />
                  </IconButton>
                }
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
