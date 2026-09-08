import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/textberjalan-config/version
 * Returns the updatedAt timestamp of the textBerjalanConfig setting.
 * Used by /textberjalan to detect W/L/D changes — triggers reload on change.
 */
export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { id: "textBerjalanConfig" },
      select: { updatedAt: true }
    });

    const version = setting?.updatedAt?.getTime() ?? 0;

    const res = NextResponse.json({ version });
    res.headers.set("Cache-Control", "no-store, no-cache");
    return res;
  } catch {
    return NextResponse.json({ version: 0 });
  }
}
