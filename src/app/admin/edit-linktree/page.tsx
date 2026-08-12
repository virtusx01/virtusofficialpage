"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  Loader2,
  Check,
  Globe,
  MessageCircle,
  Gamepad2,
  Video,
  Music,
  Sparkles,
  Link as LinkIcon,
  Layout,
  User,
  Image as ImageIcon,
  CheckCircle,
  Upload,
} from "lucide-react";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  category: string;
  isEnabled: boolean;
  orderIndex: number;
}

interface ProfileData {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  theme: string;
  socialHeaderTitle: string;
  showLiveBanner: boolean;
  liveBannerTitle: string;
  liveBannerSub: string;
  liveBannerUrl: string;
  liveBannerImage: string;
  links: LinkItem[];
}

const AVAILABLE_ICONS = [
  { id: "whatsapp", label: "WhatsApp (Green)" },
  { id: "whatsapp-dark", label: "WhatsApp (Dark Mode)" },
  { id: "telegram", label: "Telegram" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "youtube", label: "YouTube" },
  { id: "twitter", label: "Twitter / X" },
  { id: "github", label: "GitHub" },
  { id: "tiktok", label: "TikTok" },
  { id: "message", label: "Discord / Chat" },
  { id: "gamepad", label: "Gaming / Mabar" },
  { id: "stream", label: "Stream / Live" },
  { id: "globe", label: "Website / Globe" },
];

const THEMES = [
  { id: "ocean", label: "Ocean Blue", gradient: "from-blue-600 to-indigo-900" },
  { id: "dark", label: "Midnight Dark", gradient: "from-slate-950 to-slate-900" },
  { id: "neon", label: "Cyber Neon", gradient: "from-purple-900 to-slate-950" },
  { id: "sunset", label: "Sunset Glow", gradient: "from-amber-600 to-purple-800" },
  { id: "glass", label: "Glassmorphism", gradient: "from-slate-900 to-indigo-900" },
];

export default function EditLinktreePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<ProfileData>({
    id: "profile",
    name: "Jessica Jones",
    bio: "Seasoned Senior Marketing Manager, excels in strategic marketing.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    theme: "ocean",
    socialHeaderTitle: "Social Media Handles",
    showLiveBanner: true,
    liveBannerTitle: "Contact Me",
    liveBannerSub: "Join Mabar VIP Queue & Exclusive Stream",
    liveBannerUrl: "/mabarvip",
    liveBannerImage: "https://images.unsplash.com/photo-1616588589676-63b3bd49651c?w=600&auto=format&fit=crop&q=80",
    links: [],
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleImageUpload = async (file: File, field: "avatarUrl" | "liveBannerImage") => {
    setUploadingField(field);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setProfile((prev) => ({ ...prev, [field]: data.url }));
      } else {
        alert(`Gagal mengunggah gambar: ${data.error || "Server error"}`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Terjadi kesalahan saat mengunggah gambar: ${err?.message || err}`);
    } finally {
      setUploadingField(null);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchLinktreeData = async () => {
      try {
        const res = await fetch("/api/linktree");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load Linktree data:", err);
        setError("Gagal memuat data linktree.");
      } finally {
        setLoading(false);
      }
    };

    fetchLinktreeData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/linktree", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errData = await res.json();
        setError(errData.error || "Gagal menyimpan perubahan.");
      }
    } catch (err) {
      console.error("Error saving linktree:", err);
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    const newLink: LinkItem = {
      id: `new-${Date.now()}`,
      title: "Link Baru",
      url: "https://",
      icon: "globe",
      category: "custom",
      isEnabled: true,
      orderIndex: profile.links.length,
    };
    setProfile({ ...profile, links: [...profile.links, newLink] });
  };

  const updateLink = (index: number, key: keyof LinkItem, value: any) => {
    const updatedLinks = [...profile.links];
    updatedLinks[index] = { ...updatedLinks[index], [key]: value };
    setProfile({ ...profile, links: updatedLinks });
  };

  const removeLink = (index: number) => {
    const updatedLinks = profile.links.filter((_, i) => i !== index);
    setProfile({ ...profile, links: updatedLinks });
  };

  const moveLink = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === profile.links.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updatedLinks = [...profile.links];
    const temp = updatedLinks[index];
    updatedLinks[index] = updatedLinks[targetIdx];
    updatedLinks[targetIdx] = temp;

    // re-index
    updatedLinks.forEach((item, idx) => (item.orderIndex = idx));
    setProfile({ ...profile, links: updatedLinks });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
        <p className="text-xs text-slate-400 mt-2">Memuat editor linktree...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Pengaturan Linktree / Halaman Utama</span>
              </h1>
              <p className="text-xs text-slate-400">Kustomisasi bio, link sosial, tema, dan kartu promo untuk halaman utama</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Preview Live</span>
            </a>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-sm">
            {error}
          </div>
        )}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Perubahan berhasil disimpan dan telah tayang di Halaman Utama ( / ).</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Middle: Configuration Panel */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section 1: Profil */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <User className="w-5 h-5 text-indigo-400" />
                <span>Informasi Profil</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Tampilan</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100"
                    placeholder="Nama Lengkap / Username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Avatar / Foto Profil URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profile.avatarUrl}
                      onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100"
                      placeholder="https://..."
                    />
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors">
                      {uploadingField === "avatarUrl" ? (
                        <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 text-violet-400" />
                      )}
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "avatarUrl");
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bio / Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100 resize-none"
                  placeholder="Tuliskan bio atau informasi singkat..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Judul Header Sosial Media</label>
                <input
                  type="text"
                  value={profile.socialHeaderTitle}
                  onChange={(e) => setProfile({ ...profile, socialHeaderTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100"
                  placeholder="Contoh: Social Media Handles"
                />
              </div>
            </div>

            {/* Section 2: Tema Visual */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <Layout className="w-5 h-5 text-purple-400" />
                <span>Pilih Tema Tampilan</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, theme: t.id })}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                      profile.theme === t.id
                        ? "border-violet-500 bg-violet-950/30 ring-2 ring-violet-500/50"
                        : "border-slate-800 bg-slate-950/40 hover:bg-slate-900"
                    }`}
                  >
                    <div className={`h-8 w-full rounded-lg bg-gradient-to-r ${t.gradient}`} />
                    <span className="text-xs font-bold text-slate-200">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Daftar Link (Social & Custom) */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-emerald-400" />
                  <span>Daftar Tombol & Link ({profile.links.length})</span>
                </h2>
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Link</span>
                </button>
              </div>

              <div className="space-y-4">
                {profile.links.map((link, idx) => (
                  <div
                    key={link.id || idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-violet-400 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/50">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateLink(idx, "title", e.target.value)}
                          className="bg-transparent font-bold text-sm text-slate-100 border-b border-transparent focus:border-violet-500 outline-none px-1 py-0.5"
                          placeholder="Judul Tombol"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Toggle */}
                        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={link.isEnabled}
                            onChange={(e) => updateLink(idx, "isEnabled", e.target.checked)}
                            className="rounded border-slate-700 text-violet-600 focus:ring-violet-500"
                          />
                          <span>{link.isEnabled ? "Aktif" : "Non-aktif"}</span>
                        </label>

                        {/* Order Controls */}
                        <button
                          type="button"
                          onClick={() => moveLink(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Geser Ke Atas"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(idx, "down")}
                          disabled={idx === profile.links.length - 1}
                          className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Geser Ke Bawah"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeLink(idx)}
                          className="p-1 rounded bg-red-950/50 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors"
                          title="Hapus Link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">URL Tujuan</label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateLink(idx, "url", e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-violet-500"
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Ikon</label>
                        <select
                          value={link.icon}
                          onChange={(e) => updateLink(idx, "icon", e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-violet-500"
                        >
                          {AVAILABLE_ICONS.map((ic) => (
                            <option key={ic.id} value={ic.id}>
                              {ic.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Banner Live & Contact */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <span>Kartu Banner Live / Promo</span>
                </h2>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.showLiveBanner}
                    onChange={(e) => setProfile({ ...profile, showLiveBanner: e.target.checked })}
                    className="rounded border-slate-700 text-violet-600 focus:ring-violet-500"
                  />
                  <span>Tampilkan Banner</span>
                </label>
              </div>

              {profile.showLiveBanner && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Judul Banner</label>
                      <input
                        type="text"
                        value={profile.liveBannerTitle}
                        onChange={(e) => setProfile({ ...profile, liveBannerTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100"
                        placeholder="Contoh: Contact Me / Mabar VIP Queue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sub Judul</label>
                      <input
                        type="text"
                        value={profile.liveBannerSub}
                        onChange={(e) => setProfile({ ...profile, liveBannerSub: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100"
                        placeholder="Deskripsi singkat promo"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL Target Klik</label>
                      <input
                        type="text"
                        value={profile.liveBannerUrl}
                        onChange={(e) => setProfile({ ...profile, liveBannerUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100"
                        placeholder="/mabarvip"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gambar Background URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={profile.liveBannerImage}
                          onChange={(e) => setProfile({ ...profile, liveBannerImage: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100"
                          placeholder="https://..."
                        />
                        <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors">
                          {uploadingField === "liveBannerImage" ? (
                            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 text-violet-400" />
                          )}
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleImageUpload(e.target.files[0], "liveBannerImage");
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Mockup / Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Ringkasan Setup</span>
                <div className="mt-3 flex flex-col items-center gap-2">
                  <img
                    src={profile.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"}
                    alt={profile.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-violet-500 shadow-md"
                  />
                  <h3 className="font-bold text-slate-100">{profile.name || "Jessica Jones"}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 px-2">{profile.bio}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-around text-xs text-slate-400">
                  <div>
                    <span className="block font-bold text-slate-200">{profile.links.filter((l) => l.isEnabled).length}</span>
                    <span>Link Aktif</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-200 uppercase">{profile.theme}</span>
                    <span>Tema Selected</span>
                  </div>
                </div>

                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Buka Halaman Utama ( / )</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
