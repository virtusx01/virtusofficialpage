"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Gamepad2,
  Sparkles,
  Cat,
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
  ArrowUpRight,
  Activity,
  Database,
  Cpu,
  RefreshCw,
  Server,
  CheckCircle2,
  Radio
} from "lucide-react";

interface QuickStats {
  totalPlayers: number;
  playingCount: number;
  queueCount: number;
  isLive: boolean;
  streamTitle: string;
  totalLinks: number;
  siteTitle: string;
}

interface SystemHealth {
  status: "healthy" | "degraded" | "checking";
  responseTimeMs: number;
  uptimeSeconds: number;
  database: {
    status: "connected" | "disconnected";
    latencyMs: number;
    error: string | null;
  };
  system: {
    nodeVersion: string;
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
    };
  };
  lastChecked: Date | null;
}

const AdminDashboardMenu: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<QuickStats>({
    totalPlayers: 0,
    playingCount: 0,
    queueCount: 0,
    isLive: false,
    streamTitle: "",
    totalLinks: 0,
    siteTitle: "Virtus Official",
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [health, setHealth] = useState<SystemHealth>({
    status: "checking",
    responseTimeMs: 0,
    uptimeSeconds: 0,
    database: {
      status: "connected",
      latencyMs: 0,
      error: null,
    },
    system: {
      nodeVersion: "",
      memory: {
        rssMb: 0,
        heapUsedMb: 0,
        heapTotalMb: 0,
      },
    },
    lastChecked: null,
  });
  const [refreshingHealth, setRefreshingHealth] = useState(false);

  // Authentication Guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  const fetchQuickStats = async () => {
    try {
      const [playersRes, settingsRes, linktreeRes] = await Promise.allSettled([
        fetch("/api/players"),
        fetch("/api/settings"),
        fetch("/api/linktree"),
      ]);

      let totalPlayers = 0;
      let playingCount = 0;
      let queueCount = 0;
      if (playersRes.status === "fulfilled" && playersRes.value.ok) {
        const data = await playersRes.value.json();
        totalPlayers = data.players?.length || 0;
        playingCount = data.playing?.length || 0;
        queueCount = data.queue?.length || 0;
      }

      let isLive = false;
      let streamTitle = "Stream Mabar VIP";
      if (settingsRes.status === "fulfilled" && settingsRes.value.ok) {
        const data = await settingsRes.value.json();
        isLive = !!data.isLive;
        if (data.streamTitle) streamTitle = data.streamTitle;
      }

      let totalLinks = 0;
      let siteTitle = "Virtus Official";
      if (linktreeRes.status === "fulfilled" && linktreeRes.value.ok) {
        const data = await linktreeRes.value.json();
        totalLinks = data.links?.length || 0;
        if (data.siteTitle) siteTitle = data.siteTitle;
      }

      setStats({
        totalPlayers,
        playingCount,
        queueCount,
        isLive,
        streamTitle,
        totalLinks,
        siteTitle,
      });
    } catch (err) {
      console.error("Gagal memuat ringkasan dashboard:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const checkHealth = async () => {
    setRefreshingHealth(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setHealth({
          ...data,
          lastChecked: new Date(),
        });
      } else {
        setHealth((prev) => ({
          ...prev,
          status: "degraded",
          lastChecked: new Date(),
        }));
      }
    } catch (err) {
      setHealth((prev) => ({
        ...prev,
        status: "degraded",
        database: { ...prev.database, status: "disconnected", error: "Connection error" },
        lastChecked: new Date(),
      }));
    } finally {
      setRefreshingHealth(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchQuickStats();
      checkHealth();
      const interval = setInterval(checkHealth, 30000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const formatUptime = (seconds: number) => {
    if (!seconds) return "0 detik";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h} jam ${m} mnt`;
    if (m > 0) return `${m} mnt ${s} dtk`;
    return `${s} detik`;
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Memeriksa sesi admin...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-500/30 selection:text-white">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Colorful Welcome & Overview Header */}
        <section aria-labelledby="dashboard-title" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950/50 via-slate-900/80 to-slate-950 border border-violet-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Portal Kontrol Administrator</span>
              </div>
              <h1 id="dashboard-title" className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Dashboard Menu
              </h1>
              <p className="text-sm text-slate-300/90 mt-2 max-w-xl leading-relaxed">
                Pilih modul manajemen yang ingin kamu kelola. Atur sistem antrean Mabar VIP, konfigurasi live stream, atau modifikasi konten Linktree utama.
              </p>
            </div>

            {/* Live Indicator Chip */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${
                stats.isLive
                  ? "bg-red-500/15 border-red-500/40 text-red-400 shadow-lg shadow-red-950/40"
                  : "bg-slate-900/80 border-slate-800 text-slate-400"
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  stats.isLive ? "bg-red-500 animate-pulse" : "bg-slate-600"
                }`} />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Status Live Stream</span>
                  <span className="text-xs font-bold text-slate-100">
                    {stats.isLive ? "Sedang Berlangsung" : "Tidak Aktif"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Website Healthy Status Panel (Clean and Informative) */}
        <section aria-labelledby="status-kesehatan-website" className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-cyan-950/20 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 id="status-kesehatan-website" className="text-base sm:text-lg font-bold text-white">Status Kesehatan Website</h2>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    health.status === "healthy"
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                      : health.status === "degraded"
                      ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                      : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      health.status === "healthy"
                        ? "bg-emerald-400 animate-pulse"
                        : health.status === "degraded"
                        ? "bg-rose-400 animate-ping"
                        : "bg-slate-400"
                    }`} />
                    {health.status === "healthy" ? "Normal" : health.status === "degraded" ? "Terganggu" : "Memeriksa..."}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pemantauan latensi database PostgreSQL Supabase, kecepatan API, dan memori server secara live.
                </p>
              </div>
            </div>

            <button
              onClick={checkHealth}
              disabled={refreshingHealth}
              className="self-start sm:self-center flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${refreshingHealth ? "animate-spin" : ""}`} />
              <span>Periksa Ulang</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Database */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Koneksi Database</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className={`text-base font-bold ${health.database.status === "connected" ? "text-emerald-300" : "text-rose-400"}`}>
                  {health.database.status === "connected" ? "Terhubung" : "Gagal"}
                </span>
                <span className="text-xs font-mono text-emerald-400/80">
                  {health.database.latencyMs} ms
                </span>
              </div>
            </div>

            {/* Respon API */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Kecepatan API</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-bold text-slate-100">Latensi</span>
                <span className="text-xs font-mono text-cyan-300">
                  {health.responseTimeMs} ms
                </span>
              </div>
            </div>

            {/* RAM */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-violet-500/40 transition-colors">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  <span>Pemakaian RAM</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-bold text-violet-300">
                  {health.system.memory.heapUsedMb} MB
                </span>
                <span className="text-[11px] text-slate-500">
                  / {health.system.memory.heapTotalMb} MB
                </span>
              </div>
            </div>

            {/* Uptime */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  <span>Waktu Aktif Server</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-bold text-amber-300">Uptime</span>
                <span className="text-xs font-medium text-slate-300">
                  {formatUptime(health.uptimeSeconds)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Colorful Quick Stats Summary */}
        <section aria-label="Statistik Ringkas" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:border-emerald-500/30 transition-all shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Sedang Main
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">{stats.playingCount}</span>
              <span className="text-xs text-slate-500 font-medium">Player</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:border-amber-500/30 transition-all shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Dalam Antrean
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">{stats.queueCount}</span>
              <span className="text-xs text-slate-500 font-medium">Player</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:border-violet-500/30 transition-all shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Mabar VIP
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-violet-400">{stats.totalPlayers}</span>
              <span className="text-xs text-slate-500 font-medium">Data</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:border-cyan-500/30 transition-all shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Item Linktree
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-cyan-400">{stats.totalLinks}</span>
              <span className="text-xs text-slate-500 font-medium">Tautan</span>
            </div>
          </div>
        </section>

        {/* Colorful Core Navigation Cards Menu */}
        <section aria-labelledby="pengaturan-menu-heading">
          <h2 id="pengaturan-menu-heading" className="text-base sm:text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-400" />
            <span>Pilih Pengaturan Menu</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD 1: EDIT MABAR VIP (Colorful Violet & Indigo) */}
            <article className="group relative rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/50 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between overflow-hidden hover:shadow-2xl hover:shadow-violet-600/20">
              <div className="absolute top-0 right-0 w-36 h-36 bg-violet-600/15 rounded-full blur-2xl group-hover:bg-violet-600/30 transition-all pointer-events-none" />

              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/40 group-hover:scale-105 transition-transform">
                    <Gamepad2 className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 text-xs font-bold tracking-wide">
                    Live Queue & Players
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-violet-300 transition-colors">
                  Edit Mabar VIP
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Kelola sistem antrean VIP, status pemain (Sedang Main, Mengantri, AFK, Selesai), timer countdown, link Sociabuzz, dan pengaturan live stream.
                </p>

                {/* Preview Features List */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Kontrol status live TikTok dan YouTube stream</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Tambah, edit, reorder dan hapus player VIP</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time live timer dan pengumuman teks berjalan</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  href="/mabarvip"
                  target="_blank"
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <span>Lihat Halaman Publik</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/admin/edit-mabarvip"
                  id="btn-goto-edit-mabarvip"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 transition-all cursor-pointer group-hover:translate-x-0.5"
                >
                  <span>Buka Edit Mabar VIP</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </article>

            {/* CARD 2: EDIT LINKTREE UTAMA (Colorful Amber & Orange) */}
            <article className="group relative rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between overflow-hidden hover:shadow-2xl hover:shadow-amber-600/20">
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-600/15 rounded-full blur-2xl group-hover:bg-amber-600/30 transition-all pointer-events-none" />

              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-600/40 group-hover:scale-105 transition-transform">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold tracking-wide">
                    Homepage & Links
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                  Edit Linktree Utama
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Kustomisasi tampilan homepage: bio profil, avatar, video ads dengan green screen (chroma key), tombol link medsos, leaderboard, kode sensitivitas, dan tema visual.
                </p>

                {/* Preview Features List */}
                <div className="mt-5 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Bio profile, avatar animasi dan background styling</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Kelola tautan sosial, custom banner promo dan video ads</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Kode sensitivitas game dan tombol aksi cepat</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  href="/"
                  target="_blank"
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <span>Lihat Halaman Publik</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/admin/edit-linktree"
                  id="btn-goto-edit-linktree"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 hover:shadow-amber-600/50 transition-all cursor-pointer group-hover:translate-x-0.5"
                >
                  <span>Buka Edit Linktree</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* Additional Admin Tools / Fanbase Card (Colorful Fuchsia) */}
        <section aria-labelledby="fanbase-card-heading" className="rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-fuchsia-500/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/20 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shrink-0 shadow-lg shadow-fuchsia-950/40">
              <Cat className="w-6 h-6" />
            </div>
            <div>
              <h4 id="fanbase-card-heading" className="text-base font-bold text-slate-100">Kustomisasi Fanbase Cat (Cupidut & Dudud)</h4>
              <p className="text-xs text-slate-400 mt-0.5">Kelola foto, video lucu, dan ucapan untuk fanbase kucing kesayangan</p>
            </div>
          </div>
          <Link
            href="/edit/fanbase-cupidut-dudud"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Edit Fanbase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboardMenu;
