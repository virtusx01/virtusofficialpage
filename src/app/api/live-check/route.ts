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

    // Strategy 1: Fetch TikTok HTML profile / live page
    const res = await fetch(liveUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Cache-Control": "no-cache",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { isLive: false, liveUrl };
    }

    const html = await res.text();

    // Check TikTok LIVE status indicators from SSR html & SIGI state
    const hasLiveRoomTag = html.includes('data-e2e="live-room"') || html.includes('data-e2e="live-player"');
    const hasLiveStatus2 = html.includes('"status":2') || html.includes('"room_status":2') || html.includes('"liveStatus":2');
    const hasLiveEndBanner = html.includes("LIVE has ended") || html.includes("Siaran LIVE telah berakhir") || html.includes("is not LIVE");
    const hasStreamPlayer = html.includes("live-room-player") || (html.includes("WATCH LIVE") && !hasLiveEndBanner);

    const isLive = (hasLiveRoomTag || hasLiveStatus2 || hasStreamPlayer) && !hasLiveEndBanner;

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
