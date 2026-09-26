import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const startTime = Date.now();

  // 1. Check Database connection & latency
  let dbStatus: "connected" | "disconnected" = "disconnected";
  let dbLatency = 0;
  let dbError: string | null = null;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
    dbStatus = "connected";
  } catch (err: any) {
    dbError = err?.message || "Failed to query database";
    console.error("Health check DB failure:", err);
  }

  // 2. Check Memory & Process metrics
  const memUsage = process.memoryUsage();
  const memory = {
    rssMb: Math.round(memUsage.rss / 1024 / 1024),
    heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
    heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
  };

  const uptimeSeconds = Math.round(process.uptime());

  // 3. Check App Response Time
  const totalResponseTimeMs = Date.now() - startTime;
  const isHealthy = dbStatus === "connected";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      responseTimeMs: totalResponseTimeMs,
      uptimeSeconds,
      database: {
        status: dbStatus,
        latencyMs: dbLatency,
        error: dbError,
      },
      system: {
        nodeVersion: process.version,
        memory,
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
}
