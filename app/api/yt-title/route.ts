import { NextResponse } from "next/server";
import { fetchYouTubeTitle } from "@/lib/youtube";

/**
 * Resolves a YouTube video title via the public oEmbed endpoint, server-side
 * (the browser can't call oEmbed directly — it lacks CORS headers). Gated by
 * auth via middleware, so only signed-in users can hit it.
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !/^[\w-]{11}$/.test(id)) {
    return NextResponse.json({ title: null }, { status: 400 });
  }
  const title = await fetchYouTubeTitle(id);
  return NextResponse.json({ title });
}
