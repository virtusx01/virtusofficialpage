"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
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

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  targetUrl: string;
  imageUrl: string;
  isEnabled: boolean;
  orderIndex: number;
}

interface TopButtonItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  isShareAction: boolean;
  isEnabled: boolean;
  orderIndex: number;
}

interface CodeItem {
  id: string;
  title: string;
  code: string;
  isEnabled: boolean;
  orderIndex: number;
}

interface ProfileData {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  avatarBorderColor: string;
  theme: string;
  socialHeaderTitle: string;
  showLiveBanner: boolean;
  liveBannerTitle: string;
  liveBannerSub: string;
  liveBannerUrl: string;
  liveBannerImage: string;
  siteTitle?: string;
  siteSubtitle?: string;
  siteLogoUrl?: string;
  footerDesc?: string;
  links: LinkItem[];
  banners: BannerItem[];
  topButtons: TopButtonItem[];
  codes: CodeItem[];
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
    avatarBorderColor: "from-cyan-400 via-indigo-500 to-purple-500",
    theme: "ocean",
    socialHeaderTitle: "Social Media Handles",
    showLiveBanner: true,
    liveBannerTitle: "Contact Me",
    liveBannerSub: "Join Mabar VIP Queue & Exclusive Stream",
    liveBannerUrl: "/mabarvip",
    liveBannerImage: "https://images.unsplash.com/photo-1616588589676-63b3bd49651c?w=600&auto=format&fit=crop&q=80",
    siteTitle: "Virtus Official",
    siteSubtitle: "Streamer TIDAK KIKIR",
    siteLogoUrl: "",
    footerDesc: "Platform resmi Virtus Official. Dapatkan akses ke game streaming eksklusif, antrean VIP real-time, dan tautan sosial media resmi kami.",
    links: [],
    banners: [],
    topButtons: [],
    codes: [],
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [faviconSuccess, setFaviconSuccess] = useState(false);

  const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.85): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        return resolve(file);
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              resolve(blob || file);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleImageUpload = async (file: File, field: "avatarUrl" | "liveBannerImage") => {
    setUploadingField(field);
    try {
      const compressedBlob = await compressImage(file, 800, 800, 0.85);
      const formData = new FormData();
      formData.append("file", compressedBlob, file.name.replace(/\.[^/.]+$/, "") + ".jpg");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setProfile((prev) => ({ ...prev, [field]: data.url }));
        setSaveSuccess(false);
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

  const handleBannerImageUpload = async (file: File, index: number) => {
    setUploadingField(`banner-${index}`);
    try {
      const compressedBlob = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressedBlob, file.name.replace(/\.[^/.]+$/, "") + ".jpg");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        updateBanner(index, "imageUrl", data.url);
        setSaveSuccess(false);
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

  const addBanner = () => {
    const newBanner: BannerItem = {
      id: `new-${Date.now()}`,
      title: "Judul Banner Baru",
      subtitle: "Deskripsi singkat promo banner",
      badgeText: "PROMO / EVENT",
      targetUrl: "/mabarvip",
      imageUrl: "https://images.unsplash.com/photo-1616588589676-63b3bd49651c?w=600&auto=format&fit=crop&q=80",
      isEnabled: true,
      orderIndex: profile.banners?.length || 0,
    };
    setProfile({ ...profile, banners: [...(profile.banners || []), newBanner] });
  };

  const updateBanner = (index: number, key: keyof BannerItem, value: any) => {
    const updated = [...(profile.banners || [])];
    updated[index] = { ...updated[index], [key]: value };
    setProfile({ ...profile, banners: updated });
  };

  const removeBanner = (index: number) => {
    const updated = (profile.banners || []).filter((_, i) => i !== index);
    setProfile({ ...profile, banners: updated });
  };

  const moveBanner = (index: number, direction: "up" | "down") => {
    const bannersList = profile.banners || [];
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === bannersList.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...bannersList];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((item, idx) => (item.orderIndex = idx));
    setProfile({ ...profile, banners: updated });
  };

  const addTopButton = () => {
    const newBtn: TopButtonItem = {
      id: `new-${Date.now()}`,
      title: "Tombol Baru",
      url: "/mabarvip",
      icon: "gamepad",
      isShareAction: false,
      isEnabled: true,
      orderIndex: (profile.topButtons || []).length,
    };
    setProfile({ ...profile, topButtons: [...(profile.topButtons || []), newBtn] });
  };

  const updateTopButton = (index: number, key: keyof TopButtonItem, value: any) => {
    const updated = [...(profile.topButtons || [])];
    updated[index] = { ...updated[index], [key]: value };
    setProfile({ ...profile, topButtons: updated });
  };

  const removeTopButton = (index: number) => {
    const updated = (profile.topButtons || []).filter((_, i) => i !== index);
    setProfile({ ...profile, topButtons: updated });
  };

  const moveTopButton = (index: number, direction: "up" | "down") => {
    const list = profile.topButtons || [];
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === list.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...list];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((item, idx) => (item.orderIndex = idx));
    setProfile({ ...profile, topButtons: updated });
  };

  const addCode = () => {
    const newCode: CodeItem = {
      id: `new-${Date.now()}`,
      title: "Kode Sensitivitas",
      code: "7284-9102-1827-0192",
      isEnabled: true,
      orderIndex: (profile.codes || []).length,
    };
    setProfile({ ...profile, codes: [...(profile.codes || []), newCode] });
  };

  const updateCode = (index: number, key: keyof CodeItem, value: any) => {
    const updated = [...(profile.codes || [])];
    updated[index] = { ...updated[index], [key]: value };
    setProfile({ ...profile, codes: updated });
  };

  const removeCode = (index: number) => {
    const updated = (profile.codes || []).filter((_, i) => i !== index);
    setProfile({ ...profile, codes: updated });
  };

  const moveCode = (index: number, direction: "up" | "down") => {
    const list = profile.codes || [];
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === list.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...list];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((item, idx) => (item.orderIndex = idx));
    setProfile({ ...profile, codes: updated });
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
            {/* Section 0.5: Branding Website (Header & Footer) */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800/80 pb-3">
                <Globe className="w-5 h-5 text-fuchsia-400" />
                <span>Branding Header & Footer Website</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Judul Header & Footer</label>
                  <input
                    type="text"
                    value={profile.siteTitle || "Virtus Official"}
                    onChange={(e) => setProfile({ ...profile, siteTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100"
                    placeholder="Contoh: Virtus Official"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sub-judul / Tagline Website</label>
                  <input
                    type="text"
                    value={profile.siteSubtitle || "Streamer TIDAK KIKIR"}
                    onChange={(e) => setProfile({ ...profile, siteSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100"
                    placeholder="Contoh: Streamer TIDAK KIKIR"
                  />
                </div>
              </div>

              {/* Logo Website */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Logo Website <span className="text-slate-500 font-normal">(disimpan statis di /public/logo.png – dimuat instan)</span>
                </label>
                <div className="flex items-center gap-3">
                  {/* Preview logo */}
                  <div className="h-12 w-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/logo.png" alt="Logo Statis" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-300 font-medium">Logo Aktif: <code className="text-violet-400 font-mono text-[11px]">/public/logo.png</code></p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Logo Header dan Footer sekarang otomatis memuat file statis dari folder public agar instan dan tanpa jeda.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deskripsi Footer Website</label>
                <textarea
                  rows={2}
                  value={profile.footerDesc || ""}
                  onChange={(e) => setProfile({ ...profile, footerDesc: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100 resize-none"
                  placeholder="Deskripsi singkat yang tampil di bagian paling bawah footer..."
                />
              </div>

              {/* Favicon / Icon Tab Browser */}
              <div className="pt-3 border-t border-slate-800/60">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Icon Tab Browser (Favicon) <span className="text-slate-500 font-normal">(disimpan statis di /public/favicon.ico)</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src="/favicon.ico"
                      alt="Favicon"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-300 font-medium">Favicon Aktif: <code className="text-violet-400 font-mono text-[11px]">/public/favicon.ico</code></p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Favicon otomatis tampil di tab browser untuk semua pengunjung website.</p>
                  </div>
                </div>
              </div>
            </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bio / Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100 resize-none"
                    placeholder="Tuliskan bio atau informasi singkat..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Warna / Gradient Border Profil</label>
                  <input
                    type="text"
                    value={profile.avatarBorderColor || "from-cyan-400 via-indigo-500 to-purple-500"}
                    onChange={(e) => setProfile({ ...profile, avatarBorderColor: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-xs font-mono outline-none text-slate-100"
                    placeholder="from-cyan-400 via-indigo-500 to-purple-500"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      { label: "Cyan Purple", class: "from-cyan-400 via-indigo-500 to-purple-500" },
                      { label: "Neon Pink", class: "from-violet-500 via-fuchsia-500 to-pink-500" },
                      { label: "Emerald Teal", class: "from-emerald-400 via-teal-500 to-cyan-500" },
                      { label: "Sunset Fire", class: "from-amber-400 via-orange-500 to-red-500" },
                      { label: "Electric Blue", class: "from-blue-500 via-sky-400 to-cyan-300" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setProfile({ ...profile, avatarBorderColor: preset.class })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
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

            {/* Section 1.5: Tombol Aksi Atas (Header Top Buttons) */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-cyan-400" />
                  <span>Tombol Aksi Atas (Header Buttons) ({(profile.topButtons || []).length})</span>
                </h2>
                <button
                  type="button"
                  onClick={addTopButton}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Tombol Atas</span>
                </button>
              </div>

              {(profile.topButtons || []).length === 0 ? (
                <div className="p-4 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-400">Belum ada tombol atas. Klik tombol di atas untuk menambah.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(profile.topButtons || []).map((btn, idx) => (
                    <div key={btn.id || idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={btn.title}
                            onChange={(e) => updateTopButton(idx, "title", e.target.value)}
                            className="bg-transparent font-bold text-sm text-slate-100 border-b border-transparent focus:border-cyan-500 outline-none px-1 py-0.5"
                            placeholder="Judul Tombol"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={btn.isEnabled}
                              onChange={(e) => updateTopButton(idx, "isEnabled", e.target.checked)}
                              className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                            />
                            <span>{btn.isEnabled ? "Aktif" : "Non-aktif"}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => moveTopButton(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveTopButton(idx, "down")}
                            disabled={idx === (profile.topButtons || []).length - 1}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTopButton(idx)}
                            className="p-1 rounded bg-red-950/50 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">URL Tujuan</label>
                          <input
                            type="text"
                            value={btn.url}
                            onChange={(e) => updateTopButton(idx, "url", e.target.value)}
                            disabled={btn.isShareAction}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-cyan-500 disabled:opacity-40"
                            placeholder={btn.isShareAction ? "Fitur Share Otomatis" : "/mabarvip"}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Ikon</label>
                          <select
                            value={btn.icon}
                            onChange={(e) => updateTopButton(idx, "icon", e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-cyan-500"
                          >
                            {AVAILABLE_ICONS.map((ic) => (
                              <option key={ic.id} value={ic.id}>
                                {ic.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center pt-4">
                          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={btn.isShareAction}
                              onChange={(e) => updateTopButton(idx, "isShareAction", e.target.checked)}
                              className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                            />
                            <span>Aksi Bagikan Profil</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 1.7: Kode Sensitivitas & Kode Game (Dibawah Bio) */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-violet-400" />
                  <span>Kode Sensitivitas & Game (Tampil Di Bawah Bio) ({(profile.codes || []).length})</span>
                </h2>
                <button
                  type="button"
                  onClick={addCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kode</span>
                </button>
              </div>

              {(profile.codes || []).length === 0 ? (
                <div className="p-4 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-400">Belum ada kode sensitivitas. Klik tombol di atas untuk menambah.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(profile.codes || []).map((c, idx) => (
                    <div key={c.id || idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-mono font-bold text-violet-400 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/50">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={c.title}
                            onChange={(e) => updateCode(idx, "title", e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-bold focus:border-violet-500 outline-none w-full max-w-xs"
                            placeholder="Contoh: Kode Sensitivitas PUBG"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={c.isEnabled}
                              onChange={(e) => updateCode(idx, "isEnabled", e.target.checked)}
                              className="rounded border-slate-700 text-violet-500 focus:ring-violet-500"
                            />
                            <span>{c.isEnabled ? "Aktif" : "Non-aktif"}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => moveCode(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveCode(idx, "down")}
                            disabled={idx === (profile.codes || []).length - 1}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCode(idx)}
                            className="p-1 rounded bg-red-950/50 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Isi Kode (Sensitivitas / Layout / ID)</label>
                        <input
                          type="text"
                          value={c.code}
                          onChange={(e) => updateCode(idx, "code", e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono font-bold outline-none text-slate-100 focus:border-violet-500"
                          placeholder="Contoh: 7284-9102-1827-0192"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

            {/* Section 4: Banner Cards CRUD Manager */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <span>Kelola Kartu Banner Live / Promo ({(profile.banners || []).length})</span>
                </h2>
                <button
                  type="button"
                  onClick={addBanner}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Banner</span>
                </button>
              </div>

              {(profile.banners || []).length === 0 ? (
                <div className="p-6 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-xl space-y-2">
                  <p className="text-xs text-slate-400">Belum ada kartu banner. Klik tombol di atas untuk membuat banner baru.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(profile.banners || []).map((banner, idx) => (
                    <div
                      key={banner.id || idx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={banner.title}
                            onChange={(e) => updateBanner(idx, "title", e.target.value)}
                            className="bg-transparent font-bold text-sm text-slate-100 border-b border-transparent focus:border-amber-500 outline-none px-1 py-0.5"
                            placeholder="Judul Banner"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={banner.isEnabled}
                              onChange={(e) => updateBanner(idx, "isEnabled", e.target.checked)}
                              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                            />
                            <span>{banner.isEnabled ? "Aktif" : "Non-aktif"}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => moveBanner(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                            title="Geser Ke Atas"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBanner(idx, "down")}
                            disabled={idx === (profile.banners || []).length - 1}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                            title="Geser Ke Bawah"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeBanner(idx)}
                            className="p-1 rounded bg-red-950/50 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors"
                            title="Hapus Banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Sub Judul / Deskripsi</label>
                          <input
                            type="text"
                            value={banner.subtitle}
                            onChange={(e) => updateBanner(idx, "subtitle", e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-amber-500"
                            placeholder="Deskripsi promo"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Text Badge Pill</label>
                          <input
                            type="text"
                            value={banner.badgeText}
                            onChange={(e) => updateBanner(idx, "badgeText", e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-amber-500"
                            placeholder="LIVE / QUEUE, PROMO, dll"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">URL Target Klik</label>
                          <input
                            type="text"
                            value={banner.targetUrl}
                            onChange={(e) => updateBanner(idx, "targetUrl", e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-amber-500"
                            placeholder="/mabarvip"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Gambar Background URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={banner.imageUrl}
                            onChange={(e) => updateBanner(idx, "imageUrl", e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-amber-500"
                            placeholder="https://..."
                          />
                          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors">
                            {uploadingField === `banner-${idx}` ? (
                              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleBannerImageUpload(e.target.files[0], idx);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <p className="text-xs text-slate-400 px-2 whitespace-pre-line">{profile.bio}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-around text-xs text-slate-400">
                  <div>
                    <span className="block font-bold text-slate-200">{profile.links.filter((l) => l.isEnabled).length}</span>
                    <span>Link Aktif</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-200">{(profile.banners || []).filter((b) => b.isEnabled).length}</span>
                    <span>Banner Aktif</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-200 uppercase">{profile.theme}</span>
                    <span>Tema</span>
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
      <Footer />
    </div>
  );
}
