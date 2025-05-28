"use server";

import { HydrateClient } from "@/server/trpc/server";
import { getTranslations } from "next-intl/server";
import { ReactNode } from "react";

export async function generateMetadata() {
  const t = await getTranslations();

  return { title: t("navigation.3d-viewer") };
}

export default async function ThreeDViewerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <HydrateClient>{children}</HydrateClient>;
}
