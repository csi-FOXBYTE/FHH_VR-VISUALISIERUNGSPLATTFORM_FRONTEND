import { auth } from "@/server/auth/auth";
import { createAccessToken } from "@/server/auth/unityHelpers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return await proxy(request, params);
}
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return await proxy(request, params);
}

function filterOutHTTP2PseudoHeaders(headers: Headers) {
  const out = new Headers();
  for (const [k, v] of headers) {
    if (!k.startsWith(":")) out.set(k, v);
  }
  return out;
}

async function proxy(
  request: NextRequest,
  params: Promise<{ path: string[] }>
) {
  // 1. Build your upstream URL
  const upstreamBase = process.env.BACKEND_URL!; // e.g. https://api.internal.example
  const upstreamPath = (await params).path.join("/");
  const url = `${upstreamBase}/${upstreamPath}?${request.nextUrl.searchParams.toString()}`;

  // 2. Copy method, headers, and body
  const { method, headers, body } = request;
  const forwardedHeaders = new Headers(headers);

  if (!headers.get("authorization")) {
    const session = await auth();

    if (!session) return new NextResponse("ACESS_DENIED", { status: 401 });

    const access_token = await createAccessToken({
      sessionToken: request.cookies.get("authjs.session-token")?.value ?? "",
      userId: session.user.id,
    });

    forwardedHeaders.append("authorization", `Bearer ${access_token}`);
  } else {
    return new NextResponse(null, { status: 401, statusText: "ACCESS_DENIED" });
  }
  // override host if needed
  forwardedHeaders.set("host", new URL(upstreamBase).host);

  // 3. Fetch upstream
  const res = await fetch(url, {
    method,

    headers: forwardedHeaders,
    // NextRequest.body is a ReadableStream for non-GET, non-HEAD
    body: ["GET", "HEAD"].includes(method) ? undefined : body,
    // @ts-expect-error wrong types here but we are 100% sure that we are in NodeJs land
    duplex: "half",
    // optionally: cache, credentials, keepalive, etc.
  });

  // 4. Build NextResponse from upstream response
  const response = new NextResponse(res.body, {
    status: res.status,
    headers: filterOutHTTP2PseudoHeaders(res.headers),
  });
  return response;
}
