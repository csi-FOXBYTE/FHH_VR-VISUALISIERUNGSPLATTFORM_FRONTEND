import Providers from "@/appProviders";
import { auth } from "@/server/auth/auth";
import { redirect, routing } from "@/server/i18n/routing";
import prisma from "@/server/prisma";
import { CssBaseline } from "@mui/material";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode } from "react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LandingPageLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const session = await auth();

  const { locale } = await params;

  if (session)
    return redirect({
      href: "/my-area",
      locale: await getLocale(),
    });

  const messages = await getMessages();

  const configuration = await prisma.configuration.findFirstOrThrow({
    select: {
      defaultEPSG: true,
      globalStartPointX: true,
      globalStartPointY: true,
      globalStartPointZ: true,
    },
  });

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon_32x32.png" sizes="any" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <NuqsAdapter>
            <CssBaseline />
            <Providers
              configuration={{
                defaultEPSG: configuration.defaultEPSG,
                globalStartPoint: {
                  x: configuration.globalStartPointX,
                  y: configuration.globalStartPointY,
                  z: configuration.globalStartPointZ,
                },
              }}
              locale={locale}
              session={session}
            >
              {children}
            </Providers>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
