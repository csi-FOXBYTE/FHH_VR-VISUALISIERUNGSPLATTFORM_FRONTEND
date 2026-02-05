import { signIn } from "@/server/auth/auth";
import { getLocale } from "next-intl/server";

export async function GET() {
  const locale = await getLocale();
  return signIn("microsoft-entra-id", { redirectTo: `/${locale}/my-area` });
}
