import * as Cesium from "cesium";
import { useTranslations } from "next-intl";
import { useSnackbar } from "notistack";
import { createContext, ReactNode, useContext, useMemo } from "react";

type TileSetLayer = {
  name: string;
  id: string;
  resource: Cesium.Resource;
};

type TerrainLayer = {
  name: string;
  id: string;
  resource: Promise<Cesium.TerrainProvider | undefined>;
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
    type: "TERRAIN" | "TILES3D" | "IMAGERY";
  }[];
}) {
  const { enqueueSnackbar } = useSnackbar();

  const t = useTranslations();

  const providers = useMemo(() => {
    const result: BaseLayerProviderContextType = {
      imageries: [],
      terrain: undefined,
      tileSets: [],
    };

    for (const resource of resources) {
      switch (resource.type) {
        case "TILES3D":
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
            ).catch(() => {
              enqueueSnackbar({
                key: `terrain-error-${resource.id}`,
                variant: "error",
                preventDuplicate: true,
                message: t("editor.selected-terrain-invalid"),
              });
              return undefined;
            }),
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
  }, [resources]);

  return (
    <BaseLayerProviderContext.Provider value={providers}>
      {children}
    </BaseLayerProviderContext.Provider>
  );
}

export function useBaseLayerProviderContext() {
  const ctx = useContext(BaseLayerProviderContext);

  if (!ctx) throw new Error("Must be called from within a BaseLayerProvider!");

  return ctx;
}
