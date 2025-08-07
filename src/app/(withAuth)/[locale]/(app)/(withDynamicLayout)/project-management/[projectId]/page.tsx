"use client";
import { ThreeDViewer } from "@/components/threeDViewer";
import BaseLayerProvider from "@/components/threeDViewer/BaseLayerProvider";
import "./page.css";
import { useViewerStore } from "@/components/threeDViewer/ViewerProvider";

export default function ThreeDViewerPage() {
  const baseLayers = useViewerStore((state) => state.baseLayers);

  return (
    <BaseLayerProvider
      resources={baseLayers.value
        .filter((baseLayer) => baseLayers.selected.includes(baseLayer.id))
        .map((baseLayer) => ({
          id: baseLayer.id,
          name: baseLayer.name,
          type: baseLayer.type as "TERRAIN",
          url: baseLayer.href!,
        }))}
    >
      <ThreeDViewer />
    </BaseLayerProvider>
  );
}
