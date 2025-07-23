import { Entity, PolygonGraphics } from "resium";
import {
  ClippingPolygon as ClippingPolygonType,
  useViewerStore,
} from "./ViewerProvider";
import { useEffect, useState } from "react";
import { Cartesian3, Color } from "cesium";
import * as Cesium from "cesium";

export default function ClippingPolygon({
  clippingPolygon,
}: {
  clippingPolygon: ClippingPolygonType;
}) {
  const selectedObject = useViewerStore((state) => state.selectedObject);
  const setSelectedObject = useViewerStore((state) => state.setSelectedObject);

  const registerObjectRef = useViewerStore((state) => state.registerObjectRef);
  const unregisterObjectRef = useViewerStore(
    (state) => state.unregisterObjectRef
  );

  const [entityRef, setEntityRef] = useState<Cesium.Entity | null>(null);

  useEffect(() => {
    if (entityRef !== null)
      registerObjectRef({
        type: "CLIPPING_POLYGON",
        id: clippingPolygon.id,
        objectRef: entityRef,
      });
    return () => {
      unregisterObjectRef({ type: "STARTING_POINT", id: clippingPolygon.id });
    };
  }, [unregisterObjectRef, entityRef, clippingPolygon.id, registerObjectRef]);

  return (
    <Entity
      key={clippingPolygon.id}
      ref={ref => setEntityRef(ref?.cesiumElement ?? null)}
      selected={selectedObject?.id === clippingPolygon.id}
      onClick={() => setSelectedObject(clippingPolygon)}
    >
      <PolygonGraphics
        extrudedHeight={100}
        hierarchy={{
          holes: [],
          positions: clippingPolygon.positions.map(
            (p) => new Cartesian3(p.x, p.y, p.z)
          ),
          isConstant: false,
        }}
        outline
        outlineColor={selectedObject?.id === clippingPolygon.id ? new Color(1, 1, 0, 0.6) : new Color(0.5, 0.5, 0.5, 0.6)}
        material={selectedObject?.id === clippingPolygon.id ? new Color(1, 1, 0, 0.5) : new Color(0.5, 0.5, 0.5, 0.5)}
        fill
      />
    </Entity>
  );
}
