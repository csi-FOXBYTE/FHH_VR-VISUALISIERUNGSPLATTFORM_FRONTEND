"use client";

import {
  AppBar,
  Button,
  ButtonGroup,
  IconButton,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Toolbar,
  Tooltip,
} from "@mui/material";
import {
  locales,
  Link as NextLink,
  useRouter,
  usePathname,
} from "@/server/i18n/routing";
import { QuestionMark } from "@mui/icons-material";
import UserAvatar from "../common/UserAvatar";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState, MouseEvent } from "react";
import ProfileMenu from "./ProfileMenu";
import { useSession } from "next-auth/react";
import PageContainer from "../common/PageContainer";
import Help from "../help/Help";
import { useConfigurationProviderContext } from "../configuration/ConfigurationProvider";

export type NavbarProps = {
  elevated?: boolean;
};

export default function Navbar({ elevated = true }: NavbarProps) {
  const locale = useLocale();

  const router = useRouter();

  const pathname = usePathname();

  const t = useTranslations();

  const session = useSession();

  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setProfileAnchorEl(null);
  };

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

  const configuration = useConfigurationProviderContext();

  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <AppBar
      position="sticky"
      style={{ background: elevated ? undefined : "transparent" }}
      elevation={elevated ? undefined : 0}
      color="primary"
    >
      <PageContainer sx={{ padding: "0 32px" }}>
        <ProfileMenu anchorEl={profileAnchorEl} close={handleClose} />
        <Toolbar style={{ paddingLeft: 0 }}>
          <Link
            href="/my-area"
            component={NextLink}
            underline="none"
            color="inherit"
          >
            <Image
              alt="Hamburg logo"
              src="/logo.png"
              fetchPriority="low"
              style={{ width: "180px", height: "auto" }}
              height={96}
              width={533}
              quality={95}
            />
          </Link>
          <div style={{ flex: 1 }} />
          <ButtonGroup>
            <Button
              color="primary"
              href={configuration.unityDownloadLink}
              variant="contained"
            >
              {t("landingpage.download")}
            </Button>
            <Select
              value={locale}
              onChange={handleChangeLocale}
              variant="outlined"
              slotProps={{
                notchedOutline: {
                  style: {
                    border: "none",
                  },
                },
              }}
            >
              {locales.map((locale) => (
                <MenuItem key={locale} value={locale}>
                  {locale.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
            <Tooltip title={t("navbar.help")}>
              <IconButton
                onClick={() => setHelpOpen(true)}
                style={{ color: "black", borderRadius: 0 }}
              >
                <QuestionMark />
              </IconButton>
            </Tooltip>
            <Help open={helpOpen} close={() => setHelpOpen(false)} />
            {session.status === "authenticated" ? (
              <Tooltip title={t("navbar.settings")}>
                <IconButton
                  aria-haspopup="true"
                  style={{ borderRadius: 0 }}
                  onClick={handleClick}
                  color="inherit"
                >
                  <UserAvatar sx={{ width: 24, height: 24, fontSize: 10 }} />
                </IconButton>
              </Tooltip>
            ) : (
              <ButtonGroup>
                <Button
                  LinkComponent={NextLink}
                  href="/my-area"
                  color="primary"
                  variant="contained"
                >
                  {t("navbar.login")}
                </Button>
                <Button variant="contained" color="secondary">
                  {t("navbar.register")}
                </Button>
              </ButtonGroup>
            )}
          </ButtonGroup>
        </Toolbar>
      </PageContainer>
    </AppBar>
  );
}
