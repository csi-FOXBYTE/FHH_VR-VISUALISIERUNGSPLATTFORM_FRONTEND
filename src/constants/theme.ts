"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#9e3020',
        },
        secondary: {
          main: '#f50057',
        },
      },
    }
  }
});

export default theme;
