import * as Cesium from "cesium";
import { useEffect, useState } from "react";
import { Entity, LabelGraphics } from "resium";
import CameraFrustum from "./CameraFrustum";
import {
  StartingPoint as StartingPointType,
  useViewerStore,
} from "./ViewerProvider";
import { ErrorBoundary } from "react-error-boundary";
import { useSnackbar } from "notistack";

export default function StartingPoint({
  startingPoint,
}: {
  startingPoint: StartingPointType;
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
        type: "STARTING_POINT",
        id: startingPoint.id,
        objectRef: entityRef,
      });
    return () => {
      unregisterObjectRef({ type: "STARTING_POINT", id: startingPoint.id });
    };
  }, [unregisterObjectRef, entityRef, startingPoint.id, registerObjectRef]);

  const { enqueueSnackbar } = useSnackbar();

  return (
    <ErrorBoundary
      onError={(error) =>
        enqueueSnackbar({
          variant: "error",
          message: error?.message ?? JSON.stringify(error),
        })
      }
      fallbackRender={() => (
        <Entity
          position={
            new Cesium.Cartesian3(
              startingPoint.position.x,
              startingPoint.position.y,
              startingPoint.position.z
            )
          }
        >
          <LabelGraphics
            text={`ERROR: ${startingPoint.name}`}
            pixelOffset={new Cesium.Cartesian2(0, 16)}
            scale={0.75}
            style={Cesium.LabelStyle.FILL}
            horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
            backgroundColor={Cesium.Color.WHITE}
            backgroundPadding={new Cesium.Cartesian2(8, 4)}
            showBackground
            disableDepthTestDistance={1000}
            fillColor={Cesium.Color.RED}
          />
        </Entity>
      )}
    >
      <Entity
        show={startingPoint.visible}
        position={
          new Cesium.Cartesian3(
            startingPoint.position.x,
            startingPoint.position.y,
            startingPoint.position.z
          )
        }
        id={startingPoint.id}
        onClick={() => setSelectedObject(startingPoint)}
        ref={(ref) => setEntityRef(ref?.cesiumElement ?? null)}
      >
        <LabelGraphics
          text={startingPoint.name}
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
      {startingPoint.visible ? (
        <CameraFrustum
          onClick={() => setSelectedObject(startingPoint)}
          key={startingPoint.id}
          target={
            new Cesium.Cartesian3(
              startingPoint.target.x,
              startingPoint.target.y,
              startingPoint.target.z
            )
          }
          position={
            new Cesium.Cartesian3(
              startingPoint.position.x,
              startingPoint.position.y,
              startingPoint.position.z
            )
          }
          color={
            startingPoint.id === selectedObject?.id
              ? new Cesium.Color(1, 1, 0, 0.6)
              : new Cesium.Color(0.5, 0.5, 0.5, 0.6)
          }
        />
      ) : null}
    </ErrorBoundary>
  );
}
