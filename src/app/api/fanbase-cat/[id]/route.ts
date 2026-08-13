import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const fanbaseCatUpdateSchema = z.object({
  catType: z.enum(["CUPIDUT", "DUDUD"]).optional(),
  title: z.string().min(1, "Judul foto wajib diisi").optional(),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "URL Gambar wajib diisi").optional(),
  orderIndex: z.number().int().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photo = await (prisma as any).fanbaseCat.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Failed to fetch fanbase cat photo:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = fanbaseCatUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const updated = await (prisma as any).fanbaseCat.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update fanbase cat photo:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await (prisma as any).fanbaseCat.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete fanbase cat photo:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
