import { redirect } from "@/server/i18n/routing";
import { getLocale } from "next-intl/server";

export default async function ProjectOverviewPage({
  params,
}: {
  params: { projectId: string };
}) {
  const locale = await getLocale();
  const { projectId } = await params;

  return redirect({ href: `/projects/${projectId}/details`, locale });
}
