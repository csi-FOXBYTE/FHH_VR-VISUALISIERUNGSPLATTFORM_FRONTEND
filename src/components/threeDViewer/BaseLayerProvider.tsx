import * as Cesium from "cesium";
import { createContext, ReactNode, useContext, useRef } from "react";

type TileSetLayer = {
  name: string;
  id: string;
  resource: Cesium.Resource;
};

type TerrainLayer = {
  name: string;
  id: string;
  resource: Promise<Cesium.TerrainProvider>;
};

type ImageryLayer = {
  name: string;
  id: string;
  resource: Cesium.ImageryProvider;
};

type BaseLayerProviderContextType = {
  tileSets: TileSetLayer[];
  terrain: TerrainLayer | undefined;
  imageries: ImageryLayer[];
};

const BaseLayerProviderContext = createContext<BaseLayerProviderContextType>({
  imageries: [],
  terrain: undefined,
  tileSets: [],
});

export default function BaseLayerProvider({
  children,
  resources,
}: {
  children: ReactNode;
  resources: {
    id: string;
    name: string;
    url: string;
    type: "TERRAIN" | "3D-TILES" | "IMAGERY";
  }[];
}) {
  const providerRef = useRef((() => {
    const result: BaseLayerProviderContextType = {
      imageries: [],
      terrain: undefined,
      tileSets: [],
    };

    for (const resource of resources) {
      switch (resource.type) {
        case "3D-TILES":
          result.tileSets.push({
            id: resource.id,
            name: resource.name,
            resource: new Cesium.Resource({ url: resource.url }),
          });
          break;
        case "TERRAIN":
          result.terrain = {
            id: resource.id,
            name: resource.name,
            resource: Cesium.CesiumTerrainProvider.fromUrl(
              new Cesium.Resource({ url: resource.url }),
              {
                requestVertexNormals: true,
              }
            ),
          };
          break;
        case "IMAGERY":
          result.imageries.push({
            id: resource.id,
            name: resource.name,
            resource: new Cesium.UrlTemplateImageryProvider({
              url: resource.url,
            }),
          });
          break;
      }
    }

    return result;
  })());

  return (
    <BaseLayerProviderContext.Provider value={providerRef.current}>
      {children}
    </BaseLayerProviderContext.Provider>
  );
}

export function useBaseLayerProviderContext() {
  const ctx = useContext(BaseLayerProviderContext);

  if (!ctx) throw new Error("Must be called from within a BaseLayerProvider!");

  return ctx;
}
