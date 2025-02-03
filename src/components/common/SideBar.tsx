import {
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  styled,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { usePathname, useRouter } from "@/server/i18n/routing";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { parseAsBoolean, useQueryState } from "nuqs";

type SideBarItem =
  | {
      path: string;
      name: string;
      type: "button" | "folder";
      icon?: ReactNode;
      disabled?: boolean;
      children?: {
        path: string;
        name: string;
        icon?: ReactNode;
        disabled?: boolean;
      }[];
    }
  | { type: "divider" };

const StyledListItemText = styled(ListItemText)`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  & > span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;

export default function SideBar({ items }: { items: SideBarItem[] }) {
  const pathname = usePathname();

  const [sideBarOpen] = useQueryState(
    "sideBarOpen",
    parseAsBoolean.withDefault(false)
  );

  const [openedPath, setOpenedPath] = useState("");

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(sideBarOpen);
  }, [sideBarOpen]);

  const router = useRouter();

  if (pathname === "/") return null;

  return (
    <div style={{ position: "relative", width: 56 }}>
      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          height: "100%",
          transition: "all 0.3s ease",
          width: open ? 250 : 56,
          boxShadow: open
            ? "0 0 8px rgba(0, 0, 0, 0.5)"
            : "0 0 0 rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
          zIndex: 900,
        }}
      >
        <List disablePadding>
          {items.map((item, index) => {
            switch (item.type) {
              case "button":
                return (
                  <ListItemButton
                    disabled={item.disabled}
                    onClick={() => router.push(item.path)}
                    key={item.name}
                    title={item.name}
                  >
                    <ListItemIcon
                      style={{
                        color: pathname === item.path ? "#008DFC" : "inherit",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <StyledListItemText primary={item.name} />
                  </ListItemButton>
                );
              case "folder":
                return (
                  <Fragment key={item.name}>
                    <ListItemButton
                      disabled={item.disabled}
                      onClick={() =>
                        setOpenedPath((openedPath) => {
                          if (openedPath === item.name) return "";
                          return item.name;
                        })
                      }
                      title={item.name}
                    >
                      <ListItemIcon
                        style={{
                          color: pathname.startsWith(item.path)
                            ? "#008DFC"
                            : "inherit",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <StyledListItemText primary={item.name} />
                      <div style={{ flex: 1 }} />
                      <ListItemIcon>
                        <Add />
                      </ListItemIcon>
                    </ListItemButton>
                    <Collapse in={sideBarOpen && openedPath === item.name}>
                      {item.children?.map((item) => (
                        <ListItemButton
                          disabled={item.disabled}
                          onClick={() => router.push(item.path)}
                          key={item.name}
                          title={item.name}
                        >
                          <ListItemIcon>{item.icon}</ListItemIcon>
                          <StyledListItemText primary={item.name} />
                        </ListItemButton>
                      )) ?? null}
                    </Collapse>
                  </Fragment>
                );
              case "divider":
                return <Divider key={index} />;
            }
          })}
        </List>
      </Paper>
    </div>
  );
}
