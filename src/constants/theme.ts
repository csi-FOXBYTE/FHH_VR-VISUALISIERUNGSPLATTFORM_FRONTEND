"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#e10019",
    },
    secondary: {
      main: "#003063",
    },
  },
  typography: {
    fontSize:  12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: "none",
          border: "2px solid transparent",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          "&:hover": {
            color: "#E10019",
            backgroundColor: "transparent",
            border: "2px solid #E10019",
          },
        },
        containedSecondary: {
          "&:hover": {
            color: "#003063",
            backgroundColor: "transparent",
            border: "2px solid #003063",
          },
        },
        outlinedPrimary: {
          border: "2px solid #E10019",
          "&:hover": {
            border: "2px solid #E10019",
          },
        },
        outlinedSecondary: {
          border: "2px solid #003063",
          "&:hover": {
            border: "2px solid #003063",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          color: "#000",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(227,227,227,0.5)",
          borderRadius: 0,
          boxShadow: "none",
          color: "#000",
        },
      },
    },
  },
});

export default theme;
