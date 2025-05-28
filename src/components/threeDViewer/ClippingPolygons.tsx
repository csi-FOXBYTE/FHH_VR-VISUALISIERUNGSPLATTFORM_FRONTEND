import { Entity, PolygonGraphics } from "resium";
import { useSelectedObject, useViewerStore } from "./ViewerProvider";
import { Cartesian3, Color } from "cesium";

export default function ClippingPolygons() {
  const selectedObject = useSelectedObject();
  const setSelectedObject = useViewerStore((state) => state.setSelectedObject);
  const clippingPolygons = useViewerStore(
    (state) => state.clippingPolygons.value
  );

  return clippingPolygons
    .filter((p) => p.visible)
    .map((clippingPolygon) => (
      <Entity
        key={clippingPolygon.id}
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
          outlineColor={new Color(1, 1, 0, 0.6)}
          material={new Color(1, 1, 0, 0.5)}
          fill
        />
      </Entity>
    ));
}
