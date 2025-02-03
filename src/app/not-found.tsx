import { redirect } from "@/server/i18n/routing";
import { getLocale } from "next-intl/server";

export default async function NotFoundRedirect() {
  const locale = await getLocale();
  return redirect({ href: `/not-found`, locale: locale });
}
