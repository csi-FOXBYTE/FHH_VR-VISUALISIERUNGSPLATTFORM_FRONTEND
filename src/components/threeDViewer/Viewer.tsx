"use client";

import * as Cesium from "cesium";
import { ImageryLayer, Viewer } from "resium";
import { useBaseLayerProviderContext } from "./BaseLayerProvider";
import ClippingPolygons from "./ClippingPolygons";
import Compass from "./Compass";
import GetResiumCtx from "./GetResiumCtx";
import ProjectObjects from "./ProjectObjects";
import { ScaleBar } from "./ScaleBar";
import ScreenshotDialog from "./ScreenshotDialog";
import SetCamera from "./SetCamera";
import StartingPoints from "./StartingPoints";
import Tileset from "./Tileset";
import ToolsProvider from "./Tools";
import { useViewerStore } from "./ViewerProvider";
import PlayRegion from "./PlayRegion";

const openStreetMapImagerProvider = new Cesium.OpenStreetMapImageryProvider({
  url: "https://tile.openstreetmap.org/",
  fileExtension: "png",
});

export default function ResiumViewer() {
  const layers = useBaseLayerProviderContext();

  const safeCameraZoneVisible = useViewerStore(
    (state) => state.tools.safeCameraZoneVisible
  );

  const setSelectedObject = useViewerStore((state) => state.setSelectedObject);

  return (
    <Viewer
      ref={(ref) => {
        if (!ref?.cesiumElement) return;

        ref.cesiumElement.scene.globe.depthTestAgainstTerrain = true;
      }}
      contextOptions={{
        webgl: { preserveDrawingBuffer: true },
      }}
      style={{
        width: "100%",
        height: safeCameraZoneVisible ? undefined : "100%",
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        left: 0,
        aspectRatio: safeCameraZoneVisible ? "16/9" : undefined,
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
      onClick={(_, target) => {
        if (target === undefined) setSelectedObject(null);
      }}
      fullscreenButton={false}
      terrainProvider={layers.terrain?.resource}
      timeline={false}
      scene3DOnly
      targetFrameRate={30}
      infoBox={false}
    >
      <ScaleBar />
      <Compass />
      <ScreenshotDialog />
      <GetResiumCtx />
      <ProjectObjects />
      <StartingPoints />
      <SetCamera />
      <ToolsProvider />
      <ClippingPolygons />
      <ImageryLayer
        imageryProvider={openStreetMapImagerProvider}
      />
      <PlayRegion />
      {layers.imageries.map((imagery) => (
        <ImageryLayer
          key={imagery.id}
          imageryProvider={imagery.resource}
        />
      ))}
      {layers.tileSets.map((tileSet) => (
        <Tileset id={tileSet.id} resource={tileSet.resource} key={tileSet.id} />
      ))}
    </Viewer>
  );
}
