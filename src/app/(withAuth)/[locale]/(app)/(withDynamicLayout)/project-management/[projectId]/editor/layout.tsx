"use server";

import { HydrateClient, trpc } from "@/server/trpc/server";
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
  await trpc.projectRouter.getFull({ id: (await params).projectId });

  return <HydrateClient>{children}</HydrateClient>;
}
