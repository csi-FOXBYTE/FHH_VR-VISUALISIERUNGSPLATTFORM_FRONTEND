import * as Cesium from "cesium";
import { useSnackbar } from "notistack";
import { useCallback, useEffect } from "react";
import { useCesium } from "resium";
import { useViewerStore } from "./ViewerProvider";

export default function ToolsProvider() {
  const { viewer } = useCesium();

  const updateTools = useViewerStore((state) => state.updateTools);

  const pickPointOnTerrain = useCallback(
    async (clientX: number, clientY: number, viewer: Cesium.Viewer) => {
      const { x, y } = viewer.canvas.getBoundingClientRect();

      const ray = viewer.camera.getPickRay(
        new Cesium.Cartesian2(clientX - x, clientY - y)
      );

      if (!ray) return null;

      const onEllipsoid = viewer.scene.globe.pick(ray, viewer.scene);

      if (!onEllipsoid) return null;

      const carto = Cesium.Cartographic.fromCartesian(onEllipsoid);

      let worldPositions: Cesium.Cartographic[] | null = null;

      try {
        worldPositions = await Cesium.sampleTerrainMostDetailed(
          viewer.terrainProvider,
          [carto]
        );
      } catch {
        for (let i = 16; i >= 0; i--) {
          try {
            worldPositions = await Cesium.sampleTerrain(
              viewer.terrainProvider,
              16,
              [carto]
            );
            break;
          } catch {}
        }
      }

      if (!worldPositions) throw new Error("Could not get world positions!");

      const ellipsoid = viewer.scene.globe.ellipsoid;

      return worldPositions.map((p) => ellipsoid.cartographicToCartesian(p))[0];
    },
    []
  );

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const pickPolygon = useCallback(async () => {
    if (!viewer) throw new Error("Viewer not initialized!");

    document.body.style.cursor = "crosshair";

    const snackId = crypto.randomUUID();

    enqueueSnackbar({
      key: snackId,
      autoHideDuration: null,
      variant: "info",
      persist: true,
      message:
        "To close the picked polygon press right click. To abort either click outside the viewer or press escape.",
    });

    const abortController = new AbortController();

    const resolveRef: {
      ref: (value: { x: number; y: number; z: number }[]) => void;
    } = { ref: () => {} };
    const rejectRef: { ref: (reason: unknown) => void } = { ref: () => {} };

    try {
      const points: Cesium.Cartesian3[] = [];

      const entity = viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(() => {
            return points;
          }, false),
          width: 10,
          material: new Cesium.PolylineArrowMaterialProperty(
            Cesium.Color.YELLOW
          ),
          clampToGround: true,
        },
      });

      const clickHandler = async (event: MouseEvent) => {
        const point = await pickPointOnTerrain(
          event.clientX,
          event.clientY,
          viewer
        );

        if (!point) return;

        points.push(point);

        viewer.render();
      };

      viewer.canvas.addEventListener("click", clickHandler, {
        signal: abortController.signal,
      });

      const contextMenuHandler = async () => {
        resolveRef.ref(points);
      };

      viewer.canvas.addEventListener("contextmenu", contextMenuHandler, {
        signal: abortController.signal,
      });

      const clickAwayHandler = (event: MouseEvent) => {
        if (!event.composedPath().includes(viewer.canvas)) {
          console.log(event.composedPath(), viewer.canvas);
          rejectRef.ref("Aborted by user!");
        }
      };

      document.addEventListener("click", clickAwayHandler, {
        signal: abortController.signal,
      });

      const escapeHandler = (event: KeyboardEvent) => {
        if (event.code === "Escape") rejectRef.ref("Aborted by user!");
      };

      document.addEventListener("keydown", escapeHandler, {
        signal: abortController.signal,
      });

      return new Promise<{ x: number; y: number; z: number }[]>(
        (resolve, reject) => {
          resolveRef.ref = (value) => {
            closeSnackbar(snackId);
            document.body.style.cursor = "auto";
            viewer.entities.remove(entity);
            abortController.abort();
            resolve(value);
            closeSnackbar(snackId);
          };
          rejectRef.ref = (reason) => {
            closeSnackbar(snackId);
            document.body.style.cursor = "auto";
            viewer.entities.remove(entity);
            abortController.abort();
            reject(reason);
            closeSnackbar(snackId);
          };
        }
      );
    } catch (e) {
      closeSnackbar(snackId);
      document.body.style.cursor = "auto";
      throw e;
    }
  }, [closeSnackbar, enqueueSnackbar, pickPointOnTerrain, viewer]);

  const pickPoint = useCallback(
    async (cb?: (point: { x: number; y: number; z: number }) => void) => {
      if (!viewer) throw new Error("Viewer not initialized!");

      const abortController = new AbortController();

      document.body.style.cursor = "crosshair";

      const snackId = crypto.randomUUID();

      enqueueSnackbar({
        key: snackId,
        autoHideDuration: null,
        variant: "info",
        persist: true,
        message:
          "To abort either picking a point click outside the viewer or press escape.",
      });

      try {
        const resolveRef: {
          ref: (value: { x: number; y: number; z: number }) => void;
        } = { ref: () => {} };
        const rejectRef: { ref: (reason: unknown) => void } = { ref: () => {} };

        let mouseMoveRafId = -1;

        const handleMouseMove = async (event: MouseEvent) => {
          window.cancelAnimationFrame(mouseMoveRafId);
          mouseMoveRafId = window.requestAnimationFrame(() =>
            handleMouseMoveCallback(event.clientX, event.clientY)
          );
        };

        const handleMouseMoveCallback = async (x: number, y: number) => {
          try {
            const point = await pickPointOnTerrain(x, y, viewer);
            if (point) cb?.(point);
          } catch {}
        };

        const handler = async (event: MouseEvent) => {
          try {
            const point = await pickPointOnTerrain(
              event.clientX,
              event.clientY,
              viewer
            );

            if (!point) throw new Error("No point on terrain found!");

            resolveRef.ref(point);
          } catch (e) {
            rejectRef.ref(e);
          }
        };

        viewer.canvas.addEventListener("mousemove", handleMouseMove, {
          signal: abortController.signal,
        });

        viewer.canvas.addEventListener("click", handler, {
          signal: abortController.signal,
        });

        const clickAwayHandler = (event: MouseEvent) => {
          if (!event.composedPath().includes(viewer.canvas)) {
            console.log(event.composedPath(), viewer.canvas);
            rejectRef.ref("Aborted by user!");
          }
        };

        document.addEventListener("click", clickAwayHandler, {
          signal: abortController.signal,
        });

        const escapeHandler = (event: KeyboardEvent) => {
          if (event.code === "Escape") rejectRef.ref("Aborted by user!");
        };

        document.addEventListener("keydown", escapeHandler, {
          signal: abortController.signal,
        });

        return new Promise<{ x: number; y: number; z: number }>(
          (resolve, reject) => {
            resolveRef.ref = (value) => {
              closeSnackbar(snackId);
              document.body.style.cursor = "auto";
              abortController.abort();
              resolve(value);
            };
            rejectRef.ref = (reason) => {
              closeSnackbar(snackId);
              document.body.style.cursor = "auto";
              abortController.abort();
              reject(reason);
            };
          }
        );
      } catch (e) {
        closeSnackbar(snackId);
        document.body.style.cursor = "auto";
        throw e;
      }
    },
    [viewer, enqueueSnackbar, pickPointOnTerrain, closeSnackbar]
  );

  useEffect(() => {
    updateTools({
      pickPolygon,
      pickPoint,
    });
  }, [pickPolygon, pickPoint, updateTools]);

  return null;
}
