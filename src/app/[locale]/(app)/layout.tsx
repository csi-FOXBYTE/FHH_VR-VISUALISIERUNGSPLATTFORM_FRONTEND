"use client";

import FancyFooterEdge from "@/components/common/FancyFooterEdge";
import UserAvatar from "@/components/common/UserAvatar";
import ProfileMenu from "@/components/navbar/ProfileMenu";
import {
  locales,
  Link as NextLink,
  usePathname,
  useRouter,
} from "@/server/i18n/routing";
import { QuestionMark } from "@mui/icons-material";
import {
  AppBar,
  ButtonGroup,
  CssBaseline,
  Grid2,
  IconButton,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { MouseEvent, useState } from "react";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setProfileAnchorEl(null);
  };

  const locale = useLocale();

  const theme = useTheme();

  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const router = useRouter();

  const pathname = usePathname();

  const handleChangeLocale = (event: SelectChangeEvent<string>) => {
    router.push(
      {
        pathname: pathname,
      },
      {
        locale: event.target.value,
      }
    );
  };

  const t = useTranslations();

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CssBaseline />
      <ProfileMenu anchorEl={profileAnchorEl} close={handleClose} />
      <AppBar position="sticky" color="primary">
        <Toolbar style={{ paddingLeft: 0 }}>
          <Link
            href="/"
            component={NextLink}
            style={{ padding: "16px 32px" }}
            underline="none"
            color="inherit"
          >
            <Image
              alt="Hamburg logo"
              src="/logo.png"
              fetchPriority="low"
              style={{ width: "250px", height: "auto" }}
              height={45}
              width={250}
              quality={90}
            />
          </Link>
          <div style={{ flex: 1 }} />
          <ButtonGroup>
            <Select
              value={locale}
              onChange={handleChangeLocale}
              variant="outlined"
              style={{ border: "none" }}
            >
              {locales.map((locale) => (
                <MenuItem key={locale} value={locale}>
                  {locale.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
            <Tooltip title={t("navbar.help")}>
              <IconButton style={{ color: "black" }}>
                <QuestionMark />
              </IconButton>
            </Tooltip>

            <Tooltip title={t("navbar.settings")}>
              <IconButton
                aria-haspopup="true"
                onClick={handleClick}
                color="inherit"
              >
                <UserAvatar sx={{ width: 24, height: 24, fontSize: 10 }} />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
        </Toolbar>
      </AppBar>
      {children}
      <footer
        style={{
          background: theme.palette.secondary.main,
          padding: theme.spacing(3),
          position: "relative",
          color: "white",
        }}
      >
        <FancyFooterEdge
          style={{
            position: "absolute",
            top: -46,
            left: 0,
            width: 150,
            zIndex: 20,
            pointerEvents: "none",
          }}
        />
        <Grid2 container justifyContent="space-between" spacing={4}>
          <Typography>©Hamburg LGV 2025</Typography>
          <Grid2 container spacing={4}>
            <Link
              href={"/imprint"}
              underline="none"
              color="inherit"
              component={NextLink}
            >
              {t("footer.imprint")}
            </Link>
            <Link
              href={"/gdpr"}
              underline="none"
              color="inherit"
              component={NextLink}
            >
              {t("footer.gdpr")}
            </Link>
          </Grid2>
        </Grid2>
      </footer>
    </div>
  );
}
