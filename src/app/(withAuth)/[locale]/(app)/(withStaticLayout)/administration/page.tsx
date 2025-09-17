"use client";

import Cards from "@/components/common/Cards";
import PageContainer from "@/components/common/PageContainer";
import { useConfigurationProviderContext } from "@/components/configuration/ConfigurationProvider";
import { Typography } from "@mui/material";
import { useTranslations } from "next-intl";

export default function AdministrationPage() {
  const t = useTranslations();

  const configuration = useConfigurationProviderContext();

  return (
    <PageContainer>
      <Cards
        items={[
          {
            content: (
              <Typography>
                {t("administration.data-management-description")}
              </Typography>
            ),
            key: "data-management",
            link: {
              href: "/administration/data-management",
              label: t("administration.go-to-data-management"),
            },
            title: t("administration.data-management"),
          },
          {
            content: (
              <Typography>
                {t("administration.configuration-description")}
              </Typography>
            ),
            key: "configuration",
            link: {
              href: "/administration/configuration",
              label: t("administration.go-to-configuration"),
            },
            title: t("administration.configuration"),
          },
          {
            content: (
              <Typography>
                {t("administration.system-activities-and-logs-description")}
              </Typography>
            ),
            key: "system-activities-and-logs",
            link: {
              href: configuration.systemActivityLink,
              label: t("administration.go-to-system-activities"),
            },
            title: t("administration.system-activities-and-logs"),
          },
          {
            content: (
              <Typography>
                {t("administration.user-management-description")}
              </Typography>
            ),
            key: "user-management",
            link: {
              href: "/administration/user-management",
              label: t("administration.go-to-user-management"),
            },
            title: t("administration.user-management"),
          },
        ]}
      />
    </PageContainer>
  );
}
