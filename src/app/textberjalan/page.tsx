// ── Server Component ──
// Fetches initial data directly from DB (no client-side fetch needed for first render)
// Client Component handles animation + background polling for live updates
import prisma from "@/lib/prisma";
import TextBerjalanClient from "./TextBerjalanClient";

export const dynamic = "force-dynamic"; // Always SSR fresh (no cache)
export const revalidate = 0;

export default async function TextBerjalanPage() {
  // Fetch initial playing players directly from DB
  let initialPlayers: {
    id: string;
    name: string;
    gameId: string;
    vipType: string;
    status: string;
    matchesPlayed: number;
    matchesTotal: number;
  }[] = [];

  let initialConfig: Record<string, unknown> = {};

  try {
    const [players, settings] = await Promise.all([
      prisma.player.findMany({
        where: { status: "PLAYING" },
        orderBy: { queueOrder: "asc" },
        select: {
          id: true,
          name: true,
          gameId: true,
          vipType: true,
          status: true,
          matchesPlayed: true,
          matchesTotal: true,
        }
      }),
      prisma.systemSetting.findUnique({
        where: { id: "textBerjalanConfig" }
      })
    ]);

    initialPlayers = players;

    if (settings?.announcement) {
      try {
        initialConfig = JSON.parse(settings.announcement);
      } catch {}
    }
  } catch (e) {
    console.error("[TextBerjalanPage] SSR fetch error:", e);
  }

  return (
    <TextBerjalanClient
      initialPlayers={initialPlayers}
      initialConfig={initialConfig}
    />
  );
}
