"use client";

import { Grid2, Tab, Tabs } from "@mui/material";
import { usePathname, useRouter } from "@/server/i18n/routing";
import { ReactNode, useState } from "react";
import CreateProjectDialog from "@/components/project/CreateProjectDialog";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function ProjectOverviewLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { projectId } = useParams();

  const t = useTranslations();

  const pathname = usePathname() ?? "";

  const router = useRouter();

  const [createModalOpened, setCreateModalOpened] = useState(false);

  return (
    <Grid2
      height="100%"
      container
      flexDirection="column"
      flexWrap="nowrap"
      overflow="hidden"
    >
      <Grid2 marginBottom={"1rem"}>
        <Tabs value={pathname}>
          <Tab
            onClick={() => router.push(`/projects/${projectId}/details`)}
            value={`/projects/${projectId}/details`}
            label={t("routes./project.tabbar1")}
          />
          <Tab
            onClick={() => router.push(`/projects/${projectId}/requirements`)}
            value={`/projects/${projectId}/requirements`}
            label={t("routes./project.tabbar2")}
          />
          <Tab
            onClick={() => router.push(`/projects/${projectId}/goals`)}
            value={`/projects/${projectId}/goals`}
            label={t("routes./project.tabbar3")}
          />
          <Tab
            onClick={() => router.push(`/projects/${projectId}/participant`)}
            value={`/projects/${projectId}/participant`}
            label={t("routes./project.tabbar4")}
          />
        </Tabs>
      </Grid2>
      {children}
      <CreateProjectDialog
        close={() => setCreateModalOpened(false)}
        open={createModalOpened}
      />
    </Grid2>
  );
}
