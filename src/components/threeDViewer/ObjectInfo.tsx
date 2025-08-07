import { Divider, Grid, TextField } from "@mui/material";
import { SelectedObjectResolved, useViewerStore } from "./ViewerProvider";
import { useCallback, useEffect, useRef } from "react";
import Attributes from "./Attributes";
import { useTranslations } from "next-intl";
import useIsReadOnly from "./useIsReadOnly";

export default function ObjectInfo({
  selectedObject,
}: {
  selectedObject: SelectedObjectResolved;
}) {
  const t = useTranslations();

  const updateClippingPolygons = useViewerStore(
    (state) => state.clippingPolygons.update
  );
  const updateStartingPoints = useViewerStore(
    (state) => state.startingPoints.update
  );
  const updateProjectObject = useViewerStore(
    (state) => state.projectObjects.update
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const descriptionRef = useRef<HTMLInputElement>(null);

  const isReadOnly = useIsReadOnly();

  useEffect(() => {
    if (selectedObject.type === "TILE_3D") return;

    if (!inputRef.current) return;

    inputRef.current.value = selectedObject.name;
    if (selectedObject.type === "STARTING_POINT" && descriptionRef.current)
      descriptionRef.current.value = selectedObject.description;
  }, [selectedObject]);

  const handleUpdate = useCallback(
    (name?: string, description?: string) => {
      switch (selectedObject.type) {
        case "CLIPPING_POLYGON":
          updateClippingPolygons({
            id: selectedObject.id,
            ...(name ? { name } : {}),
          });
          break;
        case "PROJECT_OBJECT":
          updateProjectObject({
            id: selectedObject.id,
            ...(name ? { name } : {}),
          });
          break;
        case "STARTING_POINT":
          updateStartingPoints({
            id: selectedObject.id,
            ...(name ? { name } : {}),
            ...(description ? { description } : {}),
          });
          break;
      }
    },
    [
      selectedObject.type,
      selectedObject.id,
      updateClippingPolygons,
      updateProjectObject,
      updateStartingPoints,
    ]
  );

  return (
    <Grid
      container
      flexDirection="column"
      width="100%"
      spacing={2}
      height="100%"
    >
      <TextField
        inputRef={inputRef}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;

          handleUpdate((event.target as HTMLInputElement).value);
        }}
        onBlur={(event) => {
          if (event.target.value === selectedObject.name) return;
          handleUpdate(event.target.value);
        }}
        disabled={isReadOnly}
        variant="filled"
        label={t("editor.name")}
        fullWidth
        defaultValue={selectedObject?.name}
      />
      <TextField
        fullWidth
        label={t("editor.description")}
        variant="filled"
        disabled={selectedObject.type !== "STARTING_POINT" || isReadOnly}
        inputRef={descriptionRef}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;

          handleUpdate(undefined, (event.target as HTMLInputElement).value);
        }}
        onBlur={(event) => {
          if (event.target.value === selectedObject.name) return;
          handleUpdate(undefined, event.target.value);
        }}
      />
      {selectedObject.type === "STARTING_POINT" ? (
        <img style={{ width: "100%" }} src={selectedObject.img} />
      ) : null}
      <Divider />
      <Attributes
        disabled={selectedObject.type !== "PROJECT_OBJECT" || isReadOnly}
        value={
          selectedObject.type === "TILE_3D" ||
          selectedObject.type === "PROJECT_OBJECT"
            ? selectedObject.attributes
            : {}
        }
        onChange={(attributes) => {
          if (selectedObject.type !== "PROJECT_OBJECT") return;

          updateProjectObject({ id: selectedObject.id, attributes });
        }}
      />
    </Grid>
  );
}
