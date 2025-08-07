"use client";

import PageContainer from "@/components/common/PageContainer";
import { TabPanel } from "@/components/common/TabPanel";
import Layers from "@/components/dataManagement/Layers";
import VisualAxes from "@/components/dataManagement/VisualAxes";
import {
  Tab,
  Tabs
} from "@mui/material";
import { parseAsInteger, useQueryState } from "nuqs";

export default function DataManagementPage() {
  const [selectedTab, setSelectedTab] = useQueryState(
    "tab",
    parseAsInteger.withDefault(0)
  );

  return (
    <PageContainer>      
      <Tabs value={selectedTab}>
        <Tab value={0} onClick={() => setSelectedTab(0)} label="Ebenen" />
        <Tab value={1} onClick={() => setSelectedTab(1)} label="Sichtachsen" />
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
