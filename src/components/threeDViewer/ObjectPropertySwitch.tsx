import {
  Cartesian3,
  ConstantPositionProperty,
  Matrix3,
  Matrix4,
  Quaternion,
  TranslationRotationScale,
} from "cesium";
import TranslateInput from "./TranslateInput";
import { SelectedObjectResolved, useViewerStore } from "./ViewerProvider";
import { useCesium } from "resium";
import RotationInput from "./RotationInput";
import ScaleInput from "./ScaleInput";
import { Divider, Grid2 } from "@mui/material";

export default function TransformSwitch({
  selectedObject,
}: {
  selectedObject: SelectedObjectResolved;
}) {
  const objectRefs = useViewerStore((state) => state.objectRefs);

  const { viewer } = useCesium();

  switch (selectedObject.type) {
    case "CLIPPING_POLYGON":
      return "-";
    case "PROJECT_OBJECT":
      return (
        <Grid2 container flexDirection="column" spacing={2}>
          <RotationInput
            value={selectedObject.rotation}
            origin={selectedObject.translation}
            onImmediateChange={(value) => {
              if (!objectRefs.projectObject[selectedObject.id]) return;

              const scale = Matrix4.getScale(
                objectRefs.projectObject[selectedObject.id].modelMatrix,
                new Cartesian3()
              );
              const translation = Matrix4.getTranslation(
                objectRefs.projectObject[selectedObject.id].modelMatrix,
                new Cartesian3()
              );

              const t = new TranslationRotationScale(
                translation,
                new Quaternion(value.x, value.y, value.z, value.w),
                scale
              );

              const modelMatrix = Matrix4.fromTranslationRotationScale(t);

              objectRefs.projectObject[selectedObject.id].modelMatrix =
                modelMatrix;

              viewer?.scene.requestRender();
            }}
          />
          <Divider />
          <TranslateInput
            value={selectedObject.translation}
            onImmediateChange={(value) => {
              if (!objectRefs.projectObject[selectedObject.id]) return;

              const rotation = Quaternion.fromRotationMatrix(
                Matrix4.getRotation(
                  objectRefs.projectObject[selectedObject.id].modelMatrix,
                  new Matrix3()
                ),
                new Quaternion()
              );
              const scale = Matrix4.getScale(
                objectRefs.projectObject[selectedObject.id].modelMatrix,
                new Cartesian3()
              );

              const t = new TranslationRotationScale(
                new Cartesian3(value.x, value.y, value.z),
                rotation,
                scale
              );

              const modelMatrix = Matrix4.fromTranslationRotationScale(t);

              objectRefs.projectObject[selectedObject.id].modelMatrix =
                modelMatrix;

              viewer?.scene.requestRender();
            }}
          />
          <Divider />
          <ScaleInput
            value={selectedObject.scale}
            onImmediateChange={(value) => {
              if (!objectRefs.projectObject[selectedObject.id]) return;

              const rotation = Quaternion.fromRotationMatrix(
                Matrix4.getRotation(
                  objectRefs.projectObject[selectedObject.id].modelMatrix,
                  new Matrix3()
                ),
                new Quaternion()
              );
              const translation = Matrix4.getTranslation(
                objectRefs.projectObject[selectedObject.id].modelMatrix,
                new Cartesian3()
              );

              const t = new TranslationRotationScale(
                translation,
                rotation,
                new Cartesian3(value.x, value.y, value.z)
              );

              const modelMatrix = Matrix4.fromTranslationRotationScale(t);

              objectRefs.projectObject[selectedObject.id].modelMatrix =
                modelMatrix;

              viewer?.scene.requestRender();
            }}
          />
        </Grid2>
      );
    case "STARTING_POINT":
      return (
        <TranslateInput
          onImmediateChange={(value) => {
            if (!objectRefs.startingPoints[selectedObject.id]) return;

            objectRefs.startingPoints[selectedObject.id].position =
              new ConstantPositionProperty(
                new Cartesian3(value.x, value.y, value.z),
                objectRefs.startingPoints[
                  selectedObject.id
                ].position?.referenceFrame
              );

            viewer?.scene.requestRender();
          }}
          value={selectedObject.position}
        />
      );
    case "TILE_3D":
      return "3D Tile feature";
    case "VISUAL_AXIS":
      return (
        <TranslateInput
          onImmediateChange={(value) => {
            if (!objectRefs.visualAxes[selectedObject.id]) return;

            objectRefs.visualAxes[selectedObject.id].position =
              new ConstantPositionProperty(
                new Cartesian3(value.x, value.y, value.z),
                objectRefs.visualAxes[
                  selectedObject.id
                ].position?.referenceFrame
              );

            viewer?.scene.requestRender();
          }}
          value={selectedObject.position}
        />
      );
  }
}
