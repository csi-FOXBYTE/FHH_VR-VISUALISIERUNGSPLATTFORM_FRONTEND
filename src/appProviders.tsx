"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { TRPCProvider } from "./trpc/client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material";
import theme from "./theme";

export default function AppProviders({
  session,
  children,
}: {
  session: any;
  children: ReactNode;
}) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <SessionProvider session={session}>
          <TRPCProvider>{children}</TRPCProvider>
        </SessionProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
