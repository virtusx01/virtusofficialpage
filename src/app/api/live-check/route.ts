import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper to check if TikTok user is currently LIVE
export async function checkTikTokLive(username: string): Promise<{ isLive: boolean; liveUrl: string; streamTitle?: string }> {
  const cleanUsername = username.replace(/^@/, "").trim();
  if (!cleanUsername) return { isLive: false, liveUrl: "" };

  const liveUrl = `https://www.tiktok.com/@${cleanUsername}/live`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(liveUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { isLive: false, liveUrl };
    }

    const html = await res.text();

    // Check TikTok LIVE status indicators from SSR html & JSON state
    const isLive =
      (html.includes('"status":2') ||
        html.includes('"room_status":2') ||
        html.includes('"liveRoom"') ||
        html.includes('"liveStatus":2') ||
        html.includes('data-e2e="live-room"') ||
        (html.includes("WATCH LIVE") && !html.includes("LIVE has ended"))) &&
      !html.includes("LIVE has ended") &&
      !html.includes("is not LIVE") &&
      !html.includes("room_status\":4");

    return {
      isLive,
      liveUrl,
      streamTitle: isLive ? "Virtus Official TikTok Live" : undefined,
    };
  } catch (error) {
    console.error("TikTok live check error:", error);
    return { isLive: false, liveUrl };
  }
}

export async function GET() {
  try {
    const result = await checkTikTokLive("onlyvirtus");

    // Automatically sync with system settings
    const settings = await prisma.systemSetting.findUnique({
      where: { id: "settings" },
    });

    if (settings) {
      if (settings.isLive !== result.isLive) {
        await prisma.systemSetting.update({
          where: { id: "settings" },
          data: {
            isLive: result.isLive,
            ...(result.isLive && {
              streamUrl: result.liveUrl,
              streamTitle: settings.streamTitle || "Mabar VIP Stream! (Live on TikTok)",
            }),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      username: "onlyvirtus",
      isLive: result.isLive,
      liveUrl: result.liveUrl,
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Failed in live-check API:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
