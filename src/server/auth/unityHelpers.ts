import { EncryptJWT, jwtDecrypt, jwtVerify, SignJWT } from "jose";

const accessTokenMaxAge = "60 minutes";
const refreshTokenMaxAge = "1 year";
const audience = "urn:fhhvr";
const codeTokenMaxAge = "5 minutes";

export async function getAccessToken(access_token: string) {
  try {
    const { payload } = await jwtDecrypt<{
      userId: string;
      sessionToken: string;
    }>(access_token, Buffer.from(process.env.NEXTAUTH_SECRET!, "base64"), {
      audience,
      maxTokenAge: accessTokenMaxAge,
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createAccessToken(payload: {
  sessionToken: string;
  userId: string;
}) {
  return await new EncryptJWT({
    sessionToken: payload.sessionToken,
    userId: payload.userId,
  })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setAudience(audience)
    .setExpirationTime(accessTokenMaxAge)
    .setIssuedAt()
    .setNotBefore(new Date())
    .encrypt(Buffer.from(process.env.NEXTAUTH_SECRET!, "base64"));
}

export async function getRefreshToken(refresh_token: string) {
  try {
    const { payload } = await jwtDecrypt<{
      userId: string;
      scope: string;
      client_id: string;
      sessionToken: string;
    }>(refresh_token, Buffer.from(process.env.NEXTAUTH_SECRET!, "base64"), {
      audience,
      maxTokenAge: refreshTokenMaxAge,
    });
    return payload;
  } catch {
    return null;
  }
}

export async function createRefreshToken(payload: {
  userId: string;
  scope: string;
  client_id: string;
  sessionToken: string;
}) {
  return await new EncryptJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setAudience(audience)
    .setExpirationTime(refreshTokenMaxAge)
    .setIssuedAt()
    .setNotBefore(new Date())
    .encrypt(Buffer.from(process.env.NEXTAUTH_SECRET!, "base64"));
}

export async function getCode(code: string) {
  try {
    const { payload } = await jwtVerify<{
      code_challenge: string;
      scope: string;
      redirect_uri: string;
      client_id: string;
    }>(code, Buffer.from(process.env.NEXTAUTH_SECRET!, "base64"), {
      audience: "urn:fhhvr",
      algorithms: ["HS256"],
    });

    return payload;
  } catch {
    return null;
  }
}

export function createCode({
  client_id,
  code_challenge,
  redirect_uri,
  scope,
}: {
  code_challenge: string;
  scope: string;
  redirect_uri: string;
  client_id: string;
}) {
  return new SignJWT({ code_challenge, scope, redirect_uri, client_id })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience("urn:fhhvr")
    .setExpirationTime(codeTokenMaxAge)
    .setNotBefore(new Date())
    .setIssuedAt()
    .sign(Buffer.from(process.env.NEXTAUTH_SECRET!, "base64"));
}
