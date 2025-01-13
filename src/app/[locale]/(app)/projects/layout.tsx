import { HydrateClient, trpc } from "@/server/trpc/server";
import { ReactNode } from "react";

export default async function ProjectLayout({
  children,
}: {
  children: ReactNode;
}) {
  await trpc.testRouter.getProjects.prefetch();

  return <HydrateClient>{children}</HydrateClient>;
}
