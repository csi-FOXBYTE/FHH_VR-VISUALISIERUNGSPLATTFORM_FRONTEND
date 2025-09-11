import { Cartesian3, Cartographic, Color, EllipsoidGeodesic } from "cesium";
import { BoxGraphics, Entity } from "resium";
import { useViewerStore } from "./ViewerProvider";

// TODO: Implement this?!
export default function PlayRegion() {
  const region = useViewerStore((state) => state.region);

  if (!region) return null;

  const a = Cartesian3.fromRadians(region.east, region.south);
  const b = Cartesian3.fromRadians(region.west, region.north);

  const nw = Cartographic.fromRadians(region.west, region.north);
  const ne = Cartographic.fromRadians(region.east, region.north);
  const sw = Cartographic.fromRadians(region.west, region.south);
  const geodEW = new EllipsoidGeodesic(nw, ne);
  const width = geodEW.surfaceDistance;
  const geodNS = new EllipsoidGeodesic(nw, sw);
  const height = geodNS.surfaceDistance;

  const center = Cartesian3.divideByScalar(
    Cartesian3.add(a, b, new Cartesian3()),
    2,
    new Cartesian3()
  );

  return (
    <Entity name="Play region" position={center}>
      <BoxGraphics
        fill={true}
        outline
        outlineColor={Color.RED}
        material={new Color(1, 0, 0, 0.5)}
        dimensions={new Cartesian3(width, height, 100_000)}
      />
    </Entity>
  );
}
