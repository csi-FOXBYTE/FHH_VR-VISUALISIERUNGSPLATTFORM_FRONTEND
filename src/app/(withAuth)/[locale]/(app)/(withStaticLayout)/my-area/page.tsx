"use client";

import Cards from "@/components/common/Cards";
import PageContainer from "@/components/common/PageContainer";
import usePermissions from "@/permissions/usePermissions";
import { trpc } from "@/server/trpc/client";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import { Typography } from "@mui/material";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useFormatter, useTranslations } from "next-intl";

export default function MyAreaPage() {
  const session = useSession();

  const t = useTranslations();

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatter = useFormatter();

  const { data: { updatedAt } = { updatedAt: new Date() } } =
    trpc.myAreaRouter.getLastLogin.useQuery();

  const { data: todaysEvents = [] } =
    trpc.myAreaRouter.getTodaysEvents.useQuery();

  const permissions = usePermissions();

  return (
    <PageContainer>
      <Cards
        items={[
          {
            key: "profile",
            visible: true,
            content: t("index.last-logged-in-message", {
              date: formatter.dateTime(new Date(updatedAt), {
                dateStyle: "long",
                timeZone,
                timeStyle: "medium",
              }),
            }),
            link: {
              href: "/profile",
              label: t("index.show-profile"),
            },
            title: t("index.welcoming-text", {
              name: session.data?.user.name ?? "-",
            }),
          },
          {
            key: "project-management",
            visible: permissions.includes("PROJECT_OWNER"),
            content: (
              <Typography textAlign="justify" whiteSpace="break-spaces">
                {t("index.project-management-description")}
              </Typography>
            ),
            link: {
              href: "/project-management",
              label: t("index.manage-projects"),
            },
            title: t("index.project-management"),
          },
          {
            key: "collaboration",
            visible: true,
            content: (
              <>
                <span>
                  {t("index.events-text", {
                    date: formatter.dateTime(dayjs().toDate(), {
                      dateStyle: "medium",
                      timeZone
                    }),
                  })}
                </span>
                <Timeline sx={{ maxHeight: 200, overflowY: "auto" }}>
                  {todaysEvents.length !== 0 ? (
                    todaysEvents.map((event, index) => (
                      <TimelineItem key={event.id}>
                        <TimelineOppositeContent>
                          <span style={{ whiteSpace: "nowrap" }}>
                            {formatter.dateTimeRange(
                              new Date(event.startTime),
                              new Date(event.endTime),
                              {
                                timeStyle: "short",
                                timeZone
                              }
                            )}
                          </span>
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot />
                          {index === todaysEvents.length - 1 ? null : (
                            <TimelineConnector />
                          )}
                        </TimelineSeparator>
                        <TimelineContent>{event.title}</TimelineContent>
                      </TimelineItem>
                    ))
                  ) : (
                    <TimelineItem>
                      <TimelineOppositeContent></TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot />
                      </TimelineSeparator>
                      <TimelineContent>
                        {t("index.no-events-pending")}
                      </TimelineContent>
                    </TimelineItem>
                  )}
                </Timeline>
              </>
            ),
            link: {
              href: "/collaboration",
              label: t("index.show-collaboration"),
            },
            title: t("index.collaboration"),
          },
          {
            key: "administration",
            visible:
              permissions.includes("USER_ADMINISTRATOR") ||
              permissions.includes("DATA_MANAGEMENT_ADMINISTRATOR") ||
              permissions.includes("CONFIGURATION_ADMINISTRATOR") ||
              permissions.includes("BASE_LAYER_OWNER"),
            content: (
              <Typography textAlign="justify" whiteSpace="break-spaces">
                {t("index.administration-description")}
              </Typography>
            ),
            link: {
              href: "/administration",
              label: t("index.show-administration"),
            },
            title: t("index.administration"),
          },
        ]}
      />
    </PageContainer>
  );
}
