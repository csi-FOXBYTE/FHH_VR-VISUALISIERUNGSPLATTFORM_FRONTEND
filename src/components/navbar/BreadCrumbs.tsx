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

    for (const part of cleanedPathname.split("/")) {
      crumbs.push({
        content: t(`navigation.${part}`),
        href: `${crumbs[crumbs.length - 1].href}${part}/`,
      });
    }

    return crumbs;
  }, [pathname]);

  return (
    <Breadcrumbs style={{ marginBottom: 32, ...style }}>
      {crumbs.map((crumb) => (
        <Link
          component={NextLink}
          href={crumb.href}
          underline="none"
          color="textPrimary"
          justifyContent="center"
          alignItems="center"
          key={crumb.href}
        >
          {crumb.content}
        </Link>
      ))}
    </Breadcrumbs>
  );
}
