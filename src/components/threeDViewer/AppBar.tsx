import { Redo, Undo } from "@mui/icons-material";
import {
  Button,
  ButtonGroup,
  Grid2,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import { useState } from "react";
import BreadCrumbs from "../navbar/BreadCrumbs";
import ImportProjectObjectInput from "./ImportProjectObjectInput";
import { useViewerStore } from "./ViewerProvider";

export default function AppBar() {
  const [fileAnchorEl, setFileAnchorEl] = useState<HTMLElement | null>();

  const [fileMenuOpen, setFileMenuOpen] = useState(false);

  const history = useViewerStore((state) => state.history);

  return (
    <Grid2
      width="100%"
      boxShadow={2}
      container
      justifyContent="space-between"
      alignItems="center"
      padding="0 32px"
    >
      <ButtonGroup color="secondary" variant="text">
        <Button onClick={() => setFileMenuOpen(true)} ref={setFileAnchorEl}>
          File
        </Button>
        <Button disabled={history.index === 0} onClick={history.undo}>
          <Undo />
        </Button>
        <Button
          disabled={history.value.length === history.index + 1}
          onClick={history.redo}
        >
          <Redo />
        </Button>
      </ButtonGroup>
      <Menu
        disablePortal
        open={fileMenuOpen}
        hideBackdrop={false}
        onClose={() => setFileMenuOpen(false)}
        slotProps={{
          paper: {
            style: {
              borderRadius: 0,
              pointerEvents: "all",
              width: 240,
              maxWidth: "100%",
            },
          },
        }}
        anchorEl={fileAnchorEl}
      >
        <MenuList dense>
          <MenuItem>
            <ListItemText>Save</ListItemText>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              ⌘S
            </Typography>
          </MenuItem>
          <MenuItem component="label">
            <ListItemText>Import</ListItemText>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              ⌘I
            </Typography>
            <ImportProjectObjectInput onFinished={() => setFileMenuOpen(false)} />
          </MenuItem>
          <MenuItem>
            <ListItemText>Close</ListItemText>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary" }}
            ></Typography>
          </MenuItem>
        </MenuList>
      </Menu>
      <BreadCrumbs style={{ marginBottom: 0 }} />
      <div />
    </Grid2>
  );
}
