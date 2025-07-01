"use client";

import PageContainer from "@/components/common/PageContainer";
import { TabPanel } from "@/components/common/TabPanel";
import Groups from "@/components/userManagement/Groups";
import Roles from "@/components/userManagement/Roles";
import Users from "@/components/userManagement/Users";
import { Tab, Tabs } from "@mui/material";
import { parseAsFloat, useQueryState } from "nuqs";

export default function UserManagementPage() {
  const [selectedTab, setSelectedTab] = useQueryState(
    "tab",
    parseAsFloat.withDefault(0)
  );

  return (
    <PageContainer>
      <Tabs value={selectedTab}>
        <Tab value={0} onClick={() => setSelectedTab(0)} label="Benutzer" />
        <Tab value={1} onClick={() => setSelectedTab(1)} label="Gruppen" />
        <Tab value={2} onClick={() => setSelectedTab(2)} label="Rollen" />
      </Tabs>
      <TabPanel index={0} value={selectedTab} visible>
        <Users />
      </TabPanel>
      <TabPanel index={1} value={selectedTab} visible>
        <Groups />
      </TabPanel>
      <TabPanel index={2} value={selectedTab} visible>
        <Roles />
      </TabPanel>
    </PageContainer>
  );
}
