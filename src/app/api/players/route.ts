import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { broadcastPlayerUpdate } from "@/lib/playerEvents";

export const runtime = "nodejs";

const playerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gameId: z.string().default(""),
  vipType: z.enum(["END_LIVE", "PER_MATCH"]),
  status: z.enum(["PLAYING", "PENDING", "QUEUE", "COMPLETED"]),
  matchesTotal: z.number().int().nonnegative().default(0),
  matchesPlayed: z.number().int().nonnegative().default(0),
  notes: z.string().default(""),
});

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: [
        { queueOrder: "asc" },
        { updatedAt: "desc" }
      ]
    });

    const playing = players.filter(p => p.status === "PLAYING");
    const queue = players.filter(p => p.status === "QUEUE");
    const pending = players.filter(p => p.status === "PENDING");
    const completed = players.filter(p => p.status === "COMPLETED");

    const response = NextResponse.json({
      players,
      playing,
      queue,
      pending,
      completed
    });
    // Prevent OBS & browsers from caching stale player data
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    return response;
  } catch (error) {
    console.error("Failed to fetch players:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = playerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const data = result.data;

    // Get max queueOrder for queue sorting
    const maxQueueOrder = await prisma.player.aggregate({
      _max: {
        queueOrder: true
      }
    });

    const nextOrder = (maxQueueOrder._max.queueOrder ?? 0) + 1;

    const newPlayer = await prisma.player.create({
      data: {
        ...data,
        queueOrder: data.status === "QUEUE" ? nextOrder : 0
      }
    });

    // Notify all connected /textberjalan SSE clients to reload
    broadcastPlayerUpdate();

    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error("Failed to create player:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
