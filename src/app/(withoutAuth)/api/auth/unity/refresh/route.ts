import {
  createAccessToken,
  createRefreshToken,
  getRefreshToken,
} from "@/server/auth/unityHelpers";
import prisma from "@/server/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // 1. Parse form data
  const form = Object.fromEntries(await request.formData()) as Record<
    string,
    string
  >;
  const { grant_type, refresh_token, client_id } = form;

  if (grant_type !== "refresh_token" || !refresh_token) {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Missing or invalid parameters",
      },
      { status: 400 }
    );
  }

  // 2. Decrypt & verify the refresh token
  const payload = await getRefreshToken(refresh_token);

  if (!payload)
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Invalid or expired refresh_token",
      },
      { status: 400 }
    );

  if (client_id !== payload.client_id)
    return NextResponse.json(
      {
        error: "invalid_grant",
        error_description: "Invalid client_id",
      },
      {
        status: 400,
      }
    );

  const adapter = PrismaAdapter(prisma);

  let sessionToken = payload.sessionToken;

  if ((await adapter.getSessionAndUser!(sessionToken)) === null) {
    if ((await adapter.getUser!(payload.userId)) === null)
      throw new Error("User does not exist!");

    for (let i = 0; i < 64; i++) {
      try {
        const tempSessionToken = crypto.randomUUID();

        await adapter.createSession!({
          sessionToken: tempSessionToken,
          expires: dayjs().add(7, "day").toDate(),
          userId: payload.userId,
        });

        sessionToken = tempSessionToken;
      } catch {}
    }
  }

  // 4. Issue a new access token
  const access_token = await createAccessToken({
    sessionToken,
    userId: payload.userId,
  });

  // 5. Issue a fresh refresh token
  const new_refresh_token = await createRefreshToken({
    client_id: payload.client_id,
    scope: payload.scope,
    sessionToken,
    userId: payload.userId,
  });

  // 6. Return them
  return NextResponse.json({
    access_token,
    refresh_token: new_refresh_token,
    token_type: "Bearer",
    expires_in: 3600, // seconds until access_token expiry
    scope: payload.scope,
  });
}
