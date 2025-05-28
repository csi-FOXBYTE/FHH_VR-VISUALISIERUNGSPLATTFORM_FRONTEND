"use server";

import { HydrateClient } from "@/server/trpc/server";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReactNode } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return { title: t("navigation.not-found") };
}

export default async function NotFoundLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <HydrateClient>{children}</HydrateClient>;
}
