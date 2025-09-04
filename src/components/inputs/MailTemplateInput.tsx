"use client";

import { Info } from "@mui/icons-material";
import {
  Box,
  Grid,
  IconButton,
  Menu,
  TextField,
  TextFieldProps,
} from "@mui/material";
import Handlebars from "handlebars";
import PopupState, { bindMenu, bindToggle } from "material-ui-popup-state";
import { useMemo } from "react";

export default function MailTemplateInput({
  value = "",
  onChange,
  onBlur,
  context = {},
}: {
  value?: string;
  onChange?: TextFieldProps["onChange"];
  onBlur?: TextFieldProps["onBlur"];
  context?: any;
}) {
  const html = useMemo(() => {
    const template = Handlebars.compile(value);
    try {
      return template(context, {});
    } catch (e) {
      return String(e);
    }
  }, [value, context]);

  return (
    <Grid
      container
      sx={{ height: 400, position: "relative", overflow: "hidden" }}
    >
      <Box
        sx={{
          flex: 1,
          height: "100%",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <TextField
          fullWidth
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          multiline
        />
        <PopupState variant="popover">
          {(popupState) => (
            <>
              <IconButton
                color="primary"
                sx={{ position: "absolute", top: 0, right: 0 }}
                {...bindToggle(popupState)}
              >
                <Info />
              </IconButton>
              <Menu {...bindMenu(popupState)}>
                <div dangerouslySetInnerHTML={{ __html: JSON.stringify(context, undefined, 4).split("{").join("").split(",").join("").split("}").join("").split('"').join("").split(" ").join("&nbsp;").split("\n").slice(0, -2).map(s => `<p style="margin: 0">${s}</p>`).join("")
                }} />
              </Menu>
            </>
          )}
        </PopupState>
      </Box>
      <Box
        sx={{ flex: 1, overflowY: "auto", height: "100%" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Grid>
  );
}
