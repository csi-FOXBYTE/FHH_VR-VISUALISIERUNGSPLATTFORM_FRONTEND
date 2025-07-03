import { auth } from "@/server/auth/auth";
import { routing } from "@/server/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Providers from "@/appProviders";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode } from "react";
import Script from "next/script";
import prisma from "@/server/prisma";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const session = await auth();

  const { locale } = await params;

  if (!routing.locales.includes(locale as "en")) {
    notFound();
  }

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
        <Script
          id="set-cesium-base-url"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          window.CESIUM_BASE_URL="${process.env.NEXTAUTH_URL}/cesium";`,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <NuqsAdapter>
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
