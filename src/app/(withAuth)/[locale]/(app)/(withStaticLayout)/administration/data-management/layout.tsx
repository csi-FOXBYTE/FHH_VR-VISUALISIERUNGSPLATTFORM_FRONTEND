"use server";

import { PermissionsBlocker } from "@/permissions/PermissionsBlocker";
import { HydrateClient } from "@/server/trpc/server";
import { getTranslations } from "next-intl/server";
import { ReactNode } from "react";

export async function generateMetadata() {
  const t = await getTranslations();

  return { title: t("navigation.data-management") };
}

export default async function DataManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <HydrateClient>
      <PermissionsBlocker neededPermissions={["DATA_MANAGEMENT_ADMINISTRATOR"]}>
        {children}
      </PermissionsBlocker>
    </HydrateClient>
  );
}
