import { redirect } from "@/server/i18n/routing";
import { getLocale } from "next-intl/server";

export async function GET() {
  const locale = await getLocale();

  return redirect({
    href: "/",
    locale,
  });
}
