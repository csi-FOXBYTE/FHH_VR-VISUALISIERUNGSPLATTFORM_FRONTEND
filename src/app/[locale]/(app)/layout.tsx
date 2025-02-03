"use client";

import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
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
  Typography,
  ButtonGroup,
  Grid2,
} from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { useState, MouseEvent } from "react";
import Logout from "@mui/icons-material/Logout";
import { Link as NextLink } from "@/server/i18n/routing";
import { useLocale } from "next-intl";
import { AccountCircle, Language, Mail } from "@mui/icons-material";
import SideBar from "@/components/common/SideBar";
import { parseAsBoolean, useQueryState } from "nuqs";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [sideBarOpen, setSideBarOpen] = useQueryState(
    "sideBarOpen",
    parseAsBoolean.withDefault(false)
  );

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
      <AppBar position="sticky" color="primary">
        <Toolbar style={{ paddingLeft: 0 }}>
          <IconButton color="inherit">
            <MenuIcon />
          </IconButton>
          <Link href="/" component={NextLink} underline="none" color="inherit">
            <Typography variant="body1">Base</Typography>
          </Link>
          <div style={{ flex: 1 }} />
          <ButtonGroup>
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Mail />
              </IconButton>
            </Tooltip>
            <Tooltip title="Language">
              <IconButton color="inherit">
                <Language />
              </IconButton>
            </Tooltip>
            <Tooltip title="Account settings">
              <IconButton
                aria-haspopup="true"
                onClick={handleClick}
                color="inherit"
              >
                <AccountCircle />
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
              <AccountCircle />
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
      <Grid2
        style={{ flex: 1, overflow: "hidden" }}
        container
        flexDirection="row"
        wrap="nowrap"
      >
        <SideBar
          items={[
            {
              name: "Test",
              path: "/test",
              type: "folder",
            },
          ]}
        />
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            overflow: "hidden",
            padding: "32px 64px",
            boxSizing: "border-box",
          }}
        >
          {children}
        </Paper>
      </Grid2>
    </div>
  );
}
