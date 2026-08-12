import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/players/version
 * Returns the latest updatedAt timestamp of any player.
 * Used by /textberjalan to detect changes — tiny payload, no auth needed.
 */
export async function GET() {
  try {
    const latest = await prisma.player.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true }
    });

    const version = latest?.updatedAt?.getTime() ?? 0;

    const res = NextResponse.json({ version });
    res.headers.set("Cache-Control", "no-store, no-cache");
    return res;
  } catch {
    return NextResponse.json({ version: 0 });
  }
}
