"use client";

import PageContainer from "@/components/common/PageContainer";
import { TabPanel } from "@/components/common/TabPanel";
import Layers from "@/components/dataManagement/Layers";
import VisualAxes from "@/components/dataManagement/VisualAxes";
import {
  Tab,
  Tabs
} from "@mui/material";
import { useTranslations } from "next-intl";
import { parseAsInteger, useQueryState } from "nuqs";

export default function DataManagementPage() {
  const [selectedTab, setSelectedTab] = useQueryState(
    "tab",
    parseAsInteger.withDefault(0)
  );

  const t = useTranslations();

  return (
    <PageContainer>      
      <Tabs value={selectedTab}>
        <Tab value={0} onClick={() => setSelectedTab(0)} label={t("data-management.layers")} />
        <Tab value={1} onClick={() => setSelectedTab(1)} label={t("data-management.visual-axes")} />
      </Tabs>
      <TabPanel
        flex="1"
        visible
        overflow="hidden"
        container
        flexDirection="column"
        flexWrap="nowrap"
        index={0}
        value={selectedTab}
      >
        <Layers />
      </TabPanel>
      <TabPanel flex="1"
        visible
        overflow="hidden"
        container
        flexDirection="column"
        flexWrap="nowrap"
        index={1}
        value={selectedTab}>
          <VisualAxes />
      </TabPanel>
    </PageContainer>
  );
}
