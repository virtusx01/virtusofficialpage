import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  isLive: z.boolean().optional(),
  streamTitle: z.string().optional(),
  streamUrl: z.string().url("Must be a valid URL").or(z.string().length(0)).optional(),
  sociabuzz: z.string().url("Must be a valid URL").or(z.string().length(0)).optional(),
  announcement: z.string().optional(),
});

export async function GET() {
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: "settings" }
    });

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: "settings",
          isLive: false,
          streamTitle: "Mabar VIP Stream!",
          streamUrl: "",
          sociabuzz: "",
          announcement: "Welcome to the stream! Join VIP to play next."
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = settingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    let settings = await prisma.systemSetting.findUnique({
      where: { id: "settings" }
    });

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: "settings",
          ...result.data
        }
      });
    } else {
      settings = await prisma.systemSetting.update({
        where: { id: "settings" },
        data: result.data
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
