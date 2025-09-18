"use client";
import { ThreeDViewer } from "@/components/threeDViewer";
import BaseLayerProvider from "@/components/threeDViewer/BaseLayerProvider";
import "./page.css";
import { useViewerStore } from "@/components/threeDViewer/ViewerProvider";
import { unstable_noStore } from "next/cache";

export default function ThreeDViewerPage() {
  const baseLayers = useViewerStore((state) => state.baseLayers);

  unstable_noStore();

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
