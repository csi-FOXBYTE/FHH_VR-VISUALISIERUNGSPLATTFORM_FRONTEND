"use server";

import { HydrateClient, trpc } from "@/server/trpc/server";
import { getTranslations } from "next-intl/server";
import { ReactNode } from "react";

export async function generateMetadata() {
  const t = await getTranslations();

  return { title: t("navigation.my-area") };
}

export default async function MyAreaLayout({
  children,
}: {
  children: ReactNode;
}) {
  await trpc.myAreaRouter.getLastLogin.prefetch();

  return <HydrateClient>{children}</HydrateClient>;
}
