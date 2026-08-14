"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Tv,
  Search,
  Gamepad2,
  Clock,
  PauseCircle,
  Play,
  Flame,
  RotateCw,
  Info,
  ExternalLink,
  Users,
  Radio,
  CheckCircle
} from "lucide-react";

interface Player {
  id: string;
  name: string;
  gameId: string;
  vipType: "END_LIVE" | "PER_MATCH";
  status: "PLAYING" | "PENDING" | "QUEUE";
  matchesPlayed: number;
  matchesTotal: number;
  queueOrder: number;
  notes: string;
  updatedAt: string;
}

interface Settings {
  isLive: boolean;
  streamTitle: string;
  streamUrl: string;
  sociabuzz: string;
  announcement: string;
}

export default function MabarVipPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playing, setPlaying] = useState<Player[]>([]);
  const [queue, setQueue] = useState<Player[]>([]);
  const [pending, setPending] = useState<Player[]>([]);
  const [completed, setCompleted] = useState<Player[]>([]);
  const [settings, setSettings] = useState<Settings>({
    isLive: false,
    streamTitle: "Mabar VIP Stream!",
    streamUrl: "",
    sociabuzz: "https://sociabuzz.com/onlyvirtus/tribe",
    announcement: "Selamat datang! Join VIP untuk main berikutnya."
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "END_LIVE" | "PER_MATCH">("ALL");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fetch players with no-store
      const playerRes = await fetch("/api/players", { cache: "no-store" });
      if (playerRes.ok) {
        const data = await playerRes.json();
        setPlayers(data.players || []);
        setPlaying(data.playing || []);
        setQueue(data.queue || []);
        setPending(data.pending || []);
        setCompleted(data.completed || []);
      }

      // Fetch settings with no-store
      const settingsRes = await fetch("/api/settings", { cache: "no-store" });
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load live data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup Server-Sent Events (SSE) for real-time instant queue updates
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/events");
      eventSource.onmessage = () => {
        fetchData(true);
      };
      eventSource.onerror = () => {
        // SSE fallback handled by polling interval
      };
    } catch (e) {
      // Fallback
    }

    // Auto refresh every 8 seconds as polling fallback
    const interval = setInterval(() => fetchData(true), 8000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  // Filter logic
  const filterFn = (p: Player) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.gameId.toLowerCase().includes(search.toLowerCase()) ||
      p.notes.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      filterType === "ALL" ? true : p.vipType === filterType;

    return matchesSearch && matchesType;
  };

  const filteredPlaying = playing.filter(filterFn);
  const filteredQueue = queue.filter(filterFn);
  const filteredPending = pending.filter(filterFn);
  const filteredCompleted = completed.filter(filterFn);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* Stream Banner (Only if streaming / live) */}
        {settings.isLive && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/30 via-fuchsia-600/20 to-slate-900 border border-violet-500/20 p-5 md:p-6 glow-purple">
            <div className="absolute top-0 right-0 h-40 w-40 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600 shadow-md">
                  <Radio className="h-6 w-6 text-white animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border border-white"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/20">
                      LIVE NOW
                    </span>
                    <h2 className="text-sm font-semibold text-slate-400">Streaming Active</h2>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">
                    {settings.streamTitle}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                {settings.streamUrl && (
                  <a
                    href={settings.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-all px-4 py-2.5 rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 cursor-pointer border border-violet-500/20"
                  >
                    Watch Stream
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {settings.sociabuzz && (
                  <a
                    href={settings.sociabuzz}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition-all px-4 py-2.5 rounded-xl shadow-lg shadow-orange-650/25 hover:shadow-orange-650/40 cursor-pointer glow-amber border border-orange-500/35"
                  >
                    Order VIP (Sociabuzz)
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sociabuzz CTA Banner (Only show if settings.sociabuzz is set and NOT live) */}
        {!settings.isLive && settings.sociabuzz && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600/15 via-amber-600/5 to-slate-900 border border-orange-500/15 p-5 md:p-6 glow-amber">
            <div className="absolute top-0 right-0 h-40 w-40 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-600 shadow-md">
                  <Flame className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">
                    Mau ikut bermain mabar VIP?
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Silakan klik tombol di samping untuk memesan slot Mabar VIP Anda via Sociabuzz.
                  </p>
                </div>
              </div>
              <a
                href={settings.sociabuzz}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 transition-all px-5 py-2.5 rounded-xl shadow-lg shadow-orange-650/20 hover:shadow-orange-650/35 cursor-pointer self-start md:self-center glow-amber border border-orange-500/35"
              >
                Order VIP via Sociabuzz
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}

        {/* Announcement Ticker */}
        {settings.announcement && (
          <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-xl">
            <Info className="h-5 w-5 text-violet-400 shrink-0" />
            <p className="text-sm font-medium text-slate-300">
              <span className="text-slate-400 font-bold uppercase text-xs mr-2 border border-slate-700 px-1.5 py-0.5 rounded bg-slate-800">
                INFO:
              </span>
              {settings.announcement}
            </p>
          </div>
        )}

        {/* Interactive Bar (Search & Filter) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-slate-900 p-4 rounded-xl">
          {/* Filters */}
          <div className="flex gap-2">
            {(["ALL", "END_LIVE", "PER_MATCH"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`text-xs font-semibold uppercase px-4 py-2 rounded-lg transition-all border cursor-pointer ${filterType === type
                  ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/15"
                  : "bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
              >
                {type === "ALL" ? "Semua VIP" : type === "END_LIVE" ? "End Live" : "Per Match"}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama / Game ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none text-slate-100 placeholder-slate-500 transition-all"
              />
            </div>
            <button
              onClick={() => fetchData(false)}
              title="Refresh manual"
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            >
              <RotateCw className={`h-4.5 w-4.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Live Tracking Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* SECTION 1: SEDANG BERMAIN (PLAYING) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                <h2 className="font-bold text-lg text-slate-200 tracking-wide">Sedang Bermain</h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                {filteredPlaying.length} Player
              </span>
            </div>

            {loading ? (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center h-48">
                <RotateCw className="h-8 w-8 text-violet-500 animate-spin mb-2" />
                <p className="text-xs text-slate-400">Loading data player...</p>
              </div>
            ) : filteredPlaying.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center text-center h-48">
                <Gamepad2 className="h-10 w-10 text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-400">Belum ada yang bermain</p>
                <p className="text-xs text-slate-500 mt-1">Admin akan memperbarui status di dashboard.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredPlaying.map((player) => (
                  <div
                    key={player.id}
                    className="relative overflow-hidden glass-panel rounded-2xl border-l-4 border-l-emerald-500 border-t border-r border-b border-slate-800 p-5 glow-green transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Active Match
                        </span>
                        <h3 className="text-xl font-bold text-slate-100 mt-2 truncate max-w-[180px]">
                          {player.name}
                        </h3>
                        {player.gameId && (
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-slate-500" />
                            IGN: <span className="text-slate-300 font-mono">{player.gameId}</span>
                          </p>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${player.vipType === "END_LIVE"
                        ? "bg-purple-950/40 border-purple-800/50 text-purple-400"
                        : "bg-fuchsia-950/40 border-fuchsia-800/50 text-fuchsia-400"
                        }`}>
                        {player.vipType === "END_LIVE" ? "Until End Live" : "Per Match"}
                      </span>
                    </div>

                    {/* Match counter if PER_MATCH */}
                    {player.vipType === "PER_MATCH" && (
                      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Match Played:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-fuchsia-400">{player.matchesPlayed}</span>
                          <span className="text-xs text-slate-600">/</span>
                          <span className="text-xs font-semibold text-slate-400">{player.matchesTotal}</span>
                        </div>
                      </div>
                    )}

                    {player.notes && (
                      <div className="mt-3 bg-slate-950/50 border border-slate-900 px-3 py-2 rounded-xl text-xs text-slate-400 font-medium italic">
                        "{player.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: DAFTAR ANTREAN (QUEUE) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-violet-400" />
                <h2 className="font-bold text-lg text-slate-200 tracking-wide">Daftar Antrean</h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-full border border-violet-500/20">
                {filteredQueue.length} Orang
              </span>
            </div>

            {loading ? (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center h-48">
                <RotateCw className="h-8 w-8 text-violet-500 animate-spin mb-2" />
                <p className="text-xs text-slate-400">Loading antrean...</p>
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center text-center h-48">
                <Clock className="h-10 w-10 text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-400">Antrean kosong</p>
                <p className="text-xs text-slate-500 mt-1">Daftar VIP sekarang untuk masuk antrean!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredQueue.map((player, idx) => (
                  <div
                    key={player.id}
                    className="glass-panel rounded-xl border border-slate-850 p-4 flex items-center justify-between gap-4 hover:border-slate-700/60 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 truncate">
                      {/* Position Queue Indicator */}
                      <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-sm text-violet-400 shadow-inner">
                        #{idx + 1}
                      </div>
                      <div className="truncate">
                        <h3 className="font-semibold text-slate-200 text-sm truncate">
                          {player.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono truncate">
                          {player.gameId || "No game ID"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${player.vipType === "END_LIVE"
                        ? "bg-purple-950/30 text-purple-400 border border-purple-900/30"
                        : "bg-fuchsia-950/30 text-fuchsia-400 border border-fuchsia-900/30"
                        }`}>
                        {player.vipType === "END_LIVE"
                          ? (player.matchesTotal > 0 ? `Sisa ${player.matchesTotal - player.matchesPlayed}x End Live` : "Sisa 1x End Live")
                          : `Match: ${player.matchesTotal}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: TERTUNDA / STANDBY (PENDING) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                <PauseCircle className="h-5 w-5 text-amber-500" />
                <h2 className="font-bold text-lg text-slate-200 tracking-wide">Tertunda / AFK</h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                {filteredPending.length} Player
              </span>
            </div>

            {loading ? (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center h-48">
                <RotateCw className="h-8 w-8 text-violet-500 animate-spin mb-2" />
                <p className="text-xs text-slate-400">Loading...</p>
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center text-center h-48">
                <PauseCircle className="h-10 w-10 text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-400">Tidak ada player tertunda</p>
                <p className="text-xs text-slate-500 mt-1">Semua player aktif di antrean atau sedang bermain.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredPending.map((player) => (
                  <div
                    key={player.id}
                    className="glass-panel rounded-xl border border-slate-850 p-4 flex items-center justify-between gap-4 opacity-70 hover:opacity-100 hover:border-slate-800 transition-all duration-300"
                  >
                    <div className="truncate">
                      <h3 className="font-semibold text-slate-300 text-sm truncate">
                        {player.name}
                      </h3>
                      {player.gameId && (
                        <p className="text-xs text-slate-500 font-mono truncate">
                          {player.gameId}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Tertunda
                      </span>
                      <span className="text-[8px] text-slate-500 font-medium">
                        {player.vipType === "END_LIVE"
                          ? (player.matchesTotal > 0 ? `Sisa ${player.matchesTotal - player.matchesPlayed}x End Live` : "Sisa 1x End Live")
                          : `${player.matchesPlayed}/${player.matchesTotal} M`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 4: SELESAI VIP (COMPLETED) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500 animate-pulse" />
                <h2 className="font-bold text-lg text-slate-200 tracking-wide">Selesai VIP</h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                {filteredCompleted.length} Player
              </span>
            </div>

            {loading ? (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center h-48">
                <RotateCw className="h-8 w-8 text-violet-500 animate-spin mb-2" />
                <p className="text-xs text-slate-400">Loading...</p>
              </div>
            ) : filteredCompleted.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center text-center h-48">
                <CheckCircle className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-sm font-semibold text-slate-400">Belum ada player selesai</p>
                <p className="text-xs text-slate-500 mt-1">Daftar player selesai akan tampil di sini.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredCompleted.map((player) => (
                  <div
                    key={player.id}
                    className="glass-panel rounded-xl border border-slate-850 p-4 flex items-center justify-between gap-4 opacity-60 hover:opacity-100 hover:border-slate-800 transition-all duration-300"
                  >
                    <div className="truncate">
                      <h3 className="font-semibold text-slate-300 text-sm truncate line-through decoration-slate-600">
                        {player.name}
                      </h3>
                      {player.gameId && (
                        <p className="text-xs text-slate-500 font-mono truncate">
                          {player.gameId}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Selesai
                      </span>
                      <span className="text-[8px] text-slate-500 font-medium">
                        {player.vipType === "END_LIVE"
                          ? `${player.matchesPlayed}/${player.matchesTotal} Live`
                          : `${player.matchesPlayed}/${player.matchesTotal} Match`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
