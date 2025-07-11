import Providers from "@/appProviders";
import { createConfiguration } from "@/components/configuration/createConfiguration";
import { auth } from "@/server/auth/auth";
import { redirect, routing } from "@/server/i18n/routing";
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
              configuration={await createConfiguration()}
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
