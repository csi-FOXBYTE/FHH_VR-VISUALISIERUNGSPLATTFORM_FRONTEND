import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Providers from "@/appProviders";
import { getServerSession } from "next-auth";
import { Roboto } from "next/font/google";
import { HydrateClient, trpc } from "@/trpc/server";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "en")) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  const session = await getServerSession();

  await trpc.testRouter.test.prefetch();

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon_mobile_196x196.png" sizes="any" />
      </head>
      <body className={roboto.variable}>
        <NextIntlClientProvider messages={messages}>
          <Providers session={session}>
            <HydrateClient>{children}</HydrateClient>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
