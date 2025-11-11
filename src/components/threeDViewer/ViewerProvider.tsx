"use client";

import { getApis } from "@/server/gatewayApi/client";
import { ProjectApi } from "@/server/gatewayApi/generated";
import {
  Cartesian3,
  Cesium3DTileset,
  Ellipsoid,
  Entity,
  Model,
  Rectangle,
} from "cesium";
import { createContext, ReactNode, useContext, useState } from "react";
import { ResiumContext } from "resium";
import { create, StoreApi, UseBoundStore } from "zustand";
import { EnqueueSnackbar, SnackbarKey, useSnackbar } from "notistack";
import { useTranslations, useFormatter } from "next-intl";
import { useConfigurationProviderContext } from "../configuration/ConfigurationProvider";
import { convertTranslationFromCesiumToUserEpsg } from "./TransformInputs/helpers";

export type ClippingPolygon = {
  type: "CLIPPING_POLYGON";
  positions: { x: number; y: number; z: number }[];
  visible: boolean;
  affectsTerrain: boolean;
  name: string;
  id: string;
};

export type ProjectModel = {
  type: "PROJECT_OBJECT";
  href: string;
  name: string;
  translation: { x: number; y: number; z: number };
  uiTranslation: { x: string; y: string; z: string };
  rotation: { x: number; y: number; z: number; w: number };
  uiRotation: { x: string; y: string; z: string };
  scale: { x: number; y: number; z: number };
  uiScale: { x: string; y: string; z: string };
  uiEpsg: string;
  attributes: Record<string, string>;
  id: string;
  visible: boolean;
};

export type StartingPoint = {
  type: "STARTING_POINT";
  id: string;
  name: string;
  description: string;
  img: string;
  position: { x: number; y: number; z: number };
  uiPosition: { x: string; y: string; z: string };
  uiPositionEpsg: string;
  target: { x: number; y: number; z: number };
  uiTarget: { x: string; y: string; z: string };
  uiTargetEpsg: string;
  visible: boolean;
};

export type Tile3D = {
  type: "TILE_3D";
  id: string;
  name: string;
  attributes: Record<string, string>;
};

export type Layer = {
  name: string;
  id: string;
  type: "LAYER";
  projectObjects: ProjectModel[];
  clippingPolygons: ClippingPolygon[];
  selectedBaseLayers: string[];
  selectedExtensionLayers: string[];
};

export type BaseLayer = {
  name: string;
  id: string;
  type: string;
  href: string;
};

export type ExtensionLayer = {
  name: string;
  id: string;
  type: string;
  href: string;
};

export type SelectedObject =
  | {
      type: (ClippingPolygon | ProjectModel | StartingPoint)["type"];
      id: string;
    }
  | Tile3D;
export type SelectedObjectResolved =
  | ClippingPolygon
  | ProjectModel
  | StartingPoint
  | Tile3D;

export type ViewerStoreType = {
  ctx: ResiumContext | null;
  setCtx: (ctx: ResiumContext) => void;

  lastCameraPosition: {
    x: number;
    y: number;
    z: number;
    heading: number;
    pitch: number;
    roll: number;
  } | null;
  saveLastCameraPosition: () => void;

  project: Project;
  updateProject: (
    project: Partial<{ title: string; description: string }>
  ) => Promise<void>;
  saveProject: () => Promise<void>;
  savingBlockerOpen: boolean;

  region: { east: number; north: number; west: number; south: number } | null;
  pickRegion: () => Promise<void>;
  updateRegion: (
    region: { east: number; north: number; west: number; south: number } | null
  ) => void;

  layers: {
    selectedLayerId: string;
    value: Layer[];
    changeToLayer: (id: string) => Promise<void>;
    save: () => void;
    add: () => Layer;
    update: (layer: Partial<Layer> & { id: string }) => void;
    remove: (id: string) => void;
  };

  baseLayers: {
    value: BaseLayer[];
    selected: string[];
    select: (id: string) => void;
    unselect: (id: string) => void;
  };

  extensionLayers: {
    value: ExtensionLayer[];
    selected: string[];
    select: (id: string) => void;
    unselect: (id: string) => void;
  };

  tools: {
    snackbar: {
      enqueue: EnqueueSnackbar;
      close: (key: SnackbarKey) => void;
    };
    translator: {
      t: ReturnType<typeof useTranslations>;
      f: ReturnType<typeof useFormatter>;
    };
    screenshotDialogOpen: boolean;
    screenshotButtonPressedResolve: () => void;
    screenshotButtonPressedReject: () => void;
    takeScreenshot: (startingPoint: {
      position: { x: number; y: number; z: number };
      target: { x: number; y: number; z: number };
    }) => Promise<string | null>;
    safeCameraZoneVisible: boolean;
    toggleSafeCameraZoneVisibility: () => void;
    pickPoint: (
      cb?: (point: { x: number; y: number; z: number }) => void
    ) => Promise<{ x: number; y: number; z: number }>;
    pickPolygon: (
      cb?: (point: { x: number; y: number; z: number }) => void
    ) => Promise<{ x: number; y: number; z: number }[]>;
    shadowVisible: boolean;
    toggleShadowVisibility: () => void;
  };
  updateTools: (tools: Partial<ViewerStoreType["tools"]>) => void;

  clippingPolygons: {
    value: ClippingPolygon[];
    helpers: {
      flyTo: (clippingPolygon: ClippingPolygon) => void;
    };
    set: (clippingPolgons: ClippingPolygon[]) => void;
    update: (
      clippingPolygon: Partial<ClippingPolygon> & { id: string }
    ) => void;
    delete: (id: string) => void;
    create: () => Promise<void>;
  };

  projectObjects: {
    value: ProjectModel[];
    _importerOpen: boolean;
    helpers: {
      flyTo: (projectModel: ProjectModel) => void;
    };
    toggleImport: () => void;
    toggleVisibility: (id: string) => void;
    set: (projectObjects: ProjectModel[]) => void;
    update: (projectObject: Partial<ProjectModel> & { id: string }) => void;
    add: (projectObject: ProjectModel) => void;
    delete: (id: string) => void;
  };

  startingPoints: {
    value: StartingPoint[];
    helpers: {
      flyTo: (directedPoint: {
        target: { x: number; y: number; z: number };
        position: { x: number; y: number; z: number };
      }) => void;
      takeScreenshot: (startingPoint: StartingPoint) => void;
    };
    set: (startingPoints: StartingPoint[]) => void;
    update: (startingPoint: Partial<StartingPoint> & { id: string }) => void;
    delete: (id: string) => void;
    create: () => Promise<void>;
  };

  selectedObject: SelectedObject | null;
  setSelectedObject: (selectedObject: SelectedObject | null) => void;

  history: {
    undo: () => void;
    initialize: () => void;
    redo: () => void;
    takeSnapshot: () => void;
    value: {
      clippingPolygons: ViewerStoreType["clippingPolygons"]["value"];
      startingPoints: ViewerStoreType["startingPoints"]["value"];
      projectObjects: ViewerStoreType["projectObjects"]["value"];
      selectedObject: ViewerStoreType["selectedObject"];
      layers: Pick<ViewerStoreType["layers"], "selectedLayerId" | "value">;
      baseLayers: ViewerStoreType["baseLayers"]["selected"];
      extensionLayers: Pick<
        ViewerStoreType["extensionLayers"],
        "selected" | "value"
      >;
      project: {
        title: string;
        description: string;
      };
    }[];
    index: number;
  };

  objectRefs: {
    clippingPolygons: Record<string, Entity>;
    startingPoints: Record<string, Entity>;
    visualAxes: Record<string, Entity>;
    projectObject: Record<string, Model>;
    tile3Ds: Record<string, Cesium3DTileset>;
  };
  registerObjectRef: (
    args:
      | { type: ClippingPolygon["type"]; id: string; objectRef: Entity }
      | { type: StartingPoint["type"]; id: string; objectRef: Entity }
      | { type: ProjectModel["type"]; id: string; objectRef: Model }
  ) => void;
  unregisterObjectRef: (args: {
    id: string;
    type:
      | ClippingPolygon["type"]
      | StartingPoint["type"]
      | ProjectModel["type"];
  }) => void;
};

export function useSelectedObject() {
  const selectedObject = useViewerStore((state) => state.selectedObject);

  const clippingPolygons = useViewerStore(
    (state) => state.clippingPolygons.value
  );
  const startingPoints = useViewerStore((state) => state.startingPoints.value);
  const projectObjects = useViewerStore((state) => state.projectObjects.value);

  if (!selectedObject) return null;

  switch (selectedObject.type) {
    case "CLIPPING_POLYGON":
      return clippingPolygons.find((c) => selectedObject.id === c.id) ?? null;
    case "STARTING_POINT":
      return startingPoints.find((c) => selectedObject.id === c.id) ?? null;
    case "PROJECT_OBJECT":
      return projectObjects.find((c) => selectedObject.id === c.id) ?? null;
    case "TILE_3D":
      return selectedObject;
  }
}

type Project = Awaited<ReturnType<ProjectApi["projectIdGet"]>>;

const ViewerContext = createContext<UseBoundStore<
  StoreApi<ViewerStoreType>
> | null>(null);

export const ViewerProvider = ({
  children,
  project,
}: {
  children: ReactNode;
  project: Project;
}) => {
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();
  const t = useTranslations();
  const f = useFormatter();
  const configuration = useConfigurationProviderContext();

  const [viewerContext] = useState(() => {
    const store = create<ViewerStoreType>((set, get) => ({
      region: null,
      async pickRegion() {
        try {
          const a = await get().tools.pickPoint();

          const b = await get().tools.pickPoint();

          const rect = Rectangle.fromCartesianArray([
            new Cartesian3(a.x, a.y, a.z),
            new Cartesian3(b.x, b.y, b.z),
          ]);

          get().saveLastCameraPosition();

          set(() => ({
            region: {
              east: rect.east,
              north: rect.north,
              south: rect.south,
              west: rect.west,
            },
          }));
        } catch (e) {
          console.error(e);
        }
      },
      updateRegion(region) {
        set(() => ({
          region,
        }));
      },
      lastCameraPosition: project.camera ? JSON.parse(project.camera) : null,
      saveLastCameraPosition() {
        set((state) => {
          const camera = state.ctx?.camera;

          return {
            lastCameraPosition: camera
              ? {
                  heading: camera.heading,
                  pitch: camera.pitch,
                  roll: camera.roll,
                  x: camera.position.x,
                  y: camera.position.y,
                  z: camera.position.z,
                }
              : null,
          };
        });
      },
      baseLayers: {
        value: project.allAvailableBaseLayers.map((baseLayer) => ({
          href: baseLayer.href,
          id: baseLayer.id,
          name: baseLayer.name,
          type: baseLayer.type,
        })),
        selected: project.layers[0].includedBaseLayers,
        select(id) {
          set((state) => {
            const newSet = new Set(state.baseLayers.selected);

            newSet.add(id);

            state.saveLastCameraPosition();

            return {
              baseLayers: {
                ...state.baseLayers,
                selected: Array.from(newSet),
              },
            };
          });

          get().history.takeSnapshot();
        },
        unselect(id) {
          set((state) => {
            const newSet = new Set(state.baseLayers.selected);

            newSet.delete(id);

            state.saveLastCameraPosition();

            return {
              baseLayers: {
                ...state.baseLayers,
                selected: Array.from(newSet),
              },
            };
          });

          get().history.takeSnapshot();
        },
      },
      extensionLayers: {
        value: project.extensionLayers,
        selected: project.layers[0].includedExtensionLayers,
        select(id) {
          set((state) => {
            const newSet = new Set(state.extensionLayers.selected);

            newSet.add(id);

            state.saveLastCameraPosition();

            return {
              extensionLayers: {
                ...state.extensionLayers,
                selected: Array.from(newSet),
              },
            };
          });

          get().history.takeSnapshot();
        },
        unselect(id) {
          set((state) => {
            const newSet = new Set(state.extensionLayers.selected);

            newSet.delete(id);

            state.saveLastCameraPosition();

            return {
              extensionLayers: {
                ...state.extensionLayers,
                selected: Array.from(newSet),
              },
            };
          });

          get().history.takeSnapshot();
        },
      },
      project,
      savingBlockerOpen: false,
      async updateProject(project) {
        set((state) => ({
          project: {
            ...state.project,
            ...(project.title ? { title: project.title } : {}),
            ...(project.description
              ? { description: project.description }
              : {}),
          },
        }));

        get().history.takeSnapshot();
      },
      async saveProject() {
        const { projectApi } = await getApis();

        set(() => ({
          savingBlockerOpen: true,
        }));

        get().saveLastCameraPosition();

        try {
          get().layers.save();

          const img =
            get().ctx?.viewer?.canvas.toDataURL("image/jpeg", 90) ?? null;

          const project = get().project;

          await projectApi.projectIdPost({
            id: project.id,
            projectIdGet200Response: {
              allAvailableBaseLayers: [],
              camera: get().lastCameraPosition
                ? JSON.stringify(get().lastCameraPosition)
                : null,
              description: project.description,
              id: project.id,
              isReadOnly: false,
              extensionLayers: get().extensionLayers.value,
              img,
              layers: get().layers.value.map((l) => ({
                id: l.id,
                name: l.name,
                includedBaseLayers: l.selectedBaseLayers,
                includedExtensionLayers: l.selectedExtensionLayers,
                projectModels: l.projectObjects.map<
                  Project["layers"][number]["projectModels"][number]
                >((p) => ({
                  attributes: p.attributes,
                  href: p.href,
                  id: p.id,
                  name: p.name,
                  rotation: p.rotation,
                  scale: p.scale,
                  translation: p.translation,
                  uiEpsg: p.uiEpsg,
                  uiRotation: p.uiRotation,
                  uiScale: p.uiScale,
                  uiTranslation: p.uiTranslation,
                })),
                clippingPolygons: l.clippingPolygons.map<
                  Project["layers"][number]["clippingPolygons"][number]
                >((c) => ({
                  affectsTerrain: c.affectsTerrain,
                  id: c.id,
                  name: c.name,
                  points: c.positions,
                })),
              })),
              sasQueryParameters: "",
              title: project.title,
              visualAxes: [],
              startingPoints: get().startingPoints.value.map((s) => ({
                description: s.description,
                endPoint: s.target,
                uiEndPoint: s.uiTarget,
                uiEndPointEpsg: s.uiTargetEpsg,
                startPoint: s.position,
                uiStartPoint: s.uiPosition,
                uiStartPointEpsg: s.uiPositionEpsg,
                id: s.id,
                img: s.img,
                name: s.name,
              })),
            },
          });

          set((state) => ({
            history: {
              ...state.history,
              value: [
                {
                  clippingPolygons: [...state.clippingPolygons.value],
                  projectObjects: [...state.projectObjects.value],
                  selectedObject: state.selectedObject
                    ? { ...state.selectedObject }
                    : null,
                  layers: {
                    selectedLayerId: state.layers.selectedLayerId,
                    value: [...state.layers.value],
                  },
                  startingPoints: [...state.startingPoints.value],
                  baseLayers: [...state.baseLayers.selected],
                  extensionLayers: {
                    selected: state.extensionLayers.selected,
                    value: [...state.extensionLayers.value],
                  },
                  project: {
                    description: state.project.description,
                    title: state.project.title,
                  },
                },
              ],
              index: 0,
            },
          }));
          enqueueSnackbar({
            variant: "success",
            message: t("generic.crud-notifications.save-success", {
              entity: t("entities.project"),
            }),
          });
        } catch (e) {
          enqueueSnackbar({
            variant: "error",
            message: t("generic.crud-notifications.save-failed", {
              entity: t("entities.project"),
            }),
          });
          console.error(e);
        }

        set({ savingBlockerOpen: false });
      },
      layers: {
        save() {
          set((state) => {
            const currentClippingPolygons = [...state.clippingPolygons.value];

            const currentProjectObjects = [...state.projectObjects.value];

            const foundLayerIndex = state.layers.value.findIndex(
              (layer) => layer.id === state.layers.selectedLayerId
            );

            if (foundLayerIndex === -1) throw new Error("No layer found!");

            const newLayer: Layer = {
              ...state.layers.value[foundLayerIndex],
              clippingPolygons: currentClippingPolygons,
              projectObjects: currentProjectObjects,
              selectedBaseLayers: [...state.baseLayers.selected],
              selectedExtensionLayers: [...state.extensionLayers.selected],
            };

            const newLayers = [...state.layers.value];

            newLayers[foundLayerIndex] = newLayer;

            return {
              layers: {
                ...state.layers,
                value: newLayers,
              },
            };
          });
        },
        selectedLayerId: project.layers[0].id,
        value: project.layers.map((layer) => ({
          clippingPolygons: layer.clippingPolygons.map<ClippingPolygon>(
            (c) => ({
              affectsTerrain: c.affectsTerrain,
              id: c.id,
              name: c.name,
              positions: c.points,
              type: "CLIPPING_POLYGON",
              visible: true,
            })
          ),
          selectedBaseLayers: layer.includedBaseLayers,
          selectedExtensionLayers: layer.includedExtensionLayers,
          id: layer.id,
          name: layer.name,
          projectObjects: layer.projectModels.map<ProjectModel>((p) => ({
            attributes: p.attributes,
            href: p.href,
            id: p.id,
            name: p.name,
            type: "PROJECT_OBJECT",
            rotation: p.rotation,
            uiRotation: p.uiRotation,
            scale: p.scale,
            uiScale: p.uiScale,
            translation: p.translation,
            uiTranslation: p.uiTranslation,
            uiEpsg: p.uiEpsg,
            visible: true,
          })),
          type: "LAYER",
        })),
        update(layer) {
          set((state) => {
            const newLayers = [...state.layers.value];

            const newLayerIndex = state.layers.value.findIndex(
              (l) => l.id === layer.id
            );

            if (newLayerIndex === -1) throw new Error("No layer found!");

            newLayers[newLayerIndex] = {
              ...state.layers.value[newLayerIndex],
              ...layer,
            };

            return {
              layers: {
                ...state.layers,
                value: newLayers,
              },
            };
          });

          get().history.takeSnapshot();
        },
        remove(id) {
          set((state) => {
            const newLayers = state.layers.value.filter(
              (layer) => layer.id !== id
            );

            const selectedLayer = newLayers[0];

            return {
              layers: {
                ...state.layers,
                selectedLayerId: selectedLayer.id,
                value: newLayers,
              },
              clippingPolygons: {
                ...state.clippingPolygons,
                value: selectedLayer.clippingPolygons,
              },
              projectObjects: {
                ...state.projectObjects,
                value: selectedLayer.projectObjects,
              },
              baseLayers: {
                ...state.baseLayers,
                selected: selectedLayer.selectedBaseLayers,
              },
              extensionLayers: {
                ...state.extensionLayers,
                selected: selectedLayer.selectedExtensionLayers,
              },
              selectedObject: null,
              objectRefs: {
                ...state.objectRefs,
                clippingPolygons: {},
                projectObject: {},
              },
            };
          });

          get().history.takeSnapshot();
        },
        add() {
          const layerNames = new Set(
            get().layers.value.map((layer) => layer.name)
          );

          let layerName = crypto.randomUUID();

          for (let i = 0; i < 4096; i++) {
            const possibleLayerName = `New layer ${i + 1}`;
            if (!layerNames.has(possibleLayerName)) {
              layerName = possibleLayerName;
              break;
            }
          }

          const layer: Layer = {
            clippingPolygons: [],
            id: crypto.randomUUID(),
            name: layerName,
            projectObjects: [],
            selectedBaseLayers: [],
            selectedExtensionLayers: [],
            type: "LAYER",
          };

          set((state) => {
            return {
              layers: {
                ...state.layers,
                value: [...state.layers.value, layer],
              },
            };
          });

          get().history.takeSnapshot();

          return layer;
        },
        async changeToLayer(id) {
          set((state) => {
            const currentClippingPolygons = [...state.clippingPolygons.value];

            const currentProjectObjects = [...state.projectObjects.value];

            const foundLayerIndex = state.layers.value.findIndex(
              (layer) => layer.id === state.layers.selectedLayerId
            );

            if (foundLayerIndex === -1) throw new Error("No layer found!");

            const newLayer: Layer = {
              ...state.layers.value[foundLayerIndex],
              clippingPolygons: currentClippingPolygons,
              projectObjects: currentProjectObjects,
              selectedBaseLayers: [...state.baseLayers.selected],
              selectedExtensionLayers: [...state.extensionLayers.selected],
            };

            const newLayers = [...state.layers.value];

            newLayers[foundLayerIndex] = newLayer;

            const selectedLayer = state.layers.value.find(
              (layer) => layer.id === id
            );

            if (!selectedLayer) throw new Error("No layer to change to found!");

            return {
              layers: {
                ...state.layers,
                selectedLayerId: id,
                value: newLayers,
              },
              baseLayers: {
                ...state.baseLayers,
                selected: selectedLayer.selectedBaseLayers,
              },
              extensionLayers: {
                ...state.extensionLayers,
                selected: selectedLayer.selectedExtensionLayers,
              },
              clippingPolygons: {
                ...state.clippingPolygons,
                value: selectedLayer.clippingPolygons,
              },
              projectObjects: {
                ...state.projectObjects,
                value: selectedLayer.projectObjects,
              },
              selectedObject: null,
              objectRefs: {
                ...state.objectRefs,
                clippingPolygons: {},
                projectObject: {},
              },
            };
          });

          get().history.takeSnapshot();
        },
      },
      ctx: null,
      setCtx: (ctx) => {
        set({ ctx });
      },
      clippingPolygons: {
        helpers: {
          flyTo(clippingPolygon) {
            const camera = get().ctx?.camera;

            if (!camera) return;

            const cartographic = Ellipsoid.WGS84.cartesianToCartographic(
              new Cartesian3(
                clippingPolygon.positions[0].x,
                clippingPolygon.positions[0].y,
                clippingPolygon.positions[0].z
              )
            );

            cartographic.height += 200;

            camera.flyTo({
              destination:
                Ellipsoid.WGS84.cartographicToCartesian(cartographic),
            });
          },
        },
        value:
          project.layers[0]?.clippingPolygons.map((c) => ({
            affectsTerrain: c.affectsTerrain,
            id: c.id,
            name: c.name,
            positions: c.points,
            type: "CLIPPING_POLYGON",
            visible: true,
          })) ?? [],
        delete(id) {
          set((state) => {
            const index = state.clippingPolygons.value.findIndex(
              (c) => c.id === id
            );

            if (index === -1) return state;

            const newClippingPolygonValue =
              state.clippingPolygons.value.slice();
            newClippingPolygonValue.splice(index, 1);

            return {
              clippingPolygons: {
                ...state.clippingPolygons,
                value: newClippingPolygonValue,
              },
            };
          });

          get().history.takeSnapshot();
        },
        set(clippingPolgons) {
          set((state) => ({
            clippingPolygons: {
              ...state.clippingPolygons,
              value: clippingPolgons,
            },
          }));

          get().history.takeSnapshot();
        },
        update(clippingPolygon) {
          set((state) => {
            const index = state.clippingPolygons.value.findIndex(
              (c) => c.id === clippingPolygon.id
            );

            if (index === -1) return state;

            const newClippingPolygonValue =
              state.clippingPolygons.value.slice();

            newClippingPolygonValue[index] = {
              ...state.clippingPolygons.value[index],
              ...clippingPolygon,
            };

            return {
              clippingPolygons: {
                ...state.clippingPolygons,
                value: newClippingPolygonValue,
              },
            };
          });

          get().history.takeSnapshot();
        },
        async create() {
          const polygon = await get().tools.pickPolygon();

          set((state) => {
            const newPolygon = {
              id: crypto.randomUUID(),
              name: `Clipping polygon ${state.clippingPolygons.value.length}`,
              positions: polygon,
              affectsTerrain: false,
              type: "CLIPPING_POLYGON",
              visible: true,
            } as const;

            return {
              selectedObject: newPolygon,
              clippingPolygons: {
                ...state.clippingPolygons,
                value: [...state.clippingPolygons.value, newPolygon],
              },
            };
          });

          get().history.takeSnapshot();
        },
      },
      startingPoints: {
        helpers: {
          async takeScreenshot(startingPoint) {
            const image = await get().tools.takeScreenshot(startingPoint);

            if (!image) return;

            get().startingPoints.update({ id: startingPoint.id, img: image });
          },
          flyTo: (startingPoint) => {
            const ctx = get().ctx;

            if (!ctx) throw new Error("Context is undefined!");

            const { camera, viewer } = ctx;

            if (!camera) throw new Error("Camera is undefined!");
            if (!viewer) throw new Error("Viewer is undefined!");

            const destination = new Cartesian3(
              startingPoint.position.x,
              startingPoint.position.y,
              startingPoint.position.z
            );

            const up =
              viewer.scene.globe.ellipsoid.geodeticSurfaceNormal(destination);

            const target = new Cartesian3(
              startingPoint.target.x,
              startingPoint.target.y,
              startingPoint.target.z
            );

            const direction = new Cartesian3();

            Cartesian3.subtract(target, destination, direction);
            Cartesian3.normalize(direction, direction);

            camera.cancelFlight();

            camera.setView({
              destination,
              orientation: {
                direction,
                up,
              },
            });
          },
        },
        value: project.startingPoints.map((s) => ({
          id: s.id,
          img: s.img,
          name: s.name,
          position: s.startPoint,
          uiPosition: s.uiStartPoint,
          uiPositionEpsg: s.uiStartPointEpsg,
          target: s.endPoint,
          uiTarget: s.uiEndPoint,
          uiTargetEpsg: s.uiEndPointEpsg,
          description: s.description,
          type: "STARTING_POINT",
          visible: true,
        })),
        async create() {
          const origin = await get().tools.pickPoint();
          const target = await get().tools.pickPoint();

          const uiPosition = convertTranslationFromCesiumToUserEpsg(
            {
              ...origin,
              z: origin.z + 1.7,
            },
            configuration.defaultEPSG
          );

          const uiTarget = convertTranslationFromCesiumToUserEpsg(
            {
              ...target,
              z: target.z + 1.7,
            },
            configuration.defaultEPSG
          );

          const newStartingPoint: StartingPoint = {
            id: crypto.randomUUID(),
            name: "Starting Point " + get().startingPoints.value.length,
            position: {
              ...origin,
              z: origin.z + 1.7,
            },
            uiPosition,
            uiPositionEpsg: configuration.defaultEPSG,
            img: "",
            description: "",
            type: "STARTING_POINT",
            target: {
              ...target,
              z: target.z + 1.7,
            },
            uiTarget,
            uiTargetEpsg: configuration.defaultEPSG,
            visible: true,
          };

          newStartingPoint.img =
            (await get().tools.takeScreenshot(newStartingPoint)) ?? "";

          set((state) => {
            if (!state.ctx?.camera || !state.ctx.viewer) return {};

            return {
              selectedObject: {
                type: "STARTING_POINT",
                id: newStartingPoint.id,
              },
              startingPoints: {
                ...state.startingPoints,
                value: [...state.startingPoints.value, newStartingPoint],
              },
            };
          });

          get().history.takeSnapshot();
        },
        delete(id) {
          set((state) => {
            const index = state.startingPoints.value.findIndex(
              (c) => c.id === id
            );

            if (index === -1) return state;

            const newStartingPointsValue = state.startingPoints.value.slice();
            newStartingPointsValue.splice(index, 1);

            return {
              startingPoints: {
                ...state.startingPoints,
                value: newStartingPointsValue,
              },
            };
          });

          get().history.takeSnapshot();
        },
        set(startingPoints) {
          set((state) => ({
            startingPoints: {
              ...state.startingPoints,
              value: startingPoints,
            },
          }));

          get().history.takeSnapshot();
        },
        update(startingPoint) {
          set((state) => {
            const index = state.startingPoints.value.findIndex(
              (c) => c.id === startingPoint.id
            );

            if (index === -1) return state;

            const newStartingPointsValue = state.startingPoints.value.slice();

            newStartingPointsValue[index] = {
              ...state.startingPoints.value[index],
              ...startingPoint,
            };

            return {
              startingPoints: {
                ...state.startingPoints,
                value: newStartingPointsValue,
              },
            };
          });

          get().history.takeSnapshot();
        },
      },
      projectObjects: {
        async add(projectObject) {
          set((state) => {
            state.history.takeSnapshot();

            return {
              projectObjects: {
                ...state.projectObjects,
                value: [...state.projectObjects.value, projectObject],
              },
            };
          });
        },
        helpers: {
          flyTo(projectModel) {
            const camera = get().ctx?.camera;

            if (!camera) return;

            const cartographic = Ellipsoid.WGS84.cartesianToCartographic(
              new Cartesian3(
                projectModel.translation.x,
                projectModel.translation.y,
                projectModel.translation.z
              )
            );

            cartographic.height += 200;

            camera.flyTo({
              destination:
                Ellipsoid.WGS84.cartographicToCartesian(cartographic),
            });
          },
        },
        set(projectObjects) {
          set((state) => ({
            projectObjects: {
              ...state.projectObjects,
              value: projectObjects,
            },
          }));

          get().history.takeSnapshot();
        },
        _importerOpen: false,
        toggleVisibility(id) {
          set((state) => {
            const newValue = state.projectObjects.value.slice();

            const foundProjectObjectIndex = newValue.findIndex(
              (p) => p.id === id
            );

            if (foundProjectObjectIndex === -1) return {};

            newValue[foundProjectObjectIndex] = {
              ...newValue[foundProjectObjectIndex],
              visible: !newValue[foundProjectObjectIndex].visible,
            };

            return {
              projectObjects: {
                ...state.projectObjects,
                value: newValue,
              },
            };
          });
        },
        toggleImport() {
          set((state) => ({
            projectObjects: {
              ...state.projectObjects,
              _importerOpen: !state.projectObjects._importerOpen,
            },
          }));
        },
        delete(id) {
          set((state) => {
            const index = state.projectObjects.value.findIndex(
              (c) => c.id === id
            );

            if (index === -1) return state;

            const newProjectObjectsValue = state.projectObjects.value.slice();
            newProjectObjectsValue.splice(index, 1);

            return {
              projectObjects: {
                ...state.projectObjects,
                value: newProjectObjectsValue,
              },
            };
          });

          get().history.takeSnapshot();
        },
        update(projectObject) {
          set((state) => {
            const index = state.projectObjects.value.findIndex(
              (c) => c.id === projectObject.id
            );

            if (index === -1) return state;

            const newProjectObjectsValue = state.projectObjects.value.slice();

            newProjectObjectsValue[index] = {
              ...state.projectObjects.value[index],
              ...projectObject,
            };

            return {
              projectObjects: {
                ...state.projectObjects,
                value: newProjectObjectsValue,
              },
            };
          });

          get().history.takeSnapshot();
        },
        value:
          project.layers[0]?.projectModels.map((p) => ({
            attributes: p.attributes,
            id: p.id,
            name: p.name,
            href: p.href,
            rotation: p.rotation,
            uiRotation: p.uiRotation,
            scale: p.scale,
            uiScale: p.uiScale,
            translation: p.translation,
            uiTranslation: p.uiTranslation,
            uiEpsg: p.uiEpsg,
            type: "PROJECT_OBJECT",
            visible: true,
          })) ?? [],
      },
      tools: {
        translator: {
          t,
          f,
        },
        snackbar: {
          close: closeSnackbar,
          enqueue: enqueueSnackbar,
        },
        screenshotButtonPressedResolve() {},
        screenshotButtonPressedReject() {},
        screenshotDialogOpen: false,
        async takeScreenshot(directedPoint: {
          position: { x: number; y: number; z: number };
          target: { x: number; y: number; z: number };
        }) {
          const viewer = get().ctx?.viewer;

          const resiumContainer = document.getElementsByClassName(
            "cesium-viewer"
          )[0].parentNode as HTMLDivElement;

          if (!viewer) return null;

          resiumContainer.style.aspectRatio = "16/9";
          resiumContainer.style.height = "";

          const destination = new Cartesian3(
            directedPoint.position.x,
            directedPoint.position.y,
            directedPoint.position.z
          );

          const up =
            viewer.scene.globe.ellipsoid.geodeticSurfaceNormal(destination);

          const target = new Cartesian3(
            directedPoint.target.x,
            directedPoint.target.y,
            directedPoint.target.z
          );

          const direction = new Cartesian3();

          Cartesian3.subtract(target, destination, direction);
          Cartesian3.normalize(direction, direction);

          viewer.camera.completeFlight();

          viewer.camera.setView({
            destination,
            orientation: {
              direction,
              up,
            },
          });

          let promise: Promise<void>;

          set((state) => {
            let resolve: () => void;
            let reject: () => void;
            promise = new Promise<void>((res, rej) => {
              resolve = res;
              reject = rej;
            });

            return {
              tools: {
                ...state.tools,
                screenshotDialogOpen: true,
                screenshotButtonPressedResolve: resolve!,
                screenshotButtonPressedReject: reject!,
              },
            };
          });

          await promise!;

          viewer.scene.render();

          const rawImage = viewer.canvas.toDataURL("image/jpeg", 0.9);

          const img = new Image();

          const canvas = document.createElement("canvas");

          document.body.appendChild(canvas);

          const ctx = canvas.getContext("2d");

          let resolve: (img: string) => void;
          const p = new Promise<string>((r) => (resolve = r));

          img.onload = () => {
            canvas.width = 640;
            canvas.height = 360;

            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

            resolve(canvas.toDataURL("image/jpeg", 0.8));
          };

          img.src = rawImage;

          const image = await p;

          document.body.removeChild(canvas);

          set((state) => ({
            tools: {
              ...state.tools,
              screenshotButtonPressedReject: () => {},
              screenshotButtonPressedResolve: () => {},
              screenshotDialogOpen: false,
            },
          }));

          resiumContainer.style.aspectRatio = "";
          resiumContainer.style.height = "100%";

          return image;
        },
        async pickPolygon() {
          throw new Error("Not initialized!");
        },
        async pickPoint() {
          throw new Error("Not initialized!");
        },
        safeCameraZoneVisible: false,
        toggleSafeCameraZoneVisibility() {
          set((state) => ({
            tools: {
              ...state.tools,
              safeCameraZoneVisible: !state.tools.safeCameraZoneVisible,
            },
          }));
        },
        shadowVisible: false,
        toggleShadowVisibility() {
          set((state) => {
            const ctx = get().ctx;

            if (!ctx) throw new Error("Context is undefined!");

            const viewer = ctx.viewer;

            if (!viewer) throw new Error("Viewer is undefined!");

            if (state.tools.shadowVisible) {
              viewer.shadows = false;
            } else {
              viewer.shadows = true;
              viewer.shadowMap.softShadows = true;
              viewer.shadowMap.size = 8192;

              viewer.scene.fog.enabled = true;
              viewer.scene.fog.density = 0.0015;
              viewer.scene.fog.visualDensityScalar = 0.7;
              viewer.scene.fog.minimumBrightness = 0.1;
              viewer.scene.fog.screenSpaceErrorFactor = 4;
              viewer.scene.fog.heightScalar = 0.0005;
              viewer.scene.fog.heightFalloff = 0.6;
              viewer.scene.fog.maxHeight = 800000;
            }

            viewer.scene.requestRender();

            return {
              tools: {
                ...state.tools,
                shadowVisible: !state.tools.shadowVisible,
              },
            };
          });
        },
      },
      updateTools: (tools = {}) => {
        set((state) => ({
          tools: {
            ...state.tools,
            ...tools,
          },
        }));
      },
      selectedObject: null,
      setSelectedObject(selectedObject) {
        set(() => ({
          selectedObject: selectedObject ? { ...selectedObject } : null,
        }));
      },
      history: {
        // its not important to set the correct values here since the history gets initialized via initialize()!
        value: [
          {
            clippingPolygons: [],
            projectObjects: [],
            selectedObject: null,
            startingPoints: [],
            baseLayers: [],
            layers: {
              selectedLayerId: "",
              value: [],
            },
            extensionLayers: {
              selected: [],
              value: [],
            },
            project: {
              description: "",
              title: "",
            },
          },
        ],
        index: 0,
        takeSnapshot() {
          const {
            history,
            clippingPolygons,
            baseLayers,
            extensionLayers,
            startingPoints,
            projectObjects,
            selectedObject,
            layers,
          } = get();

          // Trim any redo entries if not at the end
          let newHistory = history.value.slice();
          if (history.index !== history.value.length - 1) {
            newHistory = history.value.slice(0, history.index + 1);
          }

          // Create a shallow snapshot
          const entry: ViewerStoreType["history"]["value"][number] = {
            clippingPolygons: clippingPolygons.value.slice(),
            startingPoints: startingPoints.value.slice(),
            projectObjects: projectObjects.value.slice(),
            selectedObject: selectedObject ? { ...selectedObject } : null,
            baseLayers: [...baseLayers.selected],
            layers: {
              selectedLayerId: layers.selectedLayerId,
              value: [...layers.value],
            },
            extensionLayers: {
              selected: [...extensionLayers.selected],
              value: [...extensionLayers.value],
            },
            project: {
              title: project.title,
              description: project.description,
            },
          };

          newHistory = [...newHistory, entry];
          const newIndex = newHistory.length - 1;

          // Update history slice preserving methods
          set((state) => ({
            history: {
              ...state.history,
              value: newHistory,
              index: newIndex,
            },
          }));
        },
        initialize() {
          set((state) => ({
            history: {
              ...state.history,
              value: [
                {
                  clippingPolygons: state.clippingPolygons.value.map((s) => ({
                    ...s,
                  })),
                  project: {
                    description: state.project.description,
                    title: state.project.title,
                  },
                  layers: {
                    selectedLayerId: state.layers.selectedLayerId,
                    value: [...state.layers.value],
                  },
                  baseLayers: [...state.baseLayers.selected],
                  extensionLayers: {
                    selected: [...state.extensionLayers.selected],
                    value: [...state.extensionLayers.value],
                  },
                  projectObjects: state.projectObjects.value.map((s) => ({
                    ...s,
                  })),
                  selectedObject: state.selectedObject,
                  startingPoints: state.startingPoints.value.map((s) => ({
                    ...s,
                  })),
                },
              ],
            },
          }));
        },
        undo() {
          const state = get();
          const { history } = state;
          const prevIndex = history.index - 1;
          if (prevIndex < 0) return;

          const entry = history.value[prevIndex];
          if (!entry) return;

          set((state) => ({
            clippingPolygons: {
              ...state.clippingPolygons,
              value: entry.clippingPolygons,
            },
            startingPoints: {
              ...state.startingPoints,
              value: entry.startingPoints,
            },
            layers: {
              ...state.layers,
              ...entry.layers,
            },
            baseLayers: {
              ...state.baseLayers,
              selected: entry.baseLayers,
            },
            extensionLayers: {
              ...state.extensionLayers,
              ...entry.extensionLayers,
            },
            projectObjects: {
              ...state.projectObjects,
              value: entry.projectObjects,
            },
            selectedObject: entry.selectedObject,
            history: {
              ...state.history,
              index: prevIndex,
            },
          }));
        },

        redo() {
          const state = get();
          const { history } = state;
          const nextIndex = history.index + 1;
          if (nextIndex >= history.value.length) return;

          const entry = history.value[nextIndex];
          if (!entry) return;

          set((state) => ({
            clippingPolygons: {
              ...state.clippingPolygons,
              value: entry.clippingPolygons,
            },
            startingPoints: {
              ...state.startingPoints,
              value: entry.startingPoints,
            },
            baseLayers: {
              ...state.baseLayers,
              selected: entry.baseLayers,
            },
            layers: {
              ...state.layers,
              ...entry.layers,
            },
            extensionLayers: {
              ...state.extensionLayers,
              ...entry.extensionLayers,
            },
            projectObjects: {
              ...state.projectObjects,
              value: entry.projectObjects,
            },
            selectedObject: entry.selectedObject,
            history: {
              ...state.history,
              index: nextIndex,
            },
          }));
        },
      },
      objectRefs: {
        clippingPolygons: {},
        projectObject: {},
        startingPoints: {},
        visualAxes: {},
        tile3Ds: {},
      },
      registerObjectRef(args) {
        set((state) => {
          switch (args.type) {
            case "CLIPPING_POLYGON":
              return {
                objectRefs: {
                  ...state.objectRefs,
                  clippingPolygons: {
                    ...state.objectRefs.clippingPolygons,
                    [args.id]: args.objectRef,
                  },
                },
              };
            case "PROJECT_OBJECT":
              return {
                objectRefs: {
                  ...state.objectRefs,
                  projectObject: {
                    ...state.objectRefs.projectObject,
                    [args.id]: args.objectRef,
                  },
                },
              };
            case "STARTING_POINT":
              return {
                objectRefs: {
                  ...state.objectRefs,
                  startingPoints: {
                    ...state.objectRefs.startingPoints,
                    [args.id]: args.objectRef,
                  },
                },
              };
          }
        });
      },
      unregisterObjectRef(args) {
        set((state) => {
          switch (args.type) {
            case "CLIPPING_POLYGON": {
              const newClippingPolygonRefs = {
                ...state.objectRefs.clippingPolygons,
              };

              delete newClippingPolygonRefs[args.id];

              return {
                objectRefs: {
                  ...state.objectRefs,
                  clippingPolygons: newClippingPolygonRefs,
                },
              };
            }
            case "PROJECT_OBJECT": {
              const newProjectObjectRefs = {
                ...state.objectRefs.projectObject,
              };

              delete newProjectObjectRefs[args.id];

              return {
                objectRefs: {
                  ...state.objectRefs,
                  projectObject: newProjectObjectRefs,
                },
              };
            }
            case "STARTING_POINT": {
              const newStartingPointRefs = {
                ...state.objectRefs.startingPoints,
              };

              delete newStartingPointRefs[args.id];

              return {
                objectRefs: {
                  ...state.objectRefs,
                  startingPoints: newStartingPointRefs,
                },
              };
            }
          }
        });
      },
    }));

    store.getState().history.initialize();

    return store;
  });

  return (
    <ViewerContext.Provider value={viewerContext}>
      {children}
    </ViewerContext.Provider>
  );
};

export const useViewerStore = ((selector?: any) => {
  const viewerContext = useContext(ViewerContext);

  if (!viewerContext) throw new Error("No viewercontext provided!");

  if (selector) return viewerContext(selector);

  return viewerContext(selector);
}) as UseBoundStore<StoreApi<ViewerStoreType>>;
