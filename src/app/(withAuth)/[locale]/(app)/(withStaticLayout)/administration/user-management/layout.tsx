"use server";

import { PermissionsBlocker } from "@/permissions/PermissionsBlocker";
import { HydrateClient } from "@/server/trpc/server";
import { getTranslations } from "next-intl/server";
import { ReactNode } from "react";

export async function generateMetadata() {
  const t = await getTranslations();

  return { title: t("navigation.user-management") };
}

export default async function UserManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <HydrateClient>
      <PermissionsBlocker neededPermissions={["USER_ADMINISTRATOR"]}>
        {children}
      </PermissionsBlocker>
    </HydrateClient>
  );
}
