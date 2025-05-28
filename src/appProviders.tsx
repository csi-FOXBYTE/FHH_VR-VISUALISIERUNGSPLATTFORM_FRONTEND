"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { TRPCProvider } from "./server/trpc/client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Theme, ThemeProvider, createTheme } from "@mui/material";
import theme from "./constants/theme";
import { Session } from "next-auth";
import { routing } from "./server/i18n/routing";
import { deDE, enUS } from "@mui/material/locale";
import { deDE as xdeDE, enUS as xenUS } from "@mui/x-data-grid/locales";
import { SnackbarProvider } from "notistack";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const supportedLocales: Record<(typeof routing.locales)[number], Theme> = {
  de: createTheme(deDE, xdeDE),
  en: createTheme(enUS, xenUS),
};

export default function AppProviders({
  session,
  children,
  locale,
}: {
  session: Session | null;
  children: ReactNode;
  locale: string;
}) {
  const themeWithLocale = createTheme(
    supportedLocales[locale as "en"] ?? supportedLocales.en,
    theme
  );

  return (
    <AppRouterCacheProvider>
      <SnackbarProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={themeWithLocale}>
          <SessionProvider session={session}>
            <TRPCProvider>{children}</TRPCProvider>
          </SessionProvider>
        </ThemeProvider>
        </LocalizationProvider>
      </SnackbarProvider>
    </AppRouterCacheProvider>
  );
}
