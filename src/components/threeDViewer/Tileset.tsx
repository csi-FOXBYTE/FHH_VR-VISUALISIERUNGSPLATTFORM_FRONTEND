"use client";

import * as Cesium from "cesium";
import { ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { Cesium3DTileset, CesiumComponentRef } from "resium";
import { useBaseLayerProviderContext } from "./BaseLayerProvider";
import { useViewerStore } from "./ViewerProvider";

const useDelayedRender = (delay: number) => {
  const [delayed, setDelayed] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => setDelayed(false), delay);
    return () => clearTimeout(timeout);
  }, []);
  return (fn: () => ReactNode) => !delayed && fn();
};

export default function Tileset({
  resource,
  id,
}: {
  resource: Cesium.Resource;
  id: string;
}) {
  const setSelectedObject = useViewerStore((state) => state.setSelectedObject);

  const clippingPolygons = useViewerStore(
    (state) => state.clippingPolygons.value
  );

  const [tilesetRef, setTilesetRef] =
    useState<CesiumComponentRef<Cesium.Cesium3DTileset> | null>(null);

  useLayoutEffect(() => {
    if (!tilesetRef?.cesiumElement || tilesetRef.cesiumElement.isDestroyed()) {
      return;
    }

    if (!tilesetRef.cesiumElement.clippingPolygons) {
      tilesetRef.cesiumElement.clippingPolygons =
        new Cesium.ClippingPolygonCollection();
    }

    tilesetRef.cesiumElement.clippingPolygons.removeAll();

    clippingPolygons.forEach((clippingPolygon) =>
      tilesetRef?.cesiumElement?.clippingPolygons.add(
        new Cesium.ClippingPolygon({
          positions: clippingPolygon.positions.map(
            (p) => new Cesium.Cartesian3(p.x, p.y, p.z)
          ),
        })
      )
    );
  }, [clippingPolygons, tilesetRef?.cesiumElement]);

  const delayedRender = useDelayedRender(1000);

  const layers = useBaseLayerProviderContext();

  return delayedRender(() => (
    <Cesium3DTileset
      url={resource}
      ref={setTilesetRef}
      onClick={(_, target) => {
        const attributes: Record<string, string> = {};

        for (const key of target.getPropertyIds()) {
          attributes[key] = String(target.getProperty(key));
        }

        setSelectedObject({
          type: "TILE_3D",
          id,
          attributes,
          name:
            layers["tileSets"].find((tileSet) => tileSet.id === id)?.name ??
            "-",
        });
      }}
    />
  ));
}
