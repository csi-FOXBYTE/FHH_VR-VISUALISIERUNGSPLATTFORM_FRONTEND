import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: 'Missing "url" parameter' },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "NextJS-Proxy/1.0",
      },
    });

    const headers = new Headers();

    const contentType = response.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 },
    );
  }
}
