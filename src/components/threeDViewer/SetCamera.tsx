import { Cartesian3, HeadingPitchRoll } from "cesium";
import { useEffect, useMemo } from "react";
import { CameraFlyTo, useCesium } from "resium";
import { useViewerStore } from "./ViewerProvider";
import { useConfigurationProviderContext } from "../configuration/ConfigurationProvider";

export default function SetCamera() {
  const { viewer } = useCesium();

  const lastCameraPosition = useViewerStore(
    (state) => state.lastCameraPosition
  );

  const configuration = useConfigurationProviderContext();

  const destination = useMemo(() => {
    return new Cartesian3(
      configuration.globalStartPoint.x,
      configuration.globalStartPoint.y,
      configuration.globalStartPoint.z
    );
  }, [
    configuration.globalStartPoint.x,
    configuration.globalStartPoint.y,
    configuration.globalStartPoint.z,
  ]);

  useEffect(() => {
    if (!viewer?.camera || !lastCameraPosition) return;

    viewer.camera.setView({
      destination: new Cartesian3(
        lastCameraPosition.x,
        lastCameraPosition.y,
        lastCameraPosition.z
      ),
      orientation: new HeadingPitchRoll(
        lastCameraPosition.heading,
        lastCameraPosition.pitch,
        lastCameraPosition.roll
      ),
    });
  }, [lastCameraPosition, viewer?.camera]);

  if (!lastCameraPosition)
    return (
      <CameraFlyTo once duration={0} key="flyto" destination={destination} />
    );

  return null;
}
