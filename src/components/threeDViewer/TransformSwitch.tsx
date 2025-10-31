import { Divider, Grid, keyframes, Typography } from "@mui/material";
import { Cartesian3, ConstantPositionProperty, Quaternion } from "cesium";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useCesium } from "resium";
import { createModelMatrixFromModelMatrixAndOptionalTranslationOrRotationOrScale } from "./TransformInputs/helpers";
import RotationInput from "./TransformInputs/RotationInput";
import ScaleInput from "./TransformInputs/ScaleInput";
import TranslationInput from "./TransformInputs/TranslationInput";
import {
  ProjectModel,
  SelectedObjectResolved,
  StartingPoint,
  useViewerStore,
} from "./ViewerProvider";
import useIsReadOnly from "./useIsReadOnly";
import { useTranslations } from "next-intl";

type PartialProjectModel = Partial<
  Pick<
    ProjectModel,
    | "translation"
    | "rotation"
    | "scale"
    | "uiRotation"
    | "uiScale"
    | "uiTranslation"
    | "uiEpsg"
  >
>;

type PartialStartingPointTransform = Partial<
  Pick<
    StartingPoint,
    | "position"
    | "uiPosition"
    | "uiPositionEpsg"
    | "target"
    | "uiTarget"
    | "uiTargetEpsg"
  >
>;

function removeUndefinedValues<T extends Record<string, unknown | undefined>>(
  record: T
): T {
  return Object.fromEntries(
    Object.entries(record).filter(([_, value]) => value !== undefined)
  ) as T;
}

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

  const transformsMap = useMemo(() => {
    return new Map<string, PartialProjectModel>();
  }, []);

  const handleUpdateProjectObject = (
    id: string,
    newTransform: PartialProjectModel
  ) => {
    window.clearTimeout(timerRef.current.timer);

    if (!transformsMap.has(id)) transformsMap.set(id, {});

    const transform = transformsMap.get(id)!;

    transformsMap.set(id, { ...transform, ...newTransform });

    const newTimer = window.setTimeout(() => {
      updateProjectObject({
        id,
        ...transformsMap.get(id),
      });
      console.log({ ...transformsMap.get(id) });
      transformsMap.delete(id);
    }, 500);

    timerRef.current.timer = newTimer;
  };

  const handleTranslationChange = useCallback(
    ({
      value,
      uiValue,
      uiEpsg,
    }: {
      value?: { x: number; y: number; z: number };
      uiValue: { x: string; y: string; z: string };
      uiEpsg: string;
    }) => {
      if (selectedObject.type !== "PROJECT_OBJECT") return;
      if (!objectRefs.projectObject[selectedObject.id]) return;

      if (value)
        objectRefs.projectObject[selectedObject.id].modelMatrix =
          createModelMatrixFromModelMatrixAndOptionalTranslationOrRotationOrScale(
            objectRefs.projectObject[selectedObject.id].modelMatrix,
            new Cartesian3(value.x, value.y, value.z),
            undefined,
            undefined
          );

      viewer?.scene.requestRender();

      handleUpdateProjectObject(
        selectedObject.id,
        removeUndefinedValues({
          translation: value,
          uiTranslation: uiValue,
          uiEpsg: uiEpsg,
        })
      );
    },
    [
      objectRefs.projectObject,
      selectedObject.type,
      selectedObject.id,
      viewer?.scene,
    ]
  );

  const handleRotationChange = useCallback(
    ({
      value,
      uiValue,
    }: {
      value?: { x: number; y: number; z: number; w: number };
      uiValue: { x: string; y: string; z: string };
    }) => {
      if (selectedObject.type !== "PROJECT_OBJECT") return;
      if (!objectRefs.projectObject[selectedObject.id]) return;

      if (value)
        objectRefs.projectObject[selectedObject.id].modelMatrix =
          createModelMatrixFromModelMatrixAndOptionalTranslationOrRotationOrScale(
            objectRefs.projectObject[selectedObject.id].modelMatrix,
            undefined,
            new Quaternion(value.x, value.y, value.z, value.w),
            undefined
          );

      viewer?.scene.requestRender();

      handleUpdateProjectObject(
        selectedObject.id,
        removeUndefinedValues({
          rotation: value,
          uiRotation: uiValue,
        })
      );
    },
    [
      objectRefs.projectObject,
      selectedObject.type,
      selectedObject.id,
      viewer?.scene,
    ]
  );

  const handleScaleChange = useCallback(
    ({
      value,
      uiValue,
    }: {
      value?: { x: number; y: number; z: number };
      uiValue: { x: string; y: string; z: string };
    }) => {
      if (selectedObject.type !== "PROJECT_OBJECT") return;
      if (!objectRefs.projectObject[selectedObject.id]) return;

      if (value)
        objectRefs.projectObject[selectedObject.id].modelMatrix =
          createModelMatrixFromModelMatrixAndOptionalTranslationOrRotationOrScale(
            objectRefs.projectObject[selectedObject.id].modelMatrix,
            undefined,
            undefined,
            new Cartesian3(value.x, value.y, value.z)
          );

      viewer?.scene.requestRender();

      handleUpdateProjectObject(
        selectedObject.id,
        removeUndefinedValues({
          scale: value,
          uiScale: uiValue,
        })
      );
    },
    [
      objectRefs.projectObject,
      selectedObject.type,
      selectedObject.id,
      viewer?.scene,
    ]
  );

  const transformsMapStartingPoints = useMemo(
    () => new Map<string, PartialStartingPointTransform>(),
    []
  );

  const handleTranslationChangeStartingPoint = useCallback(
    (transform: PartialStartingPointTransform) => {
      if (!objectRefs.startingPoints[selectedObject.id]) return;

      const transformMap =
        transformsMapStartingPoints.get(selectedObject.id) ?? {};

      if (transform.position)
        objectRefs.startingPoints[selectedObject.id].position =
          new ConstantPositionProperty(
            new Cartesian3(
              transform.position.x,
              transform.position.y,
              transform.position.z
            ),
            objectRefs.startingPoints[
              selectedObject.id
            ].position?.referenceFrame
          );

      transformsMapStartingPoints.set(selectedObject.id, {
        ...transformMap,
        ...transform,
      });

      viewer?.scene.requestRender();

      window.clearTimeout(timerRef.current.timer);

      timerRef.current.timer = window.setTimeout(() => {
        if (!transformsMapStartingPoints.has(selectedObject.id)) return;

        updateStartingPoint(
          removeUndefinedValues({
            id: selectedObject.id,
            ...transformsMapStartingPoints.get(selectedObject.id),
          })
        );

        transformsMapStartingPoints.delete(selectedObject.id);
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
            uiValue={selectedObject.uiTranslation}
            uiEpsg={selectedObject.uiEpsg}
            onChange={handleTranslationChange}
          />
          <Divider />
          <RotationInput
            disabled={isReadOnly}
            uiValue={selectedObject.uiRotation}
            origin={selectedObject.translation}
            onChange={handleRotationChange}
          />
          <Divider />
          <ScaleInput
            disabled={isReadOnly}
            uiValue={selectedObject.uiScale}
            onChange={handleScaleChange}
          />
        </Grid>
      );
    case "STARTING_POINT":
      return (
        <Grid container spacing={2} flexDirection="column">
          <Typography>{t("editor.origin")}</Typography>
          <TranslationInput
            disabled={isReadOnly}
            onChange={({ uiEpsg, uiValue, value }) =>
              handleTranslationChangeStartingPoint({
                position: value,
                uiPosition: uiValue,
                uiPositionEpsg: uiEpsg,
              })
            }
            uiEpsg={selectedObject.uiPositionEpsg}
            uiValue={selectedObject.uiPosition}
          />
          <Typography>{t("editor.target")}</Typography>
          <TranslationInput
            disabled={isReadOnly}
            onChange={({ uiEpsg, uiValue, value }) =>
              handleTranslationChangeStartingPoint({
                target: value,
                uiTarget: uiValue,
                uiTargetEpsg: uiEpsg,
              })
            }
            uiEpsg={selectedObject.uiTargetEpsg}
            uiValue={selectedObject.uiTarget}
          />
        </Grid>
      );
    default:
      return null;
  }
}
