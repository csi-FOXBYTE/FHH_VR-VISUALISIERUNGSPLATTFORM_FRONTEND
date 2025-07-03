"use client";

import * as Cesium from "cesium";
import { useMemo } from "react";
import { CameraFlyTo, Cesium3DTileset, ImageryLayer, Viewer } from "resium";
import ClippingPolygons from "./ClippingPolygons";
import Compass from "./Compass";
import GetResiumCtx from "./GetResiumCtx";
import ProjectObjects from "./ProjectObjects";
import StartingPoints from "./StartingPoints";
import TimePicker from "./TimePicker";
import ToolsProvider from "./Tools";
import { useViewerStore } from "./ViewerProvider";
import VisualAxes from "./VisualAxes";
import { useBaseLayerProviderContext } from "./BaseLayerProvider";
import { useConfigurationProviderContext } from "../configuration/ConfigurationProvider";

const openStreetMapImagerProvider = new Cesium.OpenStreetMapImageryProvider({
  url: "https://tile.openstreetmap.org/",
  fileExtension: "png",
});

export default function ResiumViewer() {
  const viewerStore = useViewerStore();

  const layers = useBaseLayerProviderContext();

  const configuration = useConfigurationProviderContext();

  const builtClippingPolygons = useMemo(() => {
    return new Array(6).fill(0).map(() => {
      if (viewerStore.clippingPolygons.value.length === 0) return undefined;

      const collection = new Cesium.ClippingPolygonCollection({
        enabled: viewerStore.clippingPolygons.value.length > 0,
        inverse: false,
        polygons: viewerStore.clippingPolygons.value.map(
          (clippingPolygon) =>
            new Cesium.ClippingPolygon({
              positions: clippingPolygon.positions.map(
                (p) => new Cesium.Cartesian3(p.x, p.y, p.z)
              ),
            })
        ),
      });

      return collection;
    });
  }, [viewerStore.clippingPolygons.value]);

  const safeCameraZoneVisible = useViewerStore(
    (state) => state.tools.safeCameraZoneVisible
  );

  return (
    <Viewer
      ref={(ref) => {
        if (!ref?.cesiumElement) return;

        ref.cesiumElement.scene.globe.depthTestAgainstTerrain = true;
      }}
      style={{
        width: "100%",
        height: safeCameraZoneVisible ? undefined : "100%",
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        left: 0,
        aspectRatio: safeCameraZoneVisible ? 1.7777777777777778 : undefined,
        maxWidth: "100%",
        maxHeight: "100%",
        imageRendering: "pixelated",
      }}
      geocoder={false}
      baseLayerPicker={false}
      baseLayer={false}
      terrainShadows={Cesium.ShadowMode.ENABLED}
      homeButton={false}
      vrButton={false}
      animation={false}
      navigationHelpButton={false}
      fullscreenButton={false}
      terrainProvider={layers.terrain?.resource}
      timeline={false}
      scene3DOnly
      targetFrameRate={30}
      infoBox={false}
    >
      {/* <CesiumGizmo /> */}
      <Compass />
      <TimePicker />
      <GetResiumCtx />
      <ProjectObjects />
      <StartingPoints />
      <ToolsProvider />
      <CameraFlyTo
        once
        duration={0}
        destination={
          new Cesium.Cartesian3(
            configuration.globalStartPoint.x,
            configuration.globalStartPoint.y,
            configuration.globalStartPoint.z
          )
        }
      />
      <ClippingPolygons />
      <VisualAxes />
      <ImageryLayer imageryProvider={openStreetMapImagerProvider} />
      {layers.imageries.map((imagery) => (
        <ImageryLayer key={imagery.id} imageryProvider={imagery.resource} />
      ))}
      {layers.tileSets.map((tileSet) => (
        <Cesium3DTileset
          key={tileSet.id}
          url={tileSet.resource}
          clippingPolygons={builtClippingPolygons?.[0]}
        />
      ))}
    </Viewer>
  );
}
