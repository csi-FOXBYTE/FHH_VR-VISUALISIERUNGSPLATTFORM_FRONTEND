"use client";
import BaseLayerProvider from "@/components/threeDViewer/BaseLayerProvider";
import "./page.css";
import { ThreeDViewer } from "@/components/threeDViewer";
import { trpc } from "@/server/trpc/client";
import { useParams } from "next/navigation";

export default function ThreeDViewerPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project } = trpc.projectRouter.getFull.useQuery({
    id: projectId,
  });

  if (!project) return "Loading project...";

  return (
    <BaseLayerProvider
      resources={project.includedBaseLayers.map((baseLayer) => ({
        id: baseLayer.id,
        name: baseLayer.name,
        type: baseLayer.type,
        url: baseLayer.href,
      }))}
    >
      <ThreeDViewer />
    </BaseLayerProvider>
  );
}
