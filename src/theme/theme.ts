import { createTheme } from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#8b5e3c" : "#d4a373",
        light: "#a67c52",
      },
      background: {
        default: mode === "light" ? "#fdfaf6" : "#1a1614",
        paper: mode === "light" ? "#ffffff" : "#231f1d",
      },
      custom: {
        gradient:
          mode === "light"
            ? "linear-gradient(135deg, #8b5e3c 0%, #a67c52 100%)"
            : "linear-gradient(135deg, #d4a373 0%, #e9c46a 100%)",
      },
    } as any,
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow:
              mode === "light"
                ? "0 4px 12px rgba(44, 36, 32, 0.08)"
                : "0 4px 20px rgba(0, 0, 0, 0.4)",
          },
        },
      },
    },
  });
