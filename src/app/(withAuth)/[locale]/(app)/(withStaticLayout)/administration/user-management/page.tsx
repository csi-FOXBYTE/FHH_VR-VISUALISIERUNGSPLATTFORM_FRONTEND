"use client";

import PageContainer from "@/components/common/PageContainer";
import { TabPanel } from "@/components/common/TabPanel";
import Groups from "@/components/userManagement/Groups";
import Roles from "@/components/userManagement/Roles";
import Users from "@/components/userManagement/Users";
import { Tab, Tabs } from "@mui/material";
import { useTranslations } from "next-intl";
import { parseAsStringLiteral, useQueryState } from "nuqs";

export default function UserManagementPage() {
  const t = useTranslations();

  const [selectedTab, setSelectedTab] = useQueryState(
    "tab",
    parseAsStringLiteral(["user", "group", "role"]).withDefault("user")
  );

  return (
    <PageContainer>
      <Tabs value={selectedTab}>
        <Tab
          value={"user"}
          onClick={() => setSelectedTab("user")}
          label={t("entities.user")}
        />
        <Tab
          value={"group"}
          onClick={() => setSelectedTab("group")}
          label={t("entities.group")}
        />
        <Tab
          value={"role"}
          onClick={() => setSelectedTab("role")}
          label={t("entities.role")}
        />
      </Tabs>
      <TabPanel index={"user"} value={selectedTab} visible>
        <Users />
      </TabPanel>
      <TabPanel index={"group"} value={selectedTab} visible>
        <Groups />
      </TabPanel>
      <TabPanel index={"role"} value={selectedTab} visible>
        <Roles />
      </TabPanel>
    </PageContainer>
  );
}
