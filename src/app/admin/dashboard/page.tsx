"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Gamepad2,
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
  Link2
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

export default function AdminDashboardMenu() {
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
            <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Memeriksa sesi admin...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Banner Ringkas Navigasi */}
        <section className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs text-slate-400 font-medium">Panel Kendali Admin</span>
            <h1 className="text-2xl font-bold text-white mt-1">
              Dashboard Utama
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
              Atur modul antrean Mabar VIP, kelola live stream, kustomisasi tautan Linktree, dan pantau status sistem web secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
              stats.isLive
                ? "bg-rose-950/30 border-rose-800/60 text-rose-300"
                : "bg-slate-950 border-slate-800 text-slate-400"
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                stats.isLive ? "bg-rose-500 animate-pulse" : "bg-slate-600"
              }`} />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium">Status Siaran</span>
                <span className="text-xs font-semibold text-slate-200">
                  {stats.isLive ? "Live Aktif" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Website Healthy Status Panel */}
        <section aria-labelledby="status-kesehatan-website" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-slate-300" />
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 id="status-kesehatan-website" className="text-base font-semibold text-white">Status Kesehatan Website</h2>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                    health.status === "healthy"
                      ? "bg-teal-950/40 border-teal-800/60 text-teal-300"
                      : health.status === "degraded"
                      ? "bg-rose-950/40 border-rose-800/60 text-rose-300"
                      : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      health.status === "healthy"
                        ? "bg-teal-400"
                        : health.status === "degraded"
                        ? "bg-rose-400 animate-ping"
                        : "bg-slate-400"
                    }`} />
                    {health.status === "healthy" ? "Normal" : health.status === "degraded" ? "Terganggu" : "Memeriksa..."}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Informasi koneksi database PostgreSQL, respon server, dan penggunaan memori.
                </p>
              </div>
            </div>

            <button
              onClick={checkHealth}
              disabled={refreshingHealth}
              className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingHealth ? "animate-spin" : ""}`} />
              <span>Periksa Ulang</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Database */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span>Koneksi Database</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm font-semibold text-slate-200">
                  {health.database.status === "connected" ? "Terhubung" : "Gagal"}
                </span>
                <span className="text-xs text-slate-400">
                  {health.database.latencyMs} ms
                </span>
              </div>
            </div>

            {/* Respon API */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Waktu Respon</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm font-semibold text-slate-200">Kecepatan API</span>
                <span className="text-xs text-slate-400">
                  {health.responseTimeMs} ms
                </span>
              </div>
            </div>

            {/* RAM */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <span>Penggunaan Memori</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm font-semibold text-slate-200">
                  {health.system.memory.heapUsedMb} MB
                </span>
                <span className="text-xs text-slate-500">
                  dari {health.system.memory.heapTotalMb} MB
                </span>
              </div>
            </div>

            {/* Uptime */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-slate-400" />
                  <span>Waktu Aktif Server</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm font-semibold text-slate-200">Uptime</span>
                <span className="text-xs text-slate-400">
                  {formatUptime(health.uptimeSeconds)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Ringkasan Angka Data */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400 block mb-1">
              Sedang Bermain
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100">{stats.playingCount}</span>
              <span className="text-xs text-slate-500">Player</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400 block mb-1">
              Dalam Antrean
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100">{stats.queueCount}</span>
              <span className="text-xs text-slate-500">Player</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400 block mb-1">
              Total Data VIP
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100">{stats.totalPlayers}</span>
              <span className="text-xs text-slate-500">Orang</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <span className="text-xs text-slate-400 block mb-1">
              Tautan Linktree
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100">{stats.totalLinks}</span>
              <span className="text-xs text-slate-500">Item</span>
            </div>
          </div>
        </div>

        {/* Menu Pilihan Utama */}
        <section aria-labelledby="pilih-menu-pengaturan">
          <h2 id="pilih-menu-pengaturan" className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Pilihan Menu Pengaturan</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KARTU 1: EDIT MABAR VIP */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Gamepad2 className="w-6 h-6 text-slate-300" />
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">
                    Queue & Stream
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">
                  Edit Mabar VIP
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Kelola sistem antrean VIP, status pemain (Sedang Main, Mengantri, AFK, Selesai), timer countdown, link donasi, dan pengaturan siaran live.
                </p>

                <ul className="mt-5 space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Kontrol status siaran langsung TikTok dan YouTube</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Tambah, edit, ubah urutan dan hapus player VIP</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Timer hitung mundur real-time dan teks berjalan</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                <Link
                  href="/mabarvip"
                  target="_blank"
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <span>Halaman Antrean</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/admin/edit-mabarvip"
                  id="btn-goto-edit-mabarvip"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
                >
                  <span>Buka Edit Mabar VIP</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* KARTU 2: EDIT LINKTREE UTAMA */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Link2 className="w-6 h-6 text-slate-300" />
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">
                    Homepage & Links
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">
                  Edit Linktree Utama
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Kustomisasi tampilan homepage: bio profil, avatar, video promo, tombol tautan medsos, leaderboard, kode sensitivitas, dan tema visual.
                </p>

                <ul className="mt-5 space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Bio profil, foto avatar dan background halaman</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Kelola tautan sosial, banner promosi dan video</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Kode sensitivitas game dan tombol tindakan</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
                <Link
                  href="/"
                  target="_blank"
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  <span>Halaman Utama</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/admin/edit-linktree"
                  id="btn-goto-edit-linktree"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
                >
                  <span>Buka Edit Linktree</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Pendukung: Fanbase */}
        <section aria-labelledby="fanbase-kucing" className="rounded-xl bg-slate-900 border border-slate-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Cat className="w-5 h-5 text-slate-400" />
            <div>
              <h4 id="fanbase-kucing" className="text-sm font-semibold text-slate-200">Kustomisasi Fanbase Cat (Cupidut dan Dudud)</h4>
              <p className="text-xs text-slate-400 mt-0.5">Kelola foto, video dan ucapan untuk fanbase kucing kesayangan</p>
            </div>
          </div>
          <Link
            href="/edit/fanbase-cupidut-dudud"
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Edit Fanbase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
