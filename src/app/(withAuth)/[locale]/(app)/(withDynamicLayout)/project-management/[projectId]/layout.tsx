"use server";

import { ViewerProvider } from "@/components/threeDViewer/ViewerProvider";
import { getApis } from "@/server/gatewayApi/client";
import { getTranslations } from "next-intl/server";
import { ReactNode } from "react";

export async function generateMetadata() {
  const t = await getTranslations();

  return { title: t("navigation.editor") };
}

export default async function ThreeDViewerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const apis = await getApis();

  try {
    const project = await apis.projectApi.projectIdGet({
      id: (await params).projectId,
    });

    return <ViewerProvider project={project}>{children}</ViewerProvider>;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
