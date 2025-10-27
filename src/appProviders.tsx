"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { TRPCProvider } from "./server/trpc/client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { IconButton, Theme, ThemeProvider, createTheme } from "@mui/material";
import theme from "./constants/theme";
import { Session } from "next-auth";
import { routing } from "./server/i18n/routing";
import { deDE, enUS } from "@mui/material/locale";
import { deDE as xdeDE, enUS as xenUS } from "@mui/x-data-grid/locales";
import { deDE as tdeDE, enUS as tdenUS } from "@mui/x-date-pickers/locales";
import { SnackbarKey, SnackbarProvider, closeSnackbar } from "notistack";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/de";
import "dayjs/locale/en";
import { ConfirmProvider } from "material-ui-confirm";
import ConfigurationProvider, {
  ConfigurationProviderContextType,
} from "./components/configuration/ConfigurationProvider";
import { Close } from "@mui/icons-material";

const supportedLocales: Record<(typeof routing.locales)[number], Theme> = {
  de: createTheme(deDE, tdeDE, xdeDE),
  en: createTheme(enUS, xenUS, tdenUS),
};

export default function AppProviders({
  session,
  children,
  configuration,
  locale,
}: {
  session: Session | null;
  children: ReactNode;
  locale: string;
  configuration: ConfigurationProviderContextType;
}) {
  const themeWithLocale = createTheme(
    supportedLocales[locale as "en"] ?? supportedLocales.en,
    theme
  );

  return (
    <AppRouterCacheProvider>
      <ConfirmProvider>
        <ConfigurationProvider configuration={configuration}>
          <SnackbarProvider
            action={(id) => (
              <>
                <IconButton
                  sx={{ color: "white" }}
                  onClick={() => closeSnackbar(id)}
                >
                  <Close />
                </IconButton>
              </>
            )}
            autoHideDuration={60_000}
            SnackbarProps={{}}
          >
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={locale}
            >
              <ThemeProvider theme={themeWithLocale}>
                <SessionProvider session={session}>
                  <TRPCProvider>{children}</TRPCProvider>
                </SessionProvider>
              </ThemeProvider>
            </LocalizationProvider>
          </SnackbarProvider>
        </ConfigurationProvider>
      </ConfirmProvider>
    </AppRouterCacheProvider>
  );
}
