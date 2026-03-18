"use server";

import { PermissionsBlocker } from "@/permissions/PermissionsBlocker";
import { HydrateClient } from "@/server/trpc/server";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReactNode } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return { title: t("navigation.project-management") };
}

export default async function ProjectManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <HydrateClient>
      <PermissionsBlocker neededPermissions={["PROJECT_OWNER"]}>
        {children}
      </PermissionsBlocker>
    </HydrateClient>
  );
}
