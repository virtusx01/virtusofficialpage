import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const fanbaseCatSchema = z.object({
  catType: z.enum(["CUPIDUT", "DUDUD"]),
  title: z.string().min(1, "Judul foto wajib diisi"),
  description: z.string().default(""),
  imageUrl: z.string().min(1, "URL Gambar wajib diisi"),
  orderIndex: z.number().int().default(0),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const catType = searchParams.get("catType");

    const where = catType ? { catType } : {};

    const photos = await (prisma as any).fanbaseCat.findMany({
      where,
      orderBy: [
        { orderIndex: "asc" },
        { createdAt: "desc" },
      ],
    });

    const cupidut = photos.filter((p: any) => p.catType === "CUPIDUT");
    const dudud = photos.filter((p: any) => p.catType === "DUDUD");

    const response = NextResponse.json({
      photos,
      cupidut,
      dudud,
    });

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (error) {
    console.error("Failed to fetch fanbase cat photos:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = fanbaseCatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const data = result.data;

    const maxOrder = await (prisma as any).fanbaseCat.aggregate({
      _max: { orderIndex: true },
    });

    const nextOrder = (maxOrder._max.orderIndex ?? 0) + 1;

    const photo = await (prisma as any).fanbaseCat.create({
      data: {
        ...data,
        orderIndex: data.orderIndex || nextOrder,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Failed to create fanbase cat photo:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
