import { Cartesian3, Entity, Model } from "cesium";
import { ResiumContext } from "resium";
import { create } from "zustand";

export type ClippingPolygon = {
  type: "CLIPPING_POLYGON";
  positions: { x: number; y: number; z: number }[];
  visible: boolean;
  affectsTerrain: boolean;
  name: string;
  id: string;
};

export type ProjectObject = {
  type: "PROJECT_OBJECT";
  fileContent: Buffer;
  name: string;
  translation: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  scale: { x: number; y: number; z: number };
  attributes: Record<string, string>;
  id: string;
  visible: boolean;
};

export type StartingPoint = {
  type: "STARTING_POINT";
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  visible: boolean;
};

export type VisualAxis = {
  type: "VISUAL_AXIS";
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  visible: boolean;
};

export type Tile3D = {
  type: "TILE_3D";
  id: string;
};

export type SelectedObject = {
  type: (
    | ClippingPolygon
    | ProjectObject
    | StartingPoint
    | VisualAxis
    | Tile3D
  )["type"];
  id: string;
};
export type SelectedObjectResolved =
  | ClippingPolygon
  | ProjectObject
  | StartingPoint
  | VisualAxis
  | Tile3D;

export type ViewerStoreType = {
  ctx: ResiumContext | null;
  setCtx: (ctx: ResiumContext) => void;

  tools: {
    safeCameraZoneVisible: boolean;
    toggleSafeCameraZoneVisibility: () => void;
    pickPoint: () => Promise<{ x: number; y: number; z: number }>;
    pickPolygon: () => Promise<{ x: number; y: number; z: number }[]>;
    shadowVisible: boolean;
    toggleShadowVisibility: () => void;
  };
  updateTools: (tools: Partial<ViewerStoreType["tools"]>) => void;

  clippingPolygons: {
    value: ClippingPolygon[];
    set: (clippingPolgons: ClippingPolygon[]) => void;
    update: (
      clippingPolygon: Partial<ClippingPolygon> & { id: string }
    ) => void;
    delete: (id: string) => void;
    create: () => Promise<void>;
  };

  projectObjects: {
    value: ProjectObject[];
    _importerOpen: boolean;
    toggleImport: () => void;
    toggleVisibility: (id: string) => void;
    set: (projectObjects: ProjectObject[]) => void;
    update: (projectObject: Partial<ProjectObject> & { id: string }) => void;
    delete: (id: string) => void;
    create: () => Promise<void>;
  };

  startingPoints: {
    value: StartingPoint[];
    helpers: {
      flyTo: (startingPoint: StartingPoint) => void;
    };
    set: (startingPoints: StartingPoint[]) => void;
    update: (startingPoint: Partial<StartingPoint> & { id: string }) => void;
    delete: (id: string) => void;
    create: () => Promise<void>;
  };

  visualAxes: {
    value: VisualAxis[];
    helpers: {
      flyTo: (visualAxis: VisualAxis) => void;
    };
    set: (visualAxes: VisualAxis[]) => void;
    update: (visualAxis: Partial<VisualAxis> & { id: string }) => void;
    delete: (id: string) => void;
    create: () => Promise<void>;
  };

  selectedObject: SelectedObject | null; // this is dangerous -> need to get it here
  setSelectedObject: (selectedObject: SelectedObject | null) => void;

  history: {
    undo: () => void;
    redo: () => void;
    takeSnapshot: () => void;
    value: {
      clippingPolygons: ViewerStoreType["clippingPolygons"]["value"];
      startingPoints: ViewerStoreType["startingPoints"]["value"];
      visualAxes: ViewerStoreType["visualAxes"]["value"];
      projectObjects: ViewerStoreType["projectObjects"]["value"];
      selectedObject: ViewerStoreType["selectedObject"];
    }[];
    index: number;
  };

  objectRefs: {
    clippingPolygons: Record<string, Entity>;
    startingPoints: Record<string, Entity>;
    visualAxes: Record<string, Entity>;
    projectObject: Record<string, Model>;
  };
  registerObjectRef: (
    args:
      | { type: ClippingPolygon["type"]; id: string; objectRef: Entity }
      | { type: StartingPoint["type"]; id: string; objectRef: Entity }
      | { type: VisualAxis["type"]; id: string; objectRef: Entity }
      | { type: ProjectObject["type"]; id: string; objectRef: Model }
  ) => void;
  unregisterObjectRef: (args: {
    id: string;
    type:
      | ClippingPolygon["type"]
      | StartingPoint["type"]
      | VisualAxis["type"]
      | ProjectObject["type"];
  }) => void;
};

export function useSelectedObject() {
  const selectedObject = useViewerStore((state) => state.selectedObject);

  const clippingPolygons = useViewerStore(
    (state) => state.clippingPolygons.value
  );
  const startingPoints = useViewerStore((state) => state.startingPoints.value);
  const visualAxes = useViewerStore((state) => state.visualAxes.value);
  const projectObjects = useViewerStore((state) => state.projectObjects.value);

  if (!selectedObject) return null;

  switch (selectedObject.type) {
    case "CLIPPING_POLYGON":
      return clippingPolygons.find((c) => selectedObject.id === c.id) ?? null;
    case "STARTING_POINT":
      return startingPoints.find((c) => selectedObject.id === c.id) ?? null;
    case "VISUAL_AXIS":
      return visualAxes.find((c) => selectedObject.id === c.id) ?? null;
    case "PROJECT_OBJECT":
      return projectObjects.find((c) => selectedObject.id === c.id) ?? null;
    case "TILE_3D":
      console.warn("TILE 3D selection not implemented yet!");
      return null;
  }
}

export const useViewerStore = create<ViewerStoreType>((set, get) => ({
  ctx: null,
  setCtx: (ctx) => {
    set({ ctx });
  },
  clippingPolygons: {
    value: [],
    delete(id) {
      set((state) => {
        const index = state.clippingPolygons.value.findIndex(
          (c) => c.id === id
        );

        if (index === -1) return state;

        const newClippingPolygonValue = state.clippingPolygons.value.slice();
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

        const newClippingPolygonValue = state.clippingPolygons.value.slice();

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
  visualAxes: {
    value: [],
    helpers: {
      flyTo: (visualAxis) => {
        const ctx = get().ctx;

        if (!ctx) throw new Error("Context is undefined!");

        const { camera, viewer } = ctx;

        if (!camera) throw new Error("Camera is undefined!");
        if (!viewer) throw new Error("Viewer is undefined!");

        const destination = new Cartesian3(
          visualAxis.position.x,
          visualAxis.position.y,
          visualAxis.position.z
        );

        const up =
          viewer.scene.globe.ellipsoid.geodeticSurfaceNormal(destination);

        const target = new Cartesian3(
          visualAxis.target.x,
          visualAxis.target.y,
          visualAxis.target.z
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
    async create() {
      const origin = await get().tools.pickPoint();
      const target = await get().tools.pickPoint();

      set((state) => {
        if (!state.ctx?.camera) throw new Error("Camera is undefined!");

        const newVisualAxis = {
          id: crypto.randomUUID(),
          name: `Visual axis ${state.visualAxes.value.length}`,
          position: {
            ...origin,
            z: origin.z + 1.7,
          },
          type: "VISUAL_AXIS",
          target: {
            ...target,
            z: target.z + 1.7,
          },
          visible: true,
        } as const;

        return {
          visualAxes: {
            ...state.visualAxes,
            value: [...state.visualAxes.value, newVisualAxis],
          },
        };
      });

      get().history.takeSnapshot();
    },
    delete(id) {
      set((state) => {
        const index = state.clippingPolygons.value.findIndex(
          (c) => c.id === id
        );

        if (index === -1) return state;

        const newClippingPolygonValue = state.clippingPolygons.value.slice();
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
    set(visualAxes) {
      set((state) => ({
        visualAxes: {
          ...state.visualAxes,
          value: visualAxes,
        },
      }));

      get().history.takeSnapshot();
    },
    update(visualAxis) {
      set((state) => {
        const index = state.visualAxes.value.findIndex(
          (c) => c.id === visualAxis.id
        );

        if (index === -1) return state;

        const newVisualAxesValue = state.visualAxes.value.slice();

        newVisualAxesValue[index] = {
          ...state.visualAxes.value[index],
          ...visualAxis,
        };

        return {
          visualAxes: {
            ...state.visualAxes,
            value: newVisualAxesValue,
          },
        };
      });

      get().history.takeSnapshot();
    },
  },
  startingPoints: {
    helpers: {
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
    value: [],
    async create() {
      const origin = await get().tools.pickPoint();
      const target = await get().tools.pickPoint();

      set((state) => {
        if (!state.ctx?.camera) return {};

        const newStartingPoint = {
          id: crypto.randomUUID(),
          name: "Starting Point " + state.startingPoints.value.length,
          position: {
            ...origin,
            z: origin.z + 1.7,
          },
          type: "STARTING_POINT",
          target: {
            ...target,
            z: target.z + 1.7,
          },
          visible: true,
        } as const;

        return {
          selectedObject: newStartingPoint,
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
        const index = state.startingPoints.value.findIndex((c) => c.id === id);

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
    async create() {},
    set(projectObjects) {
      set((state) => ({
        projectObjects: {
          ...state.projectObjects,
          value: projectObjects,
        },
      }));
    },
    _importerOpen: false,
    toggleVisibility(id) {
      set((state) => {
        const newValue = state.projectObjects.value.slice();

        const foundProjectObjectIndex = newValue.findIndex((p) => p.id === id);

        console.log(foundProjectObjectIndex);

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
        const index = state.projectObjects.value.findIndex((c) => c.id === id);

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
    value: [],
  },
  tools: {
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
    value: [
      {
        clippingPolygons: [],
        projectObjects: [],
        selectedObject: null,
        startingPoints: [],
        visualAxes: [],
      },
    ],
    index: 0,
    takeSnapshot() {
      const {
        history,
        clippingPolygons,
        startingPoints,
        visualAxes,
        projectObjects,
        selectedObject,
      } = get();

      // Trim any redo entries if not at the end
      let newHistory = history.value.slice();
      if (history.index !== history.value.length - 1) {
        newHistory = history.value.slice(0, history.index + 1);
      }

      // Create a shallow snapshot
      const entry = {
        clippingPolygons: clippingPolygons.value.slice(),
        startingPoints: startingPoints.value.slice(),
        visualAxes: visualAxes.value.slice(),
        projectObjects: projectObjects.value.slice(),
        selectedObject: selectedObject ? { ...selectedObject } : null,
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
        visualAxes: {
          ...state.visualAxes,
          value: entry.visualAxes,
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
        visualAxes: {
          ...state.visualAxes,
          value: entry.visualAxes,
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
  },
  registerObjectRef(args) {
    set((state) => {
      switch (args.type) {
        case "CLIPPING_POLYGON":
          return {
            objectRefs: {
              ...state.objectRefs,
              clippingPolygons: {
                [args.id]: args.objectRef,
              },
            },
          };
        case "PROJECT_OBJECT":
          return {
            objectRefs: {
              ...state.objectRefs,
              projectObject: {
                [args.id]: args.objectRef,
              },
            },
          };
        case "STARTING_POINT":
          return {
            objectRefs: {
              ...state.objectRefs,
              startingPoints: {
                [args.id]: args.objectRef,
              },
            },
          };
        case "VISUAL_AXIS":
          return {
            objectRefs: {
              ...state.objectRefs,
              visualAxes: {
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
          const newProjectObjectRefs = { ...state.objectRefs.projectObject };

          delete newProjectObjectRefs[args.id];

          return {
            objectRefs: {
              ...state.objectRefs,
              projectObject: newProjectObjectRefs,
            },
          };
        }
        case "STARTING_POINT": {
          const newStartingPointRefs = { ...state.objectRefs.startingPoints };

          delete newStartingPointRefs[args.id];

          return {
            objectRefs: {
              ...state.objectRefs,
              startingPoints: newStartingPointRefs,
            },
          };
        }
        case "VISUAL_AXIS": {
          const newVisualAxesRefs = { ...state.objectRefs.visualAxes };

          delete newVisualAxesRefs[args.id];

          return {
            objectRefs: {
              ...state.objectRefs,
              visualAxes: newVisualAxesRefs,
            },
          };
        }
      }
    });
  },
}));
