"use client";

import { Link as NextLink, usePathname } from "@/server/i18n/routing";
import { HomeOutlined } from "@mui/icons-material";
import { Breadcrumbs, Link } from "@mui/material";
import { useTranslations } from "next-intl";
import { CSSProperties, ReactNode, useMemo } from "react";

export default function BreadCrumbs({ style = {} }: { style?: CSSProperties }) {
  const t = useTranslations();

  const pathname = usePathname();

  const crumbs = useMemo(() => {
    const crumbs: { href: string; content: ReactNode }[] = [
      {
        href: "/",
        content: <HomeOutlined />,
      },
    ];

    let cleanedPathname = pathname;

    if (pathname[0] === "/") cleanedPathname = pathname.substring(1);

    let path = "";
    for (const part of cleanedPathname.split("/")) {
      path = `${path}/${part}`;

      if (path.startsWith("/project-management/") && part !== "editor") {
        if (part === "new") {
          crumbs.push({
            content: t("navigation.new-project"),
            href: `${crumbs[crumbs.length - 1].href}${part}/`,
          });
          continue;
        }

        crumbs.push({
          content: t("navigation.editor"),
          href: `${crumbs[crumbs.length - 1].href}${part}/`,
        });
        continue;
      }

      crumbs.push({
        content: t(`navigation.${part}`),
        href: `${crumbs[crumbs.length - 1].href}${part}/`,
      });
    }

    crumbs[0].href = "/my-area";

    return crumbs;
  }, [pathname, t]);

  return (
    <Breadcrumbs
      style={{
        marginBottom: 32,
        maxWidth: 1440,
        ...style,
      }}
    >
      {crumbs.map((crumb, index) => (
        <Link
          component={NextLink}
          href={crumb.href}
          underline="none"
          color="textPrimary"
          justifyContent="center"
          alignItems="center"
          display="flex"
          alignContent="center"
          fontWeight={index === crumbs.length - 1 ? "bold" : ""}
          key={crumb.href}
        >
          {crumb.content}
        </Link>
      ))}
    </Breadcrumbs>
  );
}
