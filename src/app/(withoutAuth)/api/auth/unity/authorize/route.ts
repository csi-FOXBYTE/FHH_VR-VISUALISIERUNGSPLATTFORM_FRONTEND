import { signIn } from "@/server/auth/auth";
import { createCode } from "@/server/auth/unityHelpers";
import { NextRequest, NextResponse } from "next/server";

// Additional URIs (e.g. "https://oauth.pstmn.io/v1/callback" for Postman) can be
// added via UNITY_DEV_REDIRECT_URIS, but never take effect in production builds.
const validRedirectUris = [
  "http://localhost:48152/callback",
  "http://localhost:48153/callback",
  ...(process.env.NODE_ENV === "production"
    ? []
    : (process.env.UNITY_DEV_REDIRECT_URIS?.split(",")
        .map((uri) => uri.trim())
        .filter(Boolean) ?? [])),
];

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
    decodeURI(searchParams.get("redirect_uri") ?? ""),
    searchParams.get("scope"),
    searchParams.get("code_challenge"),
    searchParams.get("code_challenge_method"),
    searchParams.get("state"),
  ];

  // 1) Validate required params:
  if (
    response_type !== "code" ||
    client_id !== "urn:fhhvr" ||
    !validRedirectUris.includes(redirect_uri) ||
    !scope ||
    code_challenge_method !== "S256" ||
    !code_challenge ||
    !state
  ) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const code = await createCode({
    client_id,
    code_challenge,
    redirect_uri,
    scope,
    sessionToken: "", // is unknown at this point
    userId: "", // is unknown at this point
  });

  return await signIn("microsoft-entra-id", {
    redirect: true,
    redirectTo: `${
      process.env.BASE_URL
    }/api/auth/unity/redirect?code=${code}&state=${searchParams.get("state")}`,
  });
}
