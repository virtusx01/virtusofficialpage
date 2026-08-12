import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const textBerjalanConfigSchema = z.object({
  text: z.string().default(""),
  showPlaying: z.boolean().default(true),
  direction: z.enum(["rtl", "ltr"]).default("rtl"),
  speed: z.number().default(12),
  isFullWidth: z.boolean().default(true),
  width: z.number().default(900),
  height: z.number().default(60),
  verticalPos: z.number().default(50),
  fontSize: z.number().default(28),
  fontFamily: z.string().default("Baloo 2"),
  fontColor: z.string().default("#ffffff"),
  bold: z.boolean().default(true),
  italic: z.boolean().default(false),
  strokeEnabled: z.boolean().default(true),
  strokeColor: z.string().default("#000000"),
  strokeWidth: z.number().default(2.5),
  bgColor: z.string().default("#10b981"),
  bgOpacity: z.number().default(80),
  borderRadius: z.number().default(8),
  borderWidth: z.number().default(0),
  borderColor: z.string().default("#ffffff"),
  loopMode: z.enum(["continuous", "full"]).default("continuous"),
  gap: z.number().default(120),
});

export async function GET() {
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: "textBerjalanConfig" }
    });

    if (!settings) {
      return NextResponse.json({});
    }

    return NextResponse.json(JSON.parse(settings.announcement || "{}"));
  } catch (error) {
    console.error("Failed to fetch text berjalan config:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = textBerjalanConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const jsonString = JSON.stringify(parsed.data);

    await prisma.systemSetting.upsert({
      where: { id: "textBerjalanConfig" },
      update: { announcement: jsonString },
      create: {
        id: "textBerjalanConfig",
        announcement: jsonString
      }
    });

    return NextResponse.json({ success: true, config: parsed.data });
  } catch (error) {
    console.error("Failed to save text berjalan config:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
