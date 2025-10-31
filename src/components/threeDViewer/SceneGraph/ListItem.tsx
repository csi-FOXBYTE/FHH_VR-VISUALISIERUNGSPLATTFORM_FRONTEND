import {
  Adjust,
  Delete,
  LocationOn,
  MoreVert,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import PopupState, { bindMenu, bindToggle } from "material-ui-popup-state";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

export default function SceneGraphListItem({
  selected,
  onSelected,
  name,
  onDelete,
  onPlace,
  onToggleVisibility,
  visible,
  onFlyTo,
  extras,
  disabled,
}: {
  name: string;
  selected: boolean;
  onSelected: () => void;
  visible?: boolean;
  onToggleVisibility?: () => void;
  onDelete?: () => void;
  onPlace?: () => void;
  onFlyTo?: () => void;
  extras?: ReactNode;
  disabled?: boolean;
}) {
  const t = useTranslations();

  return (
    <ListItem
      onClick={onSelected}
      sx={(theme) => ({
        background: selected ? theme.palette.secondary.main : undefined,
        color: selected ? theme.palette.secondary.contrastText : undefined,
        overflow: "hidden",
        width: "100%",
      })}
    >
      <ListItemText sx={{ overflow: "hidden" }}>
        <Tooltip title={name} arrow>
          <Typography textOverflow="ellipsis" noWrap>
            {name}
          </Typography>
        </Tooltip>
      </ListItemText>
      {extras ?? null}
      <PopupState variant="popover">
        {(popupState) => (
          <>
            <ListItemButton
              {...bindToggle(popupState)}
              disabled={disabled}
              sx={{
                flex: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              dense
            >
              <MoreVert />
            </ListItemButton>
            <Menu {...bindMenu(popupState)}>
              {onToggleVisibility ? (
                <MenuItem
                  disabled={disabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleVisibility();
                  }}
                >
                  <ListItemIcon>
                    {visible ? <Visibility /> : <VisibilityOff />}
                  </ListItemIcon>
                  <ListItemText primary={t("actions.toggle-visibility")} />
                </MenuItem>
              ) : null}
              {onPlace ? (
                <MenuItem
                  disabled={disabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    popupState.close();
                    onPlace();
                  }}
                >
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText primary={t("actions.place")} />
                </MenuItem>
              ) : null}
              {onFlyTo ? (
                <MenuItem
                  disabled={disabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    onFlyTo();
                  }}
                >
                  <ListItemIcon>
                    <Adjust />
                  </ListItemIcon>
                  <ListItemText>{t("actions.fly-to")}</ListItemText>
                </MenuItem>
              ) : null}
              {onDelete ? (
                <>
                  <Divider />
                  <MenuItem
                    disabled={disabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete();
                    }}
                  >
                    <ListItemIcon>
                      <Delete />
                    </ListItemIcon>
                    <ListItemText>{t("actions.delete")}</ListItemText>
                  </MenuItem>
                </>
              ) : null}
            </Menu>
          </>
        )}
      </PopupState>
    </ListItem>
  );
}
