import { Link } from "@/server/i18n/routing";
import {
  AdminPanelSettingsOutlined,
  AssignmentOutlined,
  DesktopWindowsOutlined,
  GroupWorkOutlined,
  Logout,
  PersonOutlined,
} from "@mui/icons-material";
import {
  Divider,
  Grid,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import UserAvatar from "../common/UserAvatar";

export default function ProfileMenu({
  anchorEl,
  close,
}: {
  anchorEl: HTMLElement | null;
  close: () => void;
}) {
  const session = useSession();

  const handleLogout = () => {
    signOut({
      redirectTo: "/"
    });
  };

  const t = useTranslations();

  return (
    <Menu
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      onClose={close}
      onClick={close}
      open={anchorEl !== null}
      anchorEl={anchorEl}
    >
      <MenuItem style={{ display: "flex", gap: 8 }}>
        <UserAvatar />
        <Grid>
          <Typography variant="body1">{session.data?.user.name}</Typography>
          <Typography variant="caption">{session.data?.user.email}</Typography>
        </Grid>
      </MenuItem>
      <Divider />
      <MenuItem>
        <ListItemIcon>
          <DesktopWindowsOutlined />
        </ListItemIcon>
        <Grid>
          <Typography variant="body1">{t("navbar.system-version")}</Typography>
          <Typography variant="caption">v{process.env.version}</Typography>
        </Grid>
      </MenuItem>
      <Divider />
      <MenuItem component={Link} href="/profile">
        <ListItemIcon>
          <PersonOutlined />
        </ListItemIcon>
        {t("navbar.profile")}
      </MenuItem>
      <MenuItem component={Link} href="/project-management">
        <ListItemIcon>
          <AssignmentOutlined />
        </ListItemIcon>
        {t("navbar.project-management")}
      </MenuItem>
      <MenuItem component={Link} href="/collaboration">
        <ListItemIcon>
          <GroupWorkOutlined />
        </ListItemIcon>
        {t("navbar.collaboration")}
      </MenuItem>
      <MenuItem component={Link} href="/administration">
        <ListItemIcon>
          <AdminPanelSettingsOutlined />
        </ListItemIcon>
        {t("navbar.administration")}
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <Logout />
        </ListItemIcon>
        {t("navbar.sign-out")}
      </MenuItem>
    </Menu>
  );
}
