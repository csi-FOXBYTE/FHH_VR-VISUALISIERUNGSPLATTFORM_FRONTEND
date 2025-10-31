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
import { useEffect } from "react";

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

  const saveProject = useViewerStore((state) => state.saveProject);
  const toggleImport = useViewerStore(
    (state) => state.projectObjects.toggleImport
  );
  const undo = useViewerStore((state) => state.history.undo);
  const redo = useViewerStore((state) => state.history.redo);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();

        return saveProject();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "i") {
        event.preventDefault();

        return toggleImport();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "z" &&
        event.target === document.body
      ) {
        event.preventDefault();

        return undo();
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "y" &&
        event.target === document.body
      ) {
        event.preventDefault();

        return redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveProject]);

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
      terrainProvider={layers.terrain?.resource as undefined} // Types are not 100% correct here
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
      <ImageryLayer imageryProvider={openStreetMapImagerProvider} />
      <PlayRegion />
      {layers.imageries.map((imagery) => (
        <ImageryLayer key={imagery.id} imageryProvider={imagery.resource} />
      ))}
      {layers.tileSets.map((tileSet) => (
        <Tileset id={tileSet.id} resource={tileSet.resource} key={tileSet.id} />
      ))}
    </Viewer>
  );
}
