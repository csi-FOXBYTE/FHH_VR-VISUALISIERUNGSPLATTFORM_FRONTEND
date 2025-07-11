import { signIn } from "@/server/auth/auth";
import { createCode } from "@/server/auth/unityHelpers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const [
    response_type,
    client_id,
    redirect_uri,
    scope,
    code_challenge,
    code_challenge_method,
    state,
  ] = [
    searchParams.get("response_type"),
    searchParams.get("client_id"),
    searchParams.get("redirect_uri"),
    searchParams.get("scope"),
    searchParams.get("code_challenge"),
    searchParams.get("code_challenge_method"),
    searchParams.get("state"),
  ];

  // 1) Validate required params:
  if (
    response_type !== "code" ||
    client_id !== "urn:fhhvr" ||
    !redirect_uri?.startsWith("de.foxbyte.ffh.vrvis://oauth2redirect") ||
    !scope ||
    code_challenge_method !== "S256" ||
    !code_challenge ||
    !state
  ) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const code = createCode({ client_id, code_challenge, redirect_uri, scope });

  return signIn("microsoft-entra-id", {
    callbackUrl: "api:test",
    redirectTo: `de.foxbyte.ffh.vrvis://oauth2redirect?code=${code}&state=${searchParams.get(
      "state"
    )}`,
  });
}
