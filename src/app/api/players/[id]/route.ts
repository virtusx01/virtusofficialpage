import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { broadcastPlayerUpdate } from "@/lib/playerEvents";

export const runtime = "nodejs";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  gameId: z.string().optional(),
  vipType: z.enum(["END_LIVE", "PER_MATCH"]).optional(),
  status: z.enum(["PLAYING", "PENDING", "QUEUE", "COMPLETED"]).optional(),
  matchesPlayed: z.number().int().nonnegative().optional(),
  matchesTotal: z.number().int().nonnegative().optional(),
  queueOrder: z.number().int().optional(),
  notes: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const existingPlayer = await prisma.player.findUnique({
      where: { id }
    });

    if (!existingPlayer) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const updateData = { ...result.data };

    // Smart queueOrder adjustment:
    // If the status is changed to QUEUE, and it wasn't QUEUE before
    if (updateData.status === "QUEUE" && existingPlayer.status !== "QUEUE") {
      const maxQueueOrder = await prisma.player.aggregate({
        _max: { queueOrder: true }
      });
      updateData.queueOrder = (maxQueueOrder._max.queueOrder ?? 0) + 1;
    }
    // If status is changed from QUEUE to something else
    else if (updateData.status && updateData.status !== "QUEUE" && existingPlayer.status === "QUEUE") {
      updateData.queueOrder = 0;
    }

    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: updateData,
    });

    // Notify all connected /textberjalan SSE clients to reload
    broadcastPlayerUpdate();

    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error("Failed to update player:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const existingPlayer = await prisma.player.findUnique({
      where: { id }
    });

    if (!existingPlayer) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    await prisma.player.delete({
      where: { id }
    });

    // Notify all connected /textberjalan SSE clients to reload
    broadcastPlayerUpdate();

    return NextResponse.json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error("Failed to delete player:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
