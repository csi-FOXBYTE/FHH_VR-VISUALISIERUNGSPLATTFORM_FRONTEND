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

const terrain = Cesium.CesiumTerrainProvider.fromUrl(
  new Cesium.Resource({
    url: "https://fhhvrshare.blob.core.windows.net/hamburg/terrain",
  }),
  {
    requestVertexNormals: true,
  }
);

const area1 = new Cesium.Resource({
  url: "https://fhhvrshare.blob.core.windows.net/hamburg/3dtiles/area1/tileset.json",
});

const area2 = new Cesium.Resource({
  url: "https://fhhvrshare.blob.core.windows.net/hamburg/3dtiles/area2/tileset.json",
});

const area3 = new Cesium.Resource({
  url: "https://fhhvrshare.blob.core.windows.net/hamburg/3dtiles/area3/tileset.json",
});

const area4 = new Cesium.Resource({
  url: "https://fhhvrshare.blob.core.windows.net/hamburg/3dtiles/area4/tileset.json",
});

const area5 = new Cesium.Resource({
  url: "https://fhhvrshare.blob.core.windows.net/hamburg/3dtiles/area5/tileset.json",
});

const imageryProvider = new Cesium.OpenStreetMapImageryProvider({
  url: "https://tile.openstreetmap.org/",
  fileExtension: "png",
});

export default function ResiumViewer() {
  const viewerStore = useViewerStore();

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
      terrainProvider={terrain}
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
            3764595.8724393756,
            664200.4499076013,
            5144292.106228131
          )
        }
      />
      <ClippingPolygons />
      <VisualAxes />
      <ImageryLayer imageryProvider={imageryProvider} />
      <Cesium3DTileset
        clippingPolygons={builtClippingPolygons?.[0]}
        url={area1}
      />
      <Cesium3DTileset
        clippingPolygons={builtClippingPolygons?.[1]}
        url={area2}
      />
      <Cesium3DTileset
        clippingPolygons={builtClippingPolygons?.[2]}
        url={area3}
      />
      <Cesium3DTileset
        clippingPolygons={builtClippingPolygons?.[3]}
        url={area4}
      />
      <Cesium3DTileset
        clippingPolygons={builtClippingPolygons?.[4]}
        url={area5}
      />
    </Viewer>
  );
}
