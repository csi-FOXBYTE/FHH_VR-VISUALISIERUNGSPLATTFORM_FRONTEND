import { Divider, Grid, Typography } from "@mui/material";
import {
  Cartesian3,
  ConstantPositionProperty,
  Matrix4,
  Quaternion,
} from "cesium";
import { useCallback, useEffect, useRef } from "react";
import { useCesium } from "resium";
import {
  createModelMatrixFromModelMatrixAndOptionalTranslationOrRotationOrScale,
  createTranslationRotationScaleFromModelMatrixOptional,
} from "./TransformInputs/helpers";
import RotationInput from "./TransformInputs/RotationInput";
import ScaleInput from "./TransformInputs/ScaleInput";
import TranslationInput from "./TransformInputs/TranslationInput";
import { SelectedObjectResolved, useViewerStore } from "./ViewerProvider";
import useIsReadOnly from "./useIsReadOnly";
import { useTranslations } from "next-intl";

export default function TransformSwitch({
  selectedObject,
}: {
  selectedObject: SelectedObjectResolved;
}) {
  const objectRefs = useViewerStore((state) => state.objectRefs);

  const t = useTranslations();

  const updateProjectObject = useViewerStore(
    (state) => state.projectObjects.update
  );
  const updateStartingPoint = useViewerStore(
    (state) => state.startingPoints.update
  );

  const isReadOnly = useIsReadOnly();

  const { viewer } = useCesium();

  const timerRef = useRef({ timer: 0 });

  useEffect(() => {
    const timer = timerRef.current.timer;

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const handleChangeMatrix = useCallback(
    (matrix: Matrix4, id: string) => {
      window.clearTimeout(timerRef.current.timer);

      const newTimer = window.setTimeout(() => {
        updateProjectObject({
          id,
          ...createTranslationRotationScaleFromModelMatrixOptional(matrix),
        });
      }, 500);

      timerRef.current.timer = newTimer;
    },
    [updateProjectObject]
  );

  const handleTranslationChange = useCallback(
    (value: { x: number; y: number; z: number }) => {
      if (selectedObject.type !== "PROJECT_OBJECT") return;
      if (!objectRefs.projectObject[selectedObject.id]) return;

      objectRefs.projectObject[selectedObject.id].modelMatrix =
        createModelMatrixFromModelMatrixAndOptionalTranslationOrRotationOrScale(
          objectRefs.projectObject[selectedObject.id].modelMatrix,
          new Cartesian3(value.x, value.y, value.z),
          undefined,
          undefined
        );

      viewer?.scene.requestRender();

      handleChangeMatrix(
        objectRefs.projectObject[selectedObject.id].modelMatrix,
        selectedObject.id
      );
    },
    [
      handleChangeMatrix,
      objectRefs.projectObject,
      selectedObject.type,
      selectedObject.id,
      viewer?.scene,
    ]
  );

  const handleRotationChange = useCallback(
    (value: { x: number; y: number; z: number; w: number }) => {
      if (selectedObject.type !== "PROJECT_OBJECT") return;
      if (!objectRefs.projectObject[selectedObject.id]) return;

      objectRefs.projectObject[selectedObject.id].modelMatrix =
        createModelMatrixFromModelMatrixAndOptionalTranslationOrRotationOrScale(
          objectRefs.projectObject[selectedObject.id].modelMatrix,
          undefined,
          new Quaternion(value.x, value.y, value.z, value.w),
          undefined
        );

      viewer?.scene.requestRender();

      handleChangeMatrix(
        objectRefs.projectObject[selectedObject.id].modelMatrix,
        selectedObject.id
      );
    },
    [
      handleChangeMatrix,
      objectRefs.projectObject,
      selectedObject.type,
      selectedObject.id,
      viewer?.scene,
    ]
  );

  const handleScaleChange = useCallback(
    (value: { x: number; y: number; z: number }) => {
      if (selectedObject.type !== "PROJECT_OBJECT") return;
      if (!objectRefs.projectObject[selectedObject.id]) return;

      objectRefs.projectObject[selectedObject.id].modelMatrix =
        createModelMatrixFromModelMatrixAndOptionalTranslationOrRotationOrScale(
          objectRefs.projectObject[selectedObject.id].modelMatrix,
          undefined,
          undefined,
          new Cartesian3(value.x, value.y, value.z)
        );

      viewer?.scene.requestRender();

      handleChangeMatrix(
        objectRefs.projectObject[selectedObject.id].modelMatrix,
        selectedObject.id
      );
    },
    [
      handleChangeMatrix,
      objectRefs.projectObject,
      selectedObject.type,
      selectedObject.id,
      viewer?.scene,
    ]
  );

  const lastPositionRef = useRef<{
    position: { x: number; y: number; z: number } | null;
    target: { x: number; y: number; z: number } | null;
  }>({
    position: null,
    target: null,
  });

  const handleTranslationChangeStartingPoint = useCallback(
    (
      position?: { x: number; y: number; z: number },
      target?: { x: number; y: number; z: number }
    ) => {
      if (!objectRefs.startingPoints[selectedObject.id]) return;

      if (position)
        objectRefs.startingPoints[selectedObject.id].position =
          new ConstantPositionProperty(
            new Cartesian3(position.x, position.y, position.z),
            objectRefs.startingPoints[
              selectedObject.id
            ].position?.referenceFrame
          );

      if (position) lastPositionRef.current.position = position;
      if (target) lastPositionRef.current.target = target;

      viewer?.scene.requestRender();

      window.clearTimeout(timerRef.current.timer);

      timerRef.current.timer = window.setTimeout(() => {
        const payload: {
          id: string;
          position?: { x: number; y: number; z: number };
          target?: { x: number; y: number; z: number };
        } = {
          id: selectedObject.id,
        };

        if (lastPositionRef.current.position)
          payload.position = { ...lastPositionRef.current.position };
        if (lastPositionRef.current.target)
          payload.target = { ...lastPositionRef.current.target };

        updateStartingPoint(payload);
        lastPositionRef.current.position = null;
        lastPositionRef.current.target = null;
      }, 250);
    },
    [
      objectRefs.startingPoints,
      selectedObject.id,
      updateStartingPoint,
      viewer?.scene,
    ]
  );

  switch (selectedObject.type) {
    case "PROJECT_OBJECT":
      return (
        <Grid container flexDirection="column" spacing={2}>
          <TranslationInput
            disabled={isReadOnly}
            value={selectedObject.translation}
            onImmediateChange={handleTranslationChange}
          />
          <Divider />
          <RotationInput
            disabled={isReadOnly}
            value={selectedObject.rotation}
            origin={selectedObject.translation}
            onImmediateChange={handleRotationChange}
          />
          <Divider />
          <ScaleInput
            disabled={isReadOnly}
            value={selectedObject.scale}
            onImmediateChange={handleScaleChange}
          />
        </Grid>
      );
    case "STARTING_POINT":
      return (
        <Grid container spacing={2} flexDirection="column">
          <Typography>{t('editor.origin')}</Typography>
          <TranslationInput
            disabled={isReadOnly}
            onImmediateChange={(position) =>
              handleTranslationChangeStartingPoint(position, undefined)
            }
            value={selectedObject.position}
          />
          <Typography>{t('editor.target')}</Typography>
          <TranslationInput
            disabled={isReadOnly}
            onImmediateChange={(target) =>
              handleTranslationChangeStartingPoint(undefined, target)
            }
            value={selectedObject.target}
          />
        </Grid>
      );
    default:
      return null;
  }
}
