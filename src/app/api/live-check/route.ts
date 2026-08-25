import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper to check if TikTok user is currently LIVE with multi-layer detection
export async function checkTikTokLive(username: string): Promise<{ isLive: boolean; liveUrl: string; streamTitle?: string }> {
  const cleanUsername = username.replace(/^@/, "").trim();
  if (!cleanUsername) return { isLive: false, liveUrl: "" };

  const liveUrl = `https://www.tiktok.com/@${cleanUsername}/live`;
  const profileUrl = `https://www.tiktok.com/@${cleanUsername}`;

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
  };

  try {
    // Strategy 1: Fetch Live Page
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(liveUrl, {
      signal: controller.signal,
      headers,
      redirect: "follow",
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();

      // Detection indicators on TikTok Live page
      const hasLiveEndBanner =
        html.includes("LIVE has ended") ||
        html.includes("Siaran LIVE telah berakhir") ||
        html.includes("is not LIVE") ||
        html.includes("Saat ini tidak sedang LIVE") ||
        html.includes('"status":4') ||
        html.includes('"room_status":4');

      // Check SIGI_STATE or Universal Data JSON
      let isLiveFromState = false;
      try {
        const sigiMatch = html.match(/<script id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/i);
        const uniMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i);
        const jsonStr = sigiMatch?.[1] || uniMatch?.[1];
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          const liveRoom = parsed?.LiveRoom?.liveRoomUserInfo || parsed?.LiveRoom || parsed?.liveRoom;
          if (liveRoom?.status === 2 || liveRoom?.liveStatus === 2 || liveRoom?.room_status === 2) {
            isLiveFromState = true;
          }
        }
      } catch (e) {
        // Fallback to pattern matching
      }

      const hasLiveRoomTag =
        html.includes('data-e2e="live-room"') ||
        html.includes('data-e2e="live-player"') ||
        html.includes('live-room-player');
      
      const hasLiveStatus2 =
        html.includes('"status":2') ||
        html.includes('"room_status":2') ||
        html.includes('"liveStatus":2');

      const isLive = (isLiveFromState || hasLiveRoomTag || hasLiveStatus2) && !hasLiveEndBanner;

      return {
        isLive,
        liveUrl,
        streamTitle: isLive ? "Virtus Official TikTok Live" : undefined,
      };
    }

    // Strategy 2: Fallback to Profile Page
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
    const resProfile = await fetch(profileUrl, {
      signal: controller2.signal,
      headers,
    });
    clearTimeout(timeoutId2);

    if (resProfile.ok) {
      const phtml = await resProfile.text();
      const hasLiveBadge =
        (phtml.includes('"live":true') || phtml.includes('"isLive":true') || phtml.includes('"room_status":2')) &&
        !phtml.includes("LIVE has ended");

      return {
        isLive: hasLiveBadge,
        liveUrl,
        streamTitle: hasLiveBadge ? "Virtus Official TikTok Live" : undefined,
      };
    }

    return { isLive: false, liveUrl };
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
      statusText: result.isLive ? "Sedang Live" : "Belum Live",
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Failed in live-check API:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
