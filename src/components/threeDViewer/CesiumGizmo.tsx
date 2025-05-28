import {
  ArcType,
  CallbackPositionProperty,
  CallbackProperty,
  Cartesian3,
  ClassificationType,
  Color,
  Matrix4,
  PolylineArrowMaterialProperty,
  PolylineOutlineMaterialProperty,
  Transforms
} from "cesium";
import { Entity } from "resium";
import { useViewerStore } from "./ViewerProvider";

export default function CesiumGizmo() {
  const selectedObject = useViewerStore((state) => state.selectedObject);

  const objectRefs = useViewerStore((state) => state.objectRefs);

  const modelMatrix =
    objectRefs.projectObject[selectedObject?.id ?? ""]?.modelMatrix;

  if (!modelMatrix) return null;

  const handleMouseDown = () => {};

  return (
    <>
      <Entity
        position={
          new CallbackPositionProperty(() => {
            return Matrix4.getTranslation(modelMatrix, new Cartesian3());
          }, false)
        }
        onMouseDown={handleMouseDown}
        polyline={{
          positions: new CallbackProperty(() => {
            const modelMatrix =
              objectRefs.projectObject[selectedObject?.id ?? ""]?.modelMatrix;
            if (!modelMatrix) return [];

            const translation = Matrix4.getTranslation(
              modelMatrix,
              new Cartesian3()
            );

            const matrix = Transforms.eastNorthUpToFixedFrame(translation);

            return [
              Matrix4.multiplyByPoint(
                matrix,
                new Cartesian3(-20, 0, 0),
                new Cartesian3()
              ),
              Matrix4.multiplyByPoint(
                matrix,
                new Cartesian3(20, 0, 0),
                new Cartesian3()
              ),
            ];
          }, false),
          width: 10,
          arcType: ArcType.NONE,
          classificationType: ClassificationType.BOTH,
          material: new PolylineArrowMaterialProperty(Color.RED),
          depthFailMaterial: new PolylineOutlineMaterialProperty({
            color: Color.LIGHTGREY.withAlpha(0.4),
            outlineColor: Color.LIGHTGREY.withAlpha(0.4),
            outlineWidth:0
        }),
        }}
      />
      <Entity
        position={
          new CallbackPositionProperty(() => {
            return Matrix4.getTranslation(modelMatrix, new Cartesian3());
          }, false)
        }
        onMouseDown={handleMouseDown}
        polyline={{
          positions: new CallbackProperty(() => {
            const modelMatrix =
              objectRefs.projectObject[selectedObject?.id ?? ""]?.modelMatrix;
            if (!modelMatrix) return [];

            const translation = Matrix4.getTranslation(
              modelMatrix,
              new Cartesian3()
            );

            const matrix = Transforms.eastNorthUpToFixedFrame(translation);

            return [
              Matrix4.multiplyByPoint(
                matrix,
                new Cartesian3(0, -20, 0),
                new Cartesian3()
              ),
              Matrix4.multiplyByPoint(
                matrix,
                new Cartesian3(0, 20, 0),
                new Cartesian3()
              ),
            ];
          }, false),
          width: 10,
          arcType: ArcType.NONE,
          material: new PolylineArrowMaterialProperty(Color.GREEN),
          depthFailMaterial: Color.CHARTREUSE,
        }}
      />
      <Entity
        position={
          new CallbackPositionProperty(() => {
            return Matrix4.getTranslation(modelMatrix, new Cartesian3());
          }, false)
        }
        onMouseDown={handleMouseDown}
        polyline={{
          positions: new CallbackProperty(() => {
            const modelMatrix =
              objectRefs.projectObject[selectedObject?.id ?? ""]?.modelMatrix;
            if (!modelMatrix) return [];

            const translation = Matrix4.getTranslation(
              modelMatrix,
              new Cartesian3()
            );

            const matrix = Transforms.eastNorthUpToFixedFrame(translation);

            return [
              Matrix4.multiplyByPoint(
                matrix,
                new Cartesian3(0, 0, -20),
                new Cartesian3()
              ),
              Matrix4.multiplyByPoint(
                matrix,
                new Cartesian3(0, 0, 20),
                new Cartesian3()
              ),
            ];
          }, false),
          width: 10,
          arcType: ArcType.NONE,
          material: new PolylineArrowMaterialProperty(Color.BLUE),
          depthFailMaterial: Color.CHARTREUSE,
        }}
      />
    </>
  );
}
