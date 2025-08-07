import * as Cesium from "cesium";
import { useEffect, useMemo, useState } from "react";
import { Model } from "resium";
import {
  ProjectModel as ProjectObjectType,
  useViewerStore,
} from "./ViewerProvider";

export default function ProjectObject({
  projectObject,
}: {
  projectObject: ProjectObjectType;
}) {
  const [modelRef, setModelRef] = useState<Cesium.Model | null>(null);

  const selectedObject = useViewerStore((state) => state.selectedObject);
  const setSelectedObject = useViewerStore((state) => state.setSelectedObject);

  const registerObjectRef = useViewerStore((state) => state.registerObjectRef);
  const unregisterObjectRef = useViewerStore(
    (state) => state.unregisterObjectRef
  );

  const project = useViewerStore(state => state.project);

  useEffect(() => {
    if (modelRef !== null)
      registerObjectRef({
        type: "PROJECT_OBJECT",
        id: projectObject.id,
        objectRef: modelRef,
      });
    return () => {
      unregisterObjectRef({ type: "PROJECT_OBJECT", id: projectObject.id });
    };
  }, [unregisterObjectRef, modelRef, projectObject.id, registerObjectRef]);

  const modelMatrix = useMemo(() => {
    const t = new Cesium.TranslationRotationScale(
      new Cesium.Cartesian3(
        projectObject.translation.x,
        projectObject.translation.y,
        projectObject.translation.z
      ),
      new Cesium.Quaternion(
        projectObject.rotation.x,
        projectObject.rotation.y,
        projectObject.rotation.z,
        projectObject.rotation.w
      ),
      new Cesium.Cartesian3(
        projectObject.scale.x,
        projectObject.scale.y,
        projectObject.scale.z
      )
    );

    return Cesium.Matrix4.fromTranslationRotationScale(t);
  }, [
    projectObject.rotation.w,
    projectObject.rotation.x,
    projectObject.rotation.y,
    projectObject.rotation.z,
    projectObject.scale.x,
    projectObject.scale.y,
    projectObject.scale.z,
    projectObject.translation.x,
    projectObject.translation.y,
    projectObject.translation.z,
  ]);

  return (
    <Model
      onClick={() => setSelectedObject(projectObject)}
      url={`${projectObject.href}?${project.sasQueryParameters}`}
      show={projectObject.visible}
      modelMatrix={modelMatrix}
      color={Cesium.Color.YELLOW}
      colorBlendMode={Cesium.ColorBlendMode.MIX}
      colorBlendAmount={selectedObject?.id === projectObject.id ? 0.5 : 0}
      ref={(ref) => {
        if (!ref?.cesiumElement) return;

        setModelRef(ref.cesiumElement);
      }}
    />
  );
}
