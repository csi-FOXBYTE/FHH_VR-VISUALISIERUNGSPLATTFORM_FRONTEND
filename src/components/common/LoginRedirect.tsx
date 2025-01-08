"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function LoginRedirect() {
  useEffect(() => {
    signIn("keycloak", {});
  }, []);

  return <>Redirecting to idp</>;
}
