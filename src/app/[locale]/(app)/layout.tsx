"use client";

import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Avatar,
  CssBaseline,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Tooltip,
  Link,
  useColorScheme,
  Typography,
  ButtonGroup,
  Grid2,
} from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { useState, MouseEvent } from "react";
import Logout from "@mui/icons-material/Logout";
import { Link as NextLink } from "@/server/i18n/routing";
import { MBFooter } from "@mercedes-benz/mbui-comps";
import { useLocale } from "next-intl";
import {
  DarkMode,
  LightMode,
  Notifications,
  Person2Rounded,
} from "@mui/icons-material";
import SideBar from "@/components/common/SideBar";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { colorScheme, setColorScheme } = useColorScheme();

  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut();
  };

  const locale = useLocale();

  const session = useSession();

  return (
    <>
      <CssBaseline />
      <AppBar
        position="sticky"
        sx={(theme) => ({
          backgroundColor: theme.palette.common.black,
          backgroundImage: "none",
          color: "white",
          display: "flex",
          flexDirection: "column",
        })}
      >
        <Toolbar style={{ paddingLeft: 0 }}>
          <IconButton
            style={{ color: "white", padding: 16, borderRadius: 0, margin: 0 }}
          >
            <MenuIcon />
          </IconButton>
          <Link href="/" component={NextLink} underline="none" color="white">
            <Typography
              style={{
                fontFamily: "MB Corpo A Title",
                fontSize: 21,
                marginLeft: 16,
              }}
              variant="body1"
            >
              Infocus
            </Typography>
          </Link>
          <div
            style={{
              flex: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <Link
              underline="none"
              color="white"
              component={NextLink}
              href="/site"
            >
              Standorte
            </Link>
            <Link
              underline="none"
              color="white"
              component={NextLink}
              href="/project"
            >
              Projekte
            </Link>
          </div>
          <ButtonGroup>
            <Tooltip
              title={colorScheme === "dark" ? "Dark Mode" : "Light Mode"}
            >
              <IconButton
                onClick={() =>
                  setColorScheme(colorScheme === "dark" ? "light" : "dark")
                }
                color="inherit"
              >
                {colorScheme === "dark" ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Notifications />
              </IconButton>
            </Tooltip>
            <Tooltip title="Account settings">
              <IconButton
                aria-haspopup="true"
                onClick={handleClick}
                color="inherit"
              >
                <Person2Rounded />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
          <Menu
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            onClose={handleClose}
            onClick={handleClose}
            open={open}
            anchorEl={anchorEl}
          >
            <MenuItem LinkComponent={NextLink} href="/profile">
              <Avatar />
              &nbsp;Profile
            </MenuItem>
            <Divider />
            <MenuItem>Logged in as {session.data?.user.email}</MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
                &nbsp;Logout
              </ListItemIcon>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Grid2 style={{ flex: 1 }} container flexDirection="row" wrap="nowrap">
        <SideBar />
        <Paper elevation={0} sx={{ flex: 1, padding: "32px 64px", boxSizing: "border-box" }}>
          {children}
        </Paper>
      </Grid2>
      <MBFooter
        lang={locale}
        privacyProtectionInfoLink=""
        legalNoticeInfoLink=""
        providerInfoLink=""
      />
    </>
  );
}
