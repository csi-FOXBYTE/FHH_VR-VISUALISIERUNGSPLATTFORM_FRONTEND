import * as Cesium from "cesium";
import { useEffect, useState } from "react";
import {
  BillboardGraphics,
  Entity,
  LabelGraphics
} from "resium";
import {
  StartingPoint as StartingPointType,
  useViewerStore,
} from "./ViewerProvider";

export default function StartingPoints() {
  const startingPoints = useViewerStore((state) => state.startingPoints.value);

  return startingPoints.map((startingPoint) => (
    <StartingPoint key={startingPoint.id} startingPoint={startingPoint} />
  ));
}

function StartingPoint({
  startingPoint,
}: {
  startingPoint: StartingPointType;
}) {
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

  return (
    <Entity
      position={
        new Cesium.Cartesian3(
          startingPoint.position.x,
          startingPoint.position.y,
          startingPoint.position.z
        )
      }
      id={startingPoint.id}
      onClick={() => setSelectedObject(startingPoint)}
      ref={(ref) => {
        if (!ref?.cesiumElement) return;

        setEntityRef(ref.cesiumElement);
      }}
    >
      <BillboardGraphics
        image="/location.png"
        width={48}
        height={48}
        disableDepthTestDistance={1000}
      />
      <LabelGraphics
        text={startingPoint.name}
        pixelOffset={new Cesium.Cartesian2(0, 48)}
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
  );
}
