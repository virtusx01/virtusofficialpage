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
  Cat,
  Camera,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Scan,
  Copy,
  Timer,
  RotateCcw
} from "lucide-react";
import { parsePlayerTimer, updateNotesWithTimer, formatRemainingTime, formatCompactTime } from "@/lib/timerHelpers";

interface Player {
  id: string;
  name: string;
  gameId: string;
  vipType: "END_LIVE" | "PER_MATCH" | "PER_HOUR";
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
    vipType: "END_LIVE" as "END_LIVE" | "PER_MATCH" | "PER_HOUR",
    status: "QUEUE" as "PLAYING" | "PENDING" | "QUEUE" | "COMPLETED",
    matchesTotal: 3,
    matchesPlayed: 0,
    notes: ""
  });

  // Reorder Modal State
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderingPlayer, setReorderingPlayer] = useState<Player | null>(null);
  const [reorderFormData, setReorderFormData] = useState({
    vipType: "PER_HOUR" as "END_LIVE" | "PER_MATCH" | "PER_HOUR",
    matchesTotal: 2,
    notes: ""
  });

  // Live Timer tick state (forces re-render every second for live countdowns)
  const [, setTimerTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [settingsFormData, setSettingsFormData] = useState<Settings>({
    isLive: false,
    streamTitle: "",
    streamUrl: "",
    sociabuzz: "",
    announcement: ""
  });

  // OCR Screenshot Scanner State
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [ocrErrorMsg, setOcrErrorMsg] = useState<string | null>(null);

  // Real-time Duplicate Game ID check
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Check duplicate gameId against players list
  useEffect(() => {
    if (!formData.gameId || formData.gameId.trim() === "") {
      setDuplicateWarning(null);
      return;
    }

    const currentId = formData.gameId.trim().toLowerCase();
    const match = players.find(
      p => p.gameId && p.gameId.trim().toLowerCase() === currentId && (!editingPlayer || p.id !== editingPlayer.id)
    );

    if (match) {
      setDuplicateWarning(`⚠️ Game ID '${match.gameId}' sudah terdaftar atas nama "${match.name}" (Status: ${match.status})!`);
    } else {
      setDuplicateWarning(null);
    }
  }, [formData.gameId, players, editingPlayer]);

  // Gemini Vision API — scan screenshot for nickname & game ID
  const handleProcessImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setOcrErrorMsg("File harus berupa gambar (PNG, JPG, JPEG, WEBP).");
      return;
    }

    setOcrLoading(true);
    setOcrSuccessMsg(null);
    setOcrErrorMsg(null);

    try {
      const body = new FormData();
      body.append("image", file);

      const res = await fetch("/api/scan-screenshot", {
        method: "POST",
        body
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || `HTTP ${res.status}`);
      }

      const { nickname, gameId } = await res.json();

      if (nickname || gameId) {
        setFormData(prev => ({
          ...prev,
          name: nickname || prev.name,
          gameId: gameId || prev.gameId
        }));

        const details: string[] = [];
        if (nickname) details.push(`Nickname: "${nickname}"`);
        if (gameId) details.push(`Game ID: "${gameId}"`);
        setOcrSuccessMsg(`✅ Berhasil scan screenshot! (${details.join(", ")})`);
      } else {
        setOcrErrorMsg("Tidak dapat mendeteksi Nickname / Game ID dari gambar. Silakan isi manual.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Scan Screenshot Error:", message);
      setOcrErrorMsg(`Gagal memproses gambar: ${message}. Pastikan gambar jelas dan coba lagi.`);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessImage(e.target.files[0]);
    }
  };

  const handlePasteImage = (e: React.ClipboardEvent) => {
    if (e.clipboardData.items) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            handleProcessImage(file);
            break;
          }
        }
      }
    }
  };

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
    setOcrSuccessMsg(null);
    setOcrErrorMsg(null);
    setDuplicateWarning(null);
    setFormData({
      name: "",
      gameId: "",
      vipType: "PER_HOUR",
      status: "QUEUE",
      matchesTotal: 2,
      matchesPlayed: 0,
      notes: ""
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEditClick = (player: Player) => {
    setEditingPlayer(player);
    setOcrSuccessMsg(null);
    setOcrErrorMsg(null);
    setDuplicateWarning(null);
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

  // Open modal for reordering completed player
  const handleReorderClick = (player: Player) => {
    setReorderingPlayer(player);
    setReorderFormData({
      vipType: player.vipType || "PER_HOUR",
      matchesTotal: player.matchesTotal || (player.vipType === "PER_HOUR" ? 2 : player.vipType === "PER_MATCH" ? 3 : 1),
      notes: player.notes || ""
    });
    setIsReorderModalOpen(true);
  };

  // Submit Reorder with custom VIP type, count, and notes
  const handleConfirmReorder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reorderingPlayer) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/players/${reorderingPlayer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "QUEUE",
          vipType: reorderFormData.vipType,
          matchesPlayed: 0,
          matchesTotal: Number(reorderFormData.matchesTotal),
          notes: reorderFormData.notes,
        })
      });

      if (res.ok) {
        setIsReorderModalOpen(false);
        setReorderingPlayer(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memproses reorder.");
      }
    } catch (error) {
      console.error("Reorder error:", error);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setActionLoading(false);
    }
  };

  // Countdown timer controls for PER_HOUR
  const handleStartTimer = async (player: Player) => {
    const timer = parsePlayerTimer(player.notes, player.matchesTotal);
    const now = Date.now();
    // If paused, start from remaining
    let startTimestamp = now;
    if (timer.isPaused) {
      const elapsed = timer.totalSeconds - timer.remainingSeconds;
      startTimestamp = now - (elapsed * 1000);
    }
    const updatedNotes = updateNotesWithTimer(player.notes, "RUNNING", startTimestamp, timer.totalSeconds);

    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: updatedNotes })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Failed to start timer:", err);
    }
  };

  const handlePauseTimer = async (player: Player) => {
    const timer = parsePlayerTimer(player.notes, player.matchesTotal);
    const updatedNotes = updateNotesWithTimer(player.notes, "PAUSED", timer.remainingSeconds, timer.totalSeconds);

    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: updatedNotes })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Failed to pause timer:", err);
    }
  };

  const handleResetTimer = async (player: Player) => {
    const timer = parsePlayerTimer(player.notes, player.matchesTotal);
    const updatedNotes = updateNotesWithTimer(player.notes, "STOPPED", 0, timer.totalSeconds);

    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: updatedNotes })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Failed to reset timer:", err);
    }
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
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          player.vipType === "PER_HOUR"
                            ? "bg-amber-950/40 border-amber-800/50 text-amber-400"
                            : player.vipType === "END_LIVE"
                            ? "bg-purple-950/40 border-purple-800/50 text-purple-400"
                            : "bg-fuchsia-950/40 border-fuchsia-800/50 text-fuchsia-400"
                        }`}>
                          {player.vipType === "PER_HOUR"
                            ? `${player.matchesTotal} Jam`
                            : player.vipType === "END_LIVE"
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

                      {/* VIP PER JAM (PER_HOUR) TIMER TRACKER */}
                      {player.vipType === "PER_HOUR" && (() => {
                        const timer = parsePlayerTimer(player.notes, player.matchesTotal);
                        return (
                          <div className="mt-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                                <Timer className="h-3.5 w-3.5 text-amber-400" />
                                Countdown Timer:
                              </span>
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                timer.isRunning
                                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 animate-pulse"
                                  : timer.isPaused
                                  ? "bg-amber-950/60 text-amber-400 border border-amber-800/50"
                                  : "bg-slate-900 text-slate-400 border border-slate-800"
                              }`}>
                                {formatRemainingTime(timer.remainingSeconds)}
                              </span>
                            </div>

                            {/* Timer Action Buttons */}
                            <div className="flex items-center gap-1.5 pt-1">
                              {!timer.isRunning ? (
                                <button
                                  onClick={() => handleStartTimer(player)}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
                                >
                                  <Play className="h-3.5 w-3.5 fill-current" />
                                  {timer.isPaused ? "Lanjutkan Countdown" : "Mulai Countdown"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePauseTimer(player)}
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
                                >
                                  <Pause className="h-3.5 w-3.5 fill-current" />
                                  Pause Countdown
                                </button>
                              )}

                              <button
                                onClick={() => handleResetTimer(player)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-lg text-xs transition-all border border-slate-700 cursor-pointer"
                                title="Reset Timer ke Jam Awal"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })()}

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
                      ) : player.vipType === "END_LIVE" && player.matchesTotal > 0 ? (
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
                      ) : null}

                      {player.notes && parsePlayerTimer(player.notes).cleanNotes && (
                        <p className="text-xs text-slate-400 italic bg-slate-900/20 p-2 rounded-lg border border-slate-900/30 mt-2">
                          "{parsePlayerTimer(player.notes).cleanNotes}"
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
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                              player.vipType === "PER_HOUR"
                                ? "bg-amber-950/40 border-amber-900/40 text-amber-400"
                                : player.vipType === "END_LIVE"
                                ? "bg-purple-950/40 border-purple-900/40 text-purple-400"
                                : "bg-fuchsia-950/40 border-fuchsia-900/40 text-fuchsia-400"
                            }`}>
                            {player.vipType === "PER_HOUR"
                              ? `Per Jam: ${player.matchesTotal} Jam`
                              : player.vipType === "END_LIVE"
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
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            player.vipType === "PER_HOUR"
                              ? "bg-amber-950/20 border-amber-900/30 text-amber-400"
                              : player.vipType === "END_LIVE"
                              ? "bg-purple-950/20 border-purple-900/30 text-purple-400"
                              : "bg-fuchsia-950/20 border-fuchsia-900/30 text-fuchsia-400"
                          }`}>
                          {player.vipType === "PER_HOUR"
                            ? `Per Jam: ${player.matchesTotal} Jam`
                            : player.vipType === "END_LIVE"
                            ? (player.matchesTotal > 0 ? `Live: ${player.matchesTotal}` : "Until End Live")
                            : `Match: ${player.matchesTotal}`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-450">
                        {player.vipType === "PER_HOUR"
                          ? `${player.matchesTotal} Jam Selesai`
                          : player.vipType === "END_LIVE"
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

            {/* Screenshot OCR Scanner Box */}
            <div
              onPaste={handlePasteImage}
              tabIndex={0}
              className="group relative overflow-hidden bg-gradient-to-br from-violet-950/40 via-slate-900 to-fuchsia-950/30 border border-violet-800/40 hover:border-violet-500/60 p-4 rounded-xl mb-4 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300">
                  <Sparkles className="h-4 w-4 text-fuchsia-400 animate-pulse" />
                  <span>Auto-Fill via Screenshot Profil Game</span>
                </div>
                <span className="text-[10px] bg-violet-900/60 text-violet-200 border border-violet-700/50 px-2 py-0.5 rounded-full font-medium">
                  OCR Cerdas
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Upload atau <strong className="text-violet-300">Paste (Ctrl+V)</strong> screenshot profil game (Valorant Mobile dll). Nickname & Game ID otomatis terbaca!
              </p>

              {/* Upload Input Button */}
              <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-slate-900/80 hover:bg-slate-800 border border-dashed border-violet-600/50 hover:border-violet-400 rounded-lg text-xs font-semibold text-slate-200 transition-all cursor-pointer">
                {ocrLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
                    <span className="text-violet-300">Membaca data screenshot...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 text-violet-400" />
                    <span>Pilih Foto Screenshot / Tempel di Sini</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  disabled={ocrLoading}
                  className="hidden"
                />
              </label>

              {/* Success Notification */}
              {ocrSuccessMsg && (
                <div className="mt-2.5 p-2 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-[11px] text-emerald-300 flex items-start gap-1.5">
                  <Check className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{ocrSuccessMsg}</span>
                </div>
              )}

              {/* Error Notification */}
              {ocrErrorMsg && (
                <div className="mt-2.5 p-2 bg-red-950/40 border border-red-800/60 rounded-lg text-[11px] text-red-300 flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{ocrErrorMsg}</span>
                </div>
              )}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Game ID / IGN (Angka Akun)
                  </label>
                  {formData.gameId && !duplicateWarning && (
                    <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Game ID Tersedia
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.gameId}
                  onChange={(e) => setFormData(prev => ({ ...prev, gameId: e.target.value }))}
                  placeholder="e.g. 1992879945533"
                  className={`w-full bg-slate-900 border px-3 py-2.5 text-sm rounded-xl outline-none text-slate-100 placeholder-slate-600 transition-all ${
                    duplicateWarning
                      ? "border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-500"
                      : "border-slate-800 focus:border-violet-500"
                  }`}
                />
                {duplicateWarning && (
                  <div className="mt-1.5 p-2 bg-red-950/50 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-start gap-1.5 animate-shake">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{duplicateWarning}</span>
                  </div>
                )}
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
                    <option value="PER_HOUR">Per Jam</option>
                    <option value="PER_MATCH">Per Match</option>
                    <option value="END_LIVE">Until End Live</option>
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

              {/* Matches played / total - For PER_HOUR, PER_MATCH or END_LIVE */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {formData.vipType === "PER_HOUR" ? "Jam Selesai" : formData.vipType === "END_LIVE" ? "Sudah Live (x)" : "Mainkan Match"}
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
                    {formData.vipType === "PER_HOUR" ? "Total Jam (Durasi)" : formData.vipType === "END_LIVE" ? "Total Live (x)" : "Total Match"}
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
                  disabled={actionLoading || !!duplicateWarning}
                  className="flex-1 py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-sm font-semibold rounded-xl text-white transition-all cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* REORDER MODAL DIALOG */}
      {isReorderModalOpen && reorderingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-violet-600 to-fuchsia-600"></div>

            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-100">
                  Konfirmasi Reorder VIP
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Player: <span className="text-violet-400 font-bold">{reorderingPlayer.name}</span> {reorderingPlayer.gameId && `(${reorderingPlayer.gameId})`}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsReorderModalOpen(false);
                  setReorderingPlayer(null);
                }}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReorder} className="space-y-4">
              {/* Order Tipe VIP apa? */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  1. Order Tipe VIP Apa?
                </label>
                <select
                  value={reorderFormData.vipType}
                  onChange={(e) => {
                    const newType = e.target.value as "END_LIVE" | "PER_MATCH" | "PER_HOUR";
                    setReorderFormData(prev => ({
                      ...prev,
                      vipType: newType,
                      matchesTotal: newType === "PER_HOUR" ? 2 : newType === "PER_MATCH" ? 3 : 1
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-2.5 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 transition-all cursor-pointer font-semibold"
                >
                  <option value="PER_HOUR">Per Jam (VIP Durasi Jam)</option>
                  <option value="PER_MATCH">Per Match (VIP Hitungan Match)</option>
                  <option value="END_LIVE">Until End Live (VIP Sampai Selesai Live)</option>
                </select>
              </div>

              {/* Totalnya berapa? */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  2. Totalnya Berapa? (
                  {reorderFormData.vipType === "PER_HOUR"
                    ? "Berapa Jam"
                    : reorderFormData.vipType === "PER_MATCH"
                    ? "Berapa Match"
                    : "Berapa Kali Live"}
                  )
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    required
                    value={reorderFormData.matchesTotal}
                    onChange={(e) => setReorderFormData(prev => ({ ...prev, matchesTotal: Number(e.target.value) }))}
                    placeholder={reorderFormData.vipType === "PER_HOUR" ? "Contoh: 2 (untuk 2 Jam)" : "Contoh: 3"}
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-2.5 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 placeholder-slate-600 transition-all font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">
                    {reorderFormData.vipType === "PER_HOUR" ? "Jam" : reorderFormData.vipType === "PER_MATCH" ? "Match" : "x Live"}
                  </span>
                </div>
              </div>

              {/* Catatan tambahan */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  3. Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={reorderFormData.notes}
                  onChange={(e) => setReorderFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Request Hero / Req Core / Catatan Khusus"
                  className="w-full bg-slate-900 border border-slate-800 px-3 py-2 text-sm rounded-xl focus:border-violet-500 outline-none text-slate-100 placeholder-slate-600 transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setIsReorderModalOpen(false);
                    setReorderingPlayer(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-sm font-semibold rounded-xl text-slate-300 transition-all cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-sm font-bold rounded-xl text-white transition-all cursor-pointer text-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Masukkan Antrean
                    </>
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
