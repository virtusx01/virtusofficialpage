"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Users,
  Plus,
  Play,
  Pause,
  Clock,
  Trash2,
  Edit2,
  Check,
  X,
  Tv,
  Save,
  ChevronUp,
  ChevronDown,
  Info,
  Loader2,
  PlusCircle,
  MinusCircle,
  FileText,
  Radio,
  ExternalLink,
  Flame,
  Cat
} from "lucide-react";

interface Player {
  id: string;
  name: string;
  gameId: string;
  vipType: "END_LIVE" | "PER_MATCH";
  status: "PLAYING" | "PENDING" | "QUEUE" | "COMPLETED";
  matchesPlayed: number;
  matchesTotal: number;
  queueOrder: number;
  notes: string;
}

interface Settings {
  isLive: boolean;
  streamTitle: string;
  streamUrl: string;
  sociabuzz: string;
  announcement: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Authentication Guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  const [players, setPlayers] = useState<Player[]>([]);
  const [playing, setPlaying] = useState<Player[]>([]);
  const [queue, setQueue] = useState<Player[]>([]);
  const [pending, setPending] = useState<Player[]>([]);
  const [completed, setCompleted] = useState<Player[]>([]);

  const [settings, setSettings] = useState<Settings>({
    isLive: false,
    streamTitle: "Mabar VIP Stream!",
    streamUrl: "",
    sociabuzz: "",
    announcement: "Welcome to the stream! Join VIP to play next."
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    gameId: "",
    vipType: "END_LIVE" as "END_LIVE" | "PER_MATCH",
    status: "QUEUE" as "PLAYING" | "PENDING" | "QUEUE" | "COMPLETED",
    matchesTotal: 3,
    matchesPlayed: 0,
    notes: ""
  });

  const [settingsFormData, setSettingsFormData] = useState<Settings>({
    isLive: false,
    streamTitle: "",
    streamUrl: "",
    sociabuzz: "",
    announcement: ""
  });

  const fetchData = async () => {
    try {
      const playerRes = await fetch("/api/players");
      if (playerRes.ok) {
        const data = await playerRes.json();
        setPlayers(data.players || []);
        setPlaying(data.playing || []);
        setQueue(data.queue || []);
        setPending(data.pending || []);
        setCompleted(data.completed || []);
      }

      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
        setSettingsFormData(data);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  // Open modal for adding
  const handleAddClick = () => {
    setEditingPlayer(null);
    setFormData({
      name: "",
      gameId: "",
      vipType: "END_LIVE",
      status: "QUEUE",
      matchesTotal: 3,
      matchesPlayed: 0,
      notes: ""
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEditClick = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      gameId: player.gameId,
      vipType: player.vipType,
      status: player.status,
      matchesTotal: player.matchesTotal,
      matchesPlayed: player.matchesPlayed,
      notes: player.notes
    });
    setIsModalOpen(true);
  };

  // Pre-fill modal for reordering
  const handleReorderClick = (player: Player) => {
    setEditingPlayer(null); // Create a new record
    setFormData({
      name: player.name,
      gameId: player.gameId,
      vipType: player.vipType,
      status: "QUEUE", // Default back to queue
      matchesTotal: player.matchesTotal || 3,
      matchesPlayed: 0, // Reset played count
      notes: player.notes
    });
    setIsModalOpen(true);
  };

  // Save Player (Create or Edit)
  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const url = editingPlayer ? `/api/players/${editingPlayer.id}` : "/api/players";
      const method = editingPlayer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          matchesTotal: Number(formData.matchesTotal),
          matchesPlayed: Number(formData.matchesPlayed),
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan data.");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setActionLoading(false);
    }
  };

  // Quick status switch
  const handleStatusChange = async (id: string, newStatus: "PLAYING" | "PENDING" | "QUEUE" | "COMPLETED") => {
    try {
      const res = await fetch(`/api/players/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  // Quick increment/decrement matches played
  const handleMatchCountChange = async (player: Player, delta: number) => {
    const newPlayed = Math.max(0, player.matchesPlayed + delta);
    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchesPlayed: newPlayed })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Match count update error:", error);
    }
  };

  // Delete Player
  const handleDeletePlayer = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${name}" dari daftar VIP?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/players/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Gagal menghapus player.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Reorder queue swap logic
  const handleQueueSwap = async (index: number, direction: "UP" | "DOWN") => {
    const swapTargetIndex = direction === "UP" ? index - 1 : index + 1;
    if (swapTargetIndex < 0 || swapTargetIndex >= queue.length) return;

    const currentPlayer = queue[index];
    const targetPlayer = queue[swapTargetIndex];

    try {
      // Swap queue orders
      const p1 = fetch(`/api/players/${currentPlayer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueOrder: targetPlayer.queueOrder })
      });

      const p2 = fetch(`/api/players/${targetPlayer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueOrder: currentPlayer.queueOrder })
      });

      await Promise.all([p1, p2]);
      fetchData();
    } catch (error) {
      console.error("Queue reorder swap error:", error);
    }
  };

  // Save Stream Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsFormData)
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setSettingsFormData(data);
        alert("Pengaturan Live Stream berhasil disimpan!");
      } else {
        alert("Gagal menyimpan pengaturan.");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setSettingsLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
        <p className="text-xs text-slate-400 mt-2">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* Dashboard Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-900 p-6 rounded-2xl">
          <div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">Admin Control Center</h2>
            <p className="text-sm text-slate-400 mt-1">
              Kelola daftar mabar VIP, status bermain, antrean, dan notifikasi stream secara real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="/admin/edit-linktree"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 text-amber-400" />
              Edit Linktree Utama
            </a>
            <a
              href="/edit/fanbase-cupidut-dudud"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all px-4 py-2.5 rounded-xl cursor-pointer"
            >
              <Cat className="h-4 w-4 text-fuchsia-400" />
              Edit Fanbase Cat
            </a>
            <button
              onClick={handleAddClick}
              id="add-vip-btn"
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all px-4 py-2.5 rounded-xl shadow-lg shadow-violet-600/20 cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              Tambah Player VIP
            </button>
          </div>
        </div>

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

        {/* Top Split Section: Settings & Active Players */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLUMN 1: STREAM SETTINGS */}
          <div className="lg:col-span-1 glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Tv className="h-5 w-5 text-violet-400" />
              <h3 className="font-bold text-base text-slate-200">Live Stream Settings</h3>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">

              {/* Toggle Live */}
              <div className="flex items-center justify-between bg-slate-950/50 border border-slate-900 px-4 py-3 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Live</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Tampilkan status LIVE di beranda</span>
                </div>
                <button
                  type="button"
                  id="settings-live-toggle"
                  onClick={() => setSettingsFormData(prev => ({ ...prev, isLive: !prev.isLive }))}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${settingsFormData.isLive ? "bg-red-600 justify-end" : "bg-slate-800 justify-start"
                    }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
                </button>
              </div>

              {/* Stream Title */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Stream Title
                </label>
                <input
                  type="text"
                  value={settingsFormData.streamTitle}
                  onChange={(e) => setSettingsFormData(prev => ({ ...prev, streamTitle: e.target.value }))}
                  placeholder="e.g. Mabar VIP Mobile Legends!"
                  className="w-full bg-slate-950 border border-slate-900 px-3 py-2 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                />
              </div>

              {/* Stream URL */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Stream Link (YouTube/TikTok)
                </label>
                <input
                  type="url"
                  value={settingsFormData.streamUrl}
                  onChange={(e) => setSettingsFormData(prev => ({ ...prev, streamUrl: e.target.value }))}
                  placeholder="e.g. https://tiktok.com/@username/live"
                  className="w-full bg-slate-950 border border-slate-900 px-3 py-2 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                />
              </div>

              {/* Sociabuzz Link */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Sociabuzz Donation Link
                </label>
                <input
                  type="url"
                  value={settingsFormData.sociabuzz}
                  onChange={(e) => setSettingsFormData(prev => ({ ...prev, sociabuzz: e.target.value }))}
                  placeholder="e.g. https://sociabuzz.com/onlyvirtus/tribe"
                  className="w-full bg-slate-950 border border-slate-900 px-3 py-2 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                />
              </div>

              {/* Announcement Message */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Running Announcement
                </label>
                <textarea
                  value={settingsFormData.announcement}
                  onChange={(e) => setSettingsFormData(prev => ({ ...prev, announcement: e.target.value }))}
                  placeholder="Informasi tambahan untuk penonton..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-900 px-3 py-2 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 placeholder-slate-600 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                id="settings-save-btn"
                disabled={settingsLoading}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-sm font-semibold rounded-xl text-violet-400 transition-all cursor-pointer disabled:opacity-50"
              >
                {settingsLoading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4.5 w-4.5" />
                    Simpan Settings
                  </>
                )}
              </button>

            </form>
          </div>

          {/* COLUMN 2: ACTIVE MATCH / CURRENTLY PLAYING */}
          <div className="lg:col-span-2 glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-bold text-base text-slate-200">Sedang Bermain ({playing.length})</h3>
            </div>

            {playing.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-slate-950/30 border border-dashed border-slate-900 rounded-xl">
                <Play className="h-8 w-8 text-slate-700 mb-2" />
                <p className="text-sm font-medium text-slate-500">Tidak ada player yang sedang bermain</p>
                <p className="text-xs text-slate-600 mt-0.5">Ubah status player di tabel antrean ke "Bermain".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playing.map((player) => (
                  <div
                    key={player.id}
                    className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-200 text-base">{player.name}</h4>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {player.vipType === "END_LIVE"
                            ? (player.matchesTotal > 0 ? `Sisa ${player.matchesTotal - player.matchesPlayed}x Live` : "Live")
                            : "Per Match"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">IGN: {player.gameId || "-"}</p>

                      {player.vipType === "END_LIVE" && player.matchesTotal > 0 && (
                        <p className="text-[10px] font-bold text-purple-400 mt-1">
                          Tersisa {player.matchesTotal - player.matchesPlayed}x mabar VIP end live
                        </p>
                      )}

                      {player.vipType === "PER_MATCH" ? (
                        <div className="mt-3 flex items-center justify-between bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-900">
                          <span className="text-xs text-slate-450">Match Tracker:</span>
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => handleMatchCountChange(player, -1)}
                              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                            >
                              <MinusCircle className="h-4.5 w-4.5" />
                            </button>
                            <span className="text-xs font-bold text-fuchsia-400">
                              {player.matchesPlayed} <span className="text-slate-600">/</span> {player.matchesTotal}
                            </span>
                            <button
                              onClick={() => handleMatchCountChange(player, 1)}
                              className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                            >
                              <PlusCircle className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        player.matchesTotal > 0 && (
                          <div className="mt-3 flex items-center justify-between bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-900">
                            <span className="text-xs text-slate-450">Live Tracker:</span>
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => handleMatchCountChange(player, -1)}
                                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                              >
                                <MinusCircle className="h-4.5 w-4.5" />
                              </button>
                              <span className="text-xs font-bold text-purple-400">
                                {player.matchesPlayed} <span className="text-slate-600">/</span> {player.matchesTotal}
                              </span>
                              <button
                                onClick={() => handleMatchCountChange(player, 1)}
                                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                              >
                                <PlusCircle className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </div>
                        )
                      )}

                      {player.notes && (
                        <p className="text-xs text-slate-400 italic bg-slate-900/20 p-2 rounded-lg border border-slate-900/30 mt-2">
                          "{player.notes}"
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900 flex justify-end gap-2">
                      <button
                        onClick={() => handleStatusChange(player.id, "QUEUE")}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-900 hover:bg-slate-850 hover:text-slate-200 px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        <Clock className="h-3 w-3" />
                        Kembali Antre
                      </button>
                      <button
                        onClick={() => handleStatusChange(player.id, "PENDING")}
                        className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded border border-amber-500/20 transition-colors cursor-pointer"
                      >
                        <Pause className="h-3 w-3" />
                        Pause (AFK)
                      </button>
                      <button
                        onClick={() => handleStatusChange(player.id, "COMPLETED")}
                        className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/25 px-2 py-1 rounded border border-emerald-500/20 transition-colors cursor-pointer"
                        title="Selesai VIP"
                      >
                        <Check className="h-3 w-3" />
                        Selesai VIP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Bottom Split Section: Queue List & Pending List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* QUEUE MANAGEMENT TABLE */}
          <div className="lg:col-span-2 glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-violet-400" />
                <h3 className="font-bold text-base text-slate-200">Daftar Antrean ({queue.length})</h3>
              </div>
              <span className="text-[10px] text-slate-500">Gunakan panah untuk memindahkan urutan antrean</span>
            </div>

            {queue.length === 0 ? (
              <div className="py-12 text-center bg-slate-950/30 border border-dashed border-slate-900 rounded-xl">
                <Users className="h-8 w-8 text-slate-700 mb-2 mx-auto" />
                <p className="text-sm font-medium text-slate-500">Antrean kosong</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 text-xs font-bold">
                      <th className="py-2 px-3">No</th>
                      <th className="py-2 px-3">Nama</th>
                      <th className="py-2 px-3">Tipe</th>
                      <th className="py-2 px-3 text-center">Reorder</th>
                      <th className="py-2 px-3 text-right">Aksi Status / Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((player, idx) => (
                      <tr
                        key={player.id}
                        className="border-b border-slate-900/60 hover:bg-slate-900/10 transition-colors group"
                      >
                        <td className="py-3 px-3 font-semibold text-slate-400">#{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-200">{player.name}</div>
                          {player.gameId && <div className="text-[10px] text-slate-500 font-mono mt-0.5">{player.gameId}</div>}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${player.vipType === "END_LIVE"
                              ? "bg-purple-950/40 border-purple-900/40 text-purple-400"
                              : "bg-fuchsia-950/40 border-fuchsia-900/40 text-fuchsia-400"
                            }`}>
                            {player.vipType === "END_LIVE"
                              ? (player.matchesTotal > 0 ? `Sisa ${player.matchesTotal - player.matchesPlayed}x End Live` : "Sisa 1x End Live")
                              : `Match: ${player.matchesTotal}`}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => handleQueueSwap(idx, "UP")}
                              className="p-1 bg-slate-950 border border-slate-850 rounded text-slate-400 hover:text-white transition-colors hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Pindah ke atas"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              disabled={idx === queue.length - 1}
                              onClick={() => handleQueueSwap(idx, "DOWN")}
                              className="p-1 bg-slate-950 border border-slate-850 rounded text-slate-400 hover:text-white transition-colors hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Pindah ke bawah"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end gap-2">
                            {/* Quick Play */}
                            <button
                              onClick={() => handleStatusChange(player.id, "PLAYING")}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg text-emerald-400 transition-all cursor-pointer"
                              title="Set Sedang Bermain"
                            >
                              <Play className="h-3.5 w-3.5" />
                            </button>

                            {/* Quick Pause */}
                            <button
                              onClick={() => handleStatusChange(player.id, "PENDING")}
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 hover:border-amber-500/40 rounded-lg text-amber-400 transition-all cursor-pointer"
                              title="Set Tertunda (AFK)"
                            >
                              <Pause className="h-3.5 w-3.5" />
                            </button>

                            {/* Quick Complete */}
                            <button
                              onClick={() => handleStatusChange(player.id, "COMPLETED")}
                              className="p-1.5 bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/20 hover:border-purple-500/40 rounded-lg text-purple-400 transition-all cursor-pointer"
                              title="Selesai VIP"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>

                            <div className="h-4 w-[1px] bg-slate-900 mx-1"></div>

                            {/* Edit */}
                            <button
                              onClick={() => handleEditClick(player)}
                              className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-750 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                              title="Edit Player"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeletePlayer(player.id, player.name)}
                              className="p-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 hover:border-red-900/60 rounded-lg text-red-400 transition-all cursor-pointer"
                              title="Hapus Player"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* STANDBY / PENDING LIST & ALL OTHER LISTS */}
          <div className="lg:col-span-1 glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Pause className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-base text-slate-200">Tertunda / AFK ({pending.length})</h3>
            </div>

            {pending.length === 0 ? (
              <div className="py-8 text-center bg-slate-950/30 border border-dashed border-slate-900 rounded-xl">
                <p className="text-sm font-medium text-slate-500">Tidak ada player tertunda</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pending.map((player) => (
                  <div
                    key={player.id}
                    className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-3 group"
                  >
                    <div className="truncate">
                      <h4 className="font-semibold text-slate-250 text-sm truncate">{player.name}</h4>
                      {player.gameId && <span className="text-[10px] text-slate-500 font-mono truncate block">{player.gameId}</span>}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Set Active / Queue */}
                      <button
                        onClick={() => handleStatusChange(player.id, "QUEUE")}
                        className="p-1.5 bg-violet-500/10 hover:bg-violet-500/25 border border-violet-500/20 rounded-lg text-violet-400 cursor-pointer"
                        title="Masukkan kembali ke antrean"
                      >
                        <Clock className="h-3.5 w-3.5" />
                      </button>

                      {/* Quick Complete */}
                      <button
                        onClick={() => handleStatusChange(player.id, "COMPLETED")}
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 rounded-lg text-emerald-400 cursor-pointer"
                        title="Selesai VIP"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEditClick(player)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeletePlayer(player.id, player.name)}
                        className="p-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 rounded-lg text-red-400 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* COMPLETED VIP PLAYERS TABLE */}
        <div className="glass-panel border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold text-base text-slate-200">Daftar VIP Selesai ({completed.length})</h3>
            </div>
            <span className="text-xs text-slate-500">History player VIP yang sudah selesai bermain</span>
          </div>

          {completed.length === 0 ? (
            <div className="py-12 text-center bg-slate-950/30 border border-dashed border-slate-900 rounded-xl">
              <Check className="h-8 w-8 text-slate-700 mb-2 mx-auto" />
              <p className="text-sm font-medium text-slate-500">Belum ada player yang selesai</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-400 text-xs font-bold">
                    <th className="py-2 px-3">Nama</th>
                    <th className="py-2 px-3">Game ID</th>
                    <th className="py-2 px-3">Tipe VIP</th>
                    <th className="py-2 px-3">Status Bermain</th>
                    <th className="py-2 px-3">Catatan</th>
                    <th className="py-2 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {completed.map((player) => (
                    <tr
                      key={player.id}
                      className="border-b border-slate-900/60 hover:bg-slate-900/10 transition-colors group opacity-75 hover:opacity-100"
                    >
                      <td className="py-3 px-3 font-bold text-slate-350">{player.name}</td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-500">{player.gameId || "-"}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${player.vipType === "END_LIVE"
                            ? "bg-purple-950/20 border-purple-900/30 text-purple-400"
                            : "bg-fuchsia-950/20 border-fuchsia-900/30 text-fuchsia-400"
                          }`}>
                          {player.vipType === "END_LIVE"
                            ? (player.matchesTotal > 0 ? `Live: ${player.matchesTotal}` : "Until End Live")
                            : `Match: ${player.matchesTotal}`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-450">
                        {player.vipType === "END_LIVE"
                          ? `${player.matchesPlayed}/${player.matchesTotal} Live Selesai`
                          : `${player.matchesPlayed}/${player.matchesTotal} Match Selesai`}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500 italic max-w-xs truncate" title={player.notes}>
                        {player.notes ? `"${player.notes}"` : "-"}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-end gap-2">
                          {/* Reorder Button */}
                          <button
                            onClick={() => handleReorderClick(player)}
                            className="flex items-center gap-1 text-xs font-semibold text-violet-400 bg-violet-950/30 hover:bg-violet-900/40 border border-violet-900/40 hover:border-violet-700/60 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            title="Reorder / Main Lagi"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Reorder
                          </button>

                          {/* Delete from history */}
                          <button
                            onClick={() => handleDeletePlayer(player.id, player.name)}
                            className="p-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 hover:border-red-900/60 rounded-lg text-red-400 transition-all cursor-pointer"
                            title="Hapus Permanen"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-600 to-fuchsia-600"></div>

            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-5">
              <h3 className="text-lg font-black text-slate-100">
                {editingPlayer ? "Edit Data VIP Player" : "Tambah VIP Player Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-4">

              {/* Player Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nama Player / Nickname
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Kenzy Gaming"
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-2.5 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                />
              </div>

              {/* Game ID */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Game ID / IGN (Optional)
                </label>
                <input
                  type="text"
                  value={formData.gameId}
                  onChange={(e) => setFormData(prev => ({ ...prev, gameId: e.target.value }))}
                  placeholder="e.g. 12345678 (2012)"
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-2.5 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                />
              </div>

              {/* Row Grid: Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Tipe VIP
                  </label>
                  <select
                    value={formData.vipType}
                    onChange={(e) => setFormData(prev => ({ ...prev, vipType: e.target.value as any }))}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2.5 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 transition-all cursor-pointer"
                  >
                    <option value="END_LIVE">Until End Live</option>
                    <option value="PER_MATCH">Per Match</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Status Awal
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2.5 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 transition-all cursor-pointer"
                  >
                    <option value="QUEUE">Mengantri</option>
                    <option value="PLAYING">Sedang Bermain</option>
                    <option value="PENDING">Tertunda (AFK)</option>
                    <option value="COMPLETED">Selesai VIP</option>
                  </select>
                </div>
              </div>

              {/* Matches played / total - For PER_MATCH or END_LIVE remaining tracker */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {formData.vipType === "END_LIVE" ? "Sudah Live (x)" : "Mainkan Match"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.matchesPlayed}
                    onChange={(e) => setFormData(prev => ({ ...prev, matchesPlayed: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {formData.vipType === "END_LIVE" ? "Total Live (x)" : "Total Match"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.matchesTotal}
                    onChange={(e) => setFormData(prev => ({ ...prev, matchesTotal: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Request Hero / Req Core"
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-2.5 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-sm font-semibold rounded-xl text-slate-300 transition-all cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="modal-submit-btn"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-sm font-semibold rounded-xl text-white transition-all cursor-pointer text-center disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    "Simpan Data"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
