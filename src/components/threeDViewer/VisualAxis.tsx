import * as Cesium from "cesium";
import { useEffect, useState } from "react";
import { Entity, LabelGraphics } from "resium";
import CameraFrustum from "./CameraFrustum";
import { useViewerStore, VisualAxis as VisualAxisType } from "./ViewerProvider";

export default function VisualAxis({
  visualAxis,
}: {
  visualAxis: VisualAxisType;
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
        type: "VISUAL_AXIS",
        id: visualAxis.id,
        objectRef: entityRef,
      });
    return () => {
      unregisterObjectRef({ type: "STARTING_POINT", id: visualAxis.id });
    };
  }, [unregisterObjectRef, entityRef, visualAxis.id, registerObjectRef]);

  return (
    <>
      <Entity
        ref={(ref) => setEntityRef(ref?.cesiumElement ?? null)}
        show={visualAxis.visible}
        position={
          new Cesium.Cartesian3(
            visualAxis.position.x,
            visualAxis.position.y,
            visualAxis.position.z
          )
        }
        id={visualAxis.id}
        onClick={() => setSelectedObject(visualAxis)}
      >
        <LabelGraphics
          text={visualAxis.name}
          pixelOffset={new Cesium.Cartesian2(0, 16)}
          scale={0.75}
          style={Cesium.LabelStyle.FILL}
          horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
          backgroundColor={Cesium.Color.WHITE}
          backgroundPadding={new Cesium.Cartesian2(8, 4)}
          showBackground
          disableDepthTestDistance={1000}
          fillColor={Cesium.Color.BLACK}
        />
      </Entity>
      {visualAxis.visible ? (
        <CameraFrustum
          key={visualAxis.id}
          target={
            new Cesium.Cartesian3(
              visualAxis.target.x,
              visualAxis.target.y,
              visualAxis.target.z
            )
          }
          position={
            new Cesium.Cartesian3(
              visualAxis.position.x,
              visualAxis.position.y,
              visualAxis.position.z
            )
          }
          color={
            visualAxis.id === selectedObject?.id
              ? new Cesium.Color(1, 1, 0, 0.6)
              : new Cesium.Color(0.5, 0.5, 0.5, 0.6)
          }
        />
      ) : null}
    </>
  );
}
