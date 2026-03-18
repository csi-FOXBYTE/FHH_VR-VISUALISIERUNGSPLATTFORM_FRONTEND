"use server";

import { PermissionsBlocker } from "@/permissions/PermissionsBlocker";
import { HydrateClient } from "@/server/trpc/server";
import { getTranslations } from "next-intl/server";
import { ReactNode } from "react";

export async function generateMetadata() {
  const t = await getTranslations();

  return { title: t("navigation.configuration") };
}

export default async function ConfigurationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <HydrateClient>
      <PermissionsBlocker neededPermissions={["CONFIGURATION_ADMINISTRATOR"]}>
        {children}
      </PermissionsBlocker>
    </HydrateClient>
  );
}
