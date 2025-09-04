import { auth } from "@/server/auth/auth";
import { createAccessToken } from "@/server/auth/unityHelpers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type P = { params: Promise<{ path: string[] }> };

export async function DELETE(req: NextRequest, p: P) {
  return proxy(req, p.params);
}
export async function PUT(req: NextRequest, p: P) {
  return proxy(req, p.params);
}
export async function PATCH(req: NextRequest, p: P) {
  return proxy(req, p.params);
}
export async function GET(req: NextRequest, p: P) {
  return proxy(req, p.params);
}
export async function POST(req: NextRequest, p: P) {
  return proxy(req, p.params);
}

function filterOutHTTP2PseudoHeaders(headers: Headers) {
  const out = new Headers();
  for (const [k, v] of headers) if (!k.startsWith(":")) out.set(k, v);
  return out;
}

function sanitizeForwardHeaders(incoming: Headers) {
  const h = new Headers(incoming);
  for (const k of [
    "connection",
    "keep-alive",
    "transfer-encoding",
    "upgrade",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "host",
    "content-length", // we'll reassert it explicitly when needed
    "expect", // avoid 100-continue shenanigans
  ])
    h.delete(k);
  return h;
}

async function proxy(
  request: NextRequest,
  params: Promise<{ path: string[] }>
) {
  const { path } = await params;
  const upstreamBase = process.env.BACKEND_URL!;
  const upstreamPath = path.join("/");

  const qs = request.nextUrl.searchParams.toString();
  const url = qs
    ? `${upstreamBase}/${upstreamPath}?${qs}`
    : `${upstreamBase}/${upstreamPath}`;

  const headers = sanitizeForwardHeaders(request.headers);

  // Auth: mint if none present; otherwise pass-through
  if (!headers.has("authorization")) {
    const session = await auth();
    if (!session) return new NextResponse("ACCESS_DENIED", { status: 401 });

    const access_token = await createAccessToken({
      sessionToken:
        request.cookies.get("authjs.session-token")?.value ??
        request.cookies.get("__Secure-authjs.session-token")?.value ??
        "",
      userId: session.user.id,
    });

    headers.set("authorization", `Bearer ${access_token}`);
  }

  // Forward proxy context
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));
  headers.set("x-forwarded-host", request.nextUrl.host);

  // -------- Body handling (Azure-safe) --------
  const method = request.method;
  let outBody: ArrayBuffer | undefined = undefined;

  if (!["GET", "HEAD"].includes(method)) {
    const buf = await request.arrayBuffer();
    const hasBody = buf.byteLength > 0;

    if (hasBody) {
      outBody = buf;

      // Ensure a content-type exists
      const ct = request.headers.get("content-type");
      if (ct) {
        headers.set("content-type", ct);
      } else {
        // Choose a sane default for your API. If it's always JSON, use application/json.
        headers.set("content-type", "application/json");
      }
      // Let undici compute content-length (do not set it here)
    } else {
      // Make it *explicitly* a no-body request so the hop won't inject chunked framing
      headers.delete("content-type");
      headers.set("content-length", "0"); // ← important for Azure / HTTP/2 edges
      outBody = undefined;
    }
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? undefined : outBody,
    });

    console.log({
      method,
      headers,
      body: outBody,
    });

    return new NextResponse(res.body, {
      status: res.status,
      headers: filterOutHTTP2PseudoHeaders(res.headers),
    });
  } catch (err: any) {
    return new NextResponse(
      `Upstream fetch failed: ${err?.cause?.code || err?.name || "EUPSTREAM"}`,
      { status: 502 }
    );
  }
}
