"use server";

export default async function ProjectWithIdPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <>{projectId}</>;
}
