"use server";
import {
  ViewerProvider
} from "@/components/threeDViewer/ViewerProvider";
import Wrapper from "@/components/threeDViewer/Wrapper";
import { getApis } from "@/server/gatewayApi/client";
// import "./page.css";

export default async function ThreeDViewerPage(props: { params: Promise<{ projectId: string }>}) {
  const apis = await getApis();

  const params =  await props.params;

  const project = await apis.projectApi.projectIdGet(
    {
      id: params.projectId,
    },
    {
      cache: "no-store",
    }
  );

  return (
    <ViewerProvider project={project}>
      <Wrapper />
    </ViewerProvider>
  );
}
