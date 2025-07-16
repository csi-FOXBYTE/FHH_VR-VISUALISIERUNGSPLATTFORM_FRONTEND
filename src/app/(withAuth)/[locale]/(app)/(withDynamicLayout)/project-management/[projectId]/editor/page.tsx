"use client";
import { ThreeDViewer } from "@/components/threeDViewer";
import BaseLayerProvider from "@/components/threeDViewer/BaseLayerProvider";
import { trpc } from "@/server/trpc/client";
import {
  CircularProgress,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import "./page.css";

export default function ThreeDViewerPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project } = trpc.projectRouter.getFull.useQuery({
    id: projectId,
  });

  if (!project)
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        spacing={8}
        sx={{ width: "100vw", height: "100vh" }}
      >
        <Typography variant="h3">Loading project</Typography>
        <LinearProgress
          variant="indeterminate"
          sx={{ height: 10, width: 300 }}
        />
      </Grid>
    );

  return (
    <BaseLayerProvider
      resources={project.includedBaseLayers.map((baseLayer) => ({
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
