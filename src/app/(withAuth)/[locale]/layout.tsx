import Providers from "@/appProviders";
import { createConfiguration } from "@/components/configuration/createConfiguration";
import { auth } from "@/server/auth/auth";
import { routing } from "@/server/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode } from "react";

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

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon_32x32.png" sizes="any" />
        <Script
          id="set-cesium-base-url"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          window.CESIUM_BASE_URL="${process.env.NEXT_PUBLIC_BASE_URL}/cesium";`,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <NuqsAdapter>
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
