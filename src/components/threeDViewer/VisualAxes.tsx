import { Cartesian3 } from "cesium";
import CameraFrustum from "./CameraFrustum";
import { useViewerStore } from "./ViewerProvider";

export default function VisualAxes() {
  const visualAxes = useViewerStore((state) => state.visualAxes.value);

  return visualAxes.map((visualAxis) => {
    const direction = new Cartesian3();

    Cartesian3.subtract(
      new Cartesian3(
        visualAxis.target.x,
        visualAxis.target.y,
        visualAxis.target.z
      ),
      new Cartesian3(
        visualAxis.position.x,
        visualAxis.position.y,
        visualAxis.position.z
      ),
      direction
    );
    Cartesian3.normalize(direction, direction);

    return (
      <CameraFrustum
        key={visualAxis.id}
        direction={direction}
        position={
          new Cartesian3(
            visualAxis.position.x,
            visualAxis.position.y,
            visualAxis.position.z
          )
        }
      />
    );
  });
}
