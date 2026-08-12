import { NextResponse } from "next/server";
import { addSSEClient, removeSSEClient } from "@/lib/playerEvents";

// Force Node.js runtime — required for globalThis shared state to work
// (Edge runtime isolates modules per-request, breaking the SSE broadcaster)
export const runtime = "nodejs";

/**
 * GET /api/players/events
 * Server-Sent Events endpoint. OBS browser source (/textberjalan)
 * connects here and listens for "update" events.
 * When a player is created/updated/deleted, this stream pushes a message
 * and the client reloads — no polling needed.
 */
export async function GET() {
  const encoder = new TextEncoder();
  let ctrl: ReadableStreamDefaultController<Uint8Array>;
  let heartbeatTimer: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      ctrl = controller;
      addSSEClient(ctrl);

      // Send initial comment so OBS knows the connection is alive
      ctrl.enqueue(encoder.encode(": connected\n\n"));

      // Heartbeat every 20s — keeps OBS / proxies from killing the idle connection
      heartbeatTimer = setInterval(() => {
        try {
          ctrl.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeatTimer);
          removeSSEClient(ctrl);
        }
      }, 20_000);
    },
    cancel() {
      // Client disconnected (OBS closed / page navigated away)
      clearInterval(heartbeatTimer);
      removeSSEClient(ctrl);
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      // Prevent Nginx / Vercel / proxies from buffering SSE
      "X-Accel-Buffering": "no",
    }
  });
}
