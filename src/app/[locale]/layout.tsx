import { authOptions } from "@/server/auth/authOptions";
import { routing } from "@/server/i18n/routing";
import { getServerSession } from "next-auth";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import Providers from "@/appProviders";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "@mercedes-benz/typeface-mb-corpo-a/index.css";
import "@mercedes-benz/typeface-mb-corpo-s/index.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) return redirect("/api/auth/signin"); // Always redirect when no session is present, user needs to be authenticated at all times!

  const { locale } = await params;

  if (!routing.locales.includes(locale as "en")) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon_mobile_196x196.png" sizes="any" />
      </head>
      <body
        style={{ minHeight: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}
      >
        <NextIntlClientProvider messages={messages}>
          <NuqsAdapter>
            <Providers locale={locale} session={session}>
              {children}
            </Providers>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
