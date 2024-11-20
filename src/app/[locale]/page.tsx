"use client";

import { trpc } from "@/trpc/client";
import { Button } from "@mui/material";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();

  const { data } = trpc.testRouter.test.useQuery();

  const t = useTranslations();

  if (!session) return redirect("/api/auth/signin");

  return (
    <>
      <h1>{t("LandingPage.title")}</h1>
      {t("LandingPage.message")} {session?.user?.email} <br />
      <Button onClick={() => signOut()}>{t("LandingPage.sign-out")}</Button>
      </>
  );
}
