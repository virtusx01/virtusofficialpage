"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ChromaVideoAd } from "@/components/ChromaVideoAd";
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
  AlignLeft,
  AlignCenter,
  Rows3,
  Columns3,
  Maximize2,
  Trophy,
} from "lucide-react";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  customIconUrl?: string;
  layout?: "row" | "column";
  textAlign?: "left" | "center";
  itemAlign?: "left" | "center";
  iconWidth?: number;
  category: string;
  sectionTitle?: string;
  sectionBgColor?: string;
  sectionTextColor?: string;
  waCustomMessage?: string;
  showInHeaderIcons?: boolean;
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

export interface VideoAdItem {
  id: string;
  title: string;
  videoUrl: string;
  targetUrl: string;
  chromaEnable: boolean;
  chromaColor: string;
  chromaSimilarity: number;
  chromaSmoothness: number;
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
  categoryBgColor?: string;
  categoryTextColor?: string;
  showLiveBanner: boolean;
  liveBannerTitle: string;
  liveBannerSub: string;
  liveBannerUrl: string;
  liveBannerImage: string;
  siteTitle?: string;
  siteSubtitle?: string;
  siteLogoUrl?: string;
  footerDesc?: string;
  showLeaderboard?: boolean;
  leaderboardTitle?: string;
  sociabuzzTribeId?: string;
  leaderboardMode?: string;
  leaderboardUrl?: string;
  leaderboardHeaderIcon?: string;
  leaderboardHeaderColor?: string;
  leaderboardHeaderFont?: string;
  leaderboardHeaderSize?: string;
  showVideoAd?: boolean;
  videoAdUrl?: string;
  videoAdTargetUrl?: string;
  videoAdChromaEnable?: boolean;
  videoAdChromaColor?: string;
  videoAdChromaSimilarity?: number;
  videoAdChromaSmoothness?: number;
  videoAdWidth?: number;
  videoAdWidthDesktop?: number;
  videoAdWidthMobile?: number;
  videoAdPosition?: string;
  videoAdOffsetX?: number;
  videoAdOffsetY?: number;
  videoAdZIndex?: number;
  showSocialHeaderIcons?: boolean;
  socialIconPosition?: string;
  socialIconSize?: string;
  socialIconGap?: string;
  socialIconColor?: string;
  socialIconUseBrandColor?: boolean;
  socialIconBg?: string;
  socialIconCustomBg?: string;
  socialIconShape?: string;
  videoAds?: VideoAdItem[];
  links: LinkItem[];
  banners: BannerItem[];
  topButtons: TopButtonItem[];
  codes: CodeItem[];
}

const AVAILABLE_ICONS = [
  { id: "custom", label: "✨ Kustom (Upload / URL Icon Sendiri)" },
  { id: "topup", label: "Top Up / Diamond (Amber)" },
  { id: "store", label: "Toko / Store (Cyan)" },
  { id: "coins", label: "Points / Astra Points (Gold)" },
  { id: "shopping-bag", label: "Belanja / Shopping" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "whatsapp", label: "WhatsApp (Green)" },
  { id: "whatsapp-dark", label: "WhatsApp (Dark Mode)" },
  { id: "telegram", label: "Telegram" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter / X" },
  { id: "github", label: "GitHub" },
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
    name: "Virtus Official",
    bio: "Streamer TIDAK KIKIR | Mobile Legends & Gaming Content Creator 🔥",
    avatarUrl: "/logo.png",
    avatarBorderColor: "from-cyan-400 via-indigo-500 to-purple-500",
    theme: "ocean",
    socialHeaderTitle: "Social Media Handles",
    categoryBgColor: "",
    categoryTextColor: "",
    showLiveBanner: true,
    liveBannerTitle: "Cupidut & Dudud Lovers",
    liveBannerSub: "Galeri album foto eksklusif dua kucing kesayangan Virtus",
    liveBannerUrl: "/fanbase-cupidut-dudud",
    liveBannerImage: "https://images.unsplash.com/photo-1616588589676-63b3bd49651c?w=600&auto=format&fit=crop&q=80",
    siteTitle: "Virtus Official",
    siteSubtitle: "Streamer TIDAK KIKIR",
    siteLogoUrl: "",
    footerDesc: "Platform resmi Virtus Official. Dapatkan akses ke game streaming eksklusif, antrean VIP real-time, dan tautan sosial media resmi kami.",
    showLeaderboard: true,
    leaderboardTitle: "TOP SUPPORTERS BULAN INI",
    sociabuzzTribeId: "8913094574",
    leaderboardMode: "top3",
    leaderboardUrl: "https://sociabuzz.com/pro/tribe/topleaderboard/v2/8913094574",
    leaderboardHeaderIcon: "trophy",
    leaderboardHeaderColor: "",
    leaderboardHeaderFont: "sans",
    leaderboardHeaderSize: "2xl",
    showVideoAd: false,
    videoAdUrl: "",
    videoAdTargetUrl: "",
    videoAdChromaEnable: true,
    videoAdChromaColor: "#00FF00",
    videoAdChromaSimilarity: 0.35,
    videoAdChromaSmoothness: 0.1,
    videoAdWidth: 180,
    videoAdWidthDesktop: 180,
    videoAdWidthMobile: 120,
    videoAdPosition: "bottom-right",
    videoAdOffsetX: 20,
    videoAdOffsetY: 20,
    videoAdZIndex: 50,
    showSocialHeaderIcons: true,
    socialIconPosition: "under_bio",
    socialIconSize: "md",
    socialIconGap: "md",
    socialIconColor: "",
    socialIconUseBrandColor: false,
    socialIconBg: "glass",
    socialIconCustomBg: "",
    socialIconShape: "circle",
    videoAds: [],
    links: [],
    banners: [],
    topButtons: [],
    codes: [],
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [faviconSuccess, setFaviconSuccess] = useState(false);

  // Bio Link Generator States
  const [bioLinkText, setBioLinkText] = useState("Aoi");
  const [bioLinkUrl, setBioLinkUrl] = useState("https://tiktok.com/@onlyvirtus");
  const [bioLinkBold, setBioLinkBold] = useState(true);
  const [bioLinkUnderline, setBioLinkUnderline] = useState(true);
  const [bioLinkColor, setBioLinkColor] = useState("#38bdf8");
  const [showBioLinkModal, setShowBioLinkModal] = useState(false);

  const insertBioLink = () => {
    if (!bioLinkText.trim() || !bioLinkUrl.trim()) return;
    const opts: string[] = [];
    if (bioLinkColor) opts.push(bioLinkColor);
    if (bioLinkBold) opts.push("bold");
    if (bioLinkUnderline) opts.push("underline");

    const optString = opts.length > 0 ? `|${opts.join("|")}` : "";
    const markdownSyntax = `[${bioLinkText.trim()}](${bioLinkUrl.trim()}${optString})`;

    setProfile((prev) => ({
      ...prev,
      bio: prev.bio ? `${prev.bio} ${markdownSyntax}` : markdownSyntax,
    }));
    setShowBioLinkModal(false);
  };

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

  const deleteUploadedFile = async (url?: string) => {
    if (!url || !url.includes('/storage/v1/object/public/assets/')) return;
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
    } catch (e) {
      console.error('Failed to delete file from Supabase:', e);
    }
  };

  const handleImageUpload = async (file: File, field: "avatarUrl" | "liveBannerImage") => {
    setUploadingField(field);
    try {
      const compressedBlob = await compressImage(file, 800, 800, 0.85);
      const formData = new FormData();
      formData.append("file", compressedBlob, file.name.replace(/\.[^/.]+$/, "") + ".jpg");
      if (profile[field]) {
        formData.append("oldUrl", profile[field]);
      }

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

  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleVideoUpload = async (file: File) => {
    if (!file) return;
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (profile.videoAdUrl) {
        formData.append("oldUrl", profile.videoAdUrl);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setProfile((prev) => ({ ...prev, videoAdUrl: data.url }));
        setSaveSuccess(false);
      } else {
        alert(`Gagal mengunggah video: ${data.error || "Server error"}`);
      }
    } catch (err: any) {
      console.error("Video upload error:", err);
      alert(`Terjadi kesalahan saat mengunggah video: ${err?.message || err}`);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleVideoAdUploadItem = async (file: File, index: number) => {
    if (!file) return;
    setUploadingField(`videoAd-${index}`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (profile.videoAds?.[index]?.videoUrl) {
        formData.append("oldUrl", profile.videoAds[index].videoUrl);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        updateVideoAd(index, "videoUrl", data.url);
        setSaveSuccess(false);
      } else {
        alert(`Gagal mengunggah video: ${data.error || "Server error"}`);
      }
    } catch (err: any) {
      console.error("Video upload error:", err);
      alert(`Terjadi kesalahan saat mengunggah video: ${err?.message || err}`);
    } finally {
      setUploadingField(null);
    }
  };

  const addVideoAd = () => {
    const newAd: VideoAdItem = {
      id: `new-${Date.now()}`,
      title: `Iklan Video ${(profile.videoAds || []).length + 1}`,
      videoUrl: "",
      targetUrl: "",
      chromaEnable: true,
      chromaColor: "#00FF00",
      chromaSimilarity: 0.35,
      chromaSmoothness: 0.1,
      isEnabled: true,
      orderIndex: (profile.videoAds || []).length,
    };
    setProfile({ ...profile, videoAds: [...(profile.videoAds || []), newAd] });
  };

  const updateVideoAd = (index: number, key: keyof VideoAdItem, value: any) => {
    const updated = [...(profile.videoAds || [])];
    updated[index] = { ...updated[index], [key]: value };
    setProfile({ ...profile, videoAds: updated });
  };

  const removeVideoAd = (index: number) => {
    const targetAd = profile.videoAds?.[index];
    if (targetAd?.videoUrl) {
      deleteUploadedFile(targetAd.videoUrl);
    }
    const updated = (profile.videoAds || []).filter((_, i) => i !== index);
    setProfile({ ...profile, videoAds: updated });
  };

  const moveVideoAd = (index: number, direction: "up" | "down") => {
    const list = profile.videoAds || [];
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
    setProfile({ ...profile, videoAds: updated });
  };

  const handleBannerImageUpload = async (file: File, index: number) => {
    setUploadingField(`banner-${index}`);
    try {
      const compressedBlob = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressedBlob, file.name.replace(/\.[^/.]+$/, "") + ".jpg");
      if (profile.banners?.[index]?.imageUrl) {
        formData.append("oldUrl", profile.banners[index].imageUrl);
      }

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

  const handleLinkIconUpload = async (file: File, index: number) => {
    setUploadingField(`link-icon-${index}`);
    try {
      const compressedBlob = await compressImage(file, 800, 800, 0.9);
      const formData = new FormData();
      formData.append("file", compressedBlob, file.name.replace(/\.[^/.]+$/, "") + ".png");
      if (profile.links?.[index]?.customIconUrl) {
        formData.append("oldUrl", profile.links[index].customIconUrl);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        const updatedLinks = [...profile.links];
        updatedLinks[index] = {
          ...updatedLinks[index],
          icon: "custom",
          customIconUrl: data.url,
        };
        setProfile({ ...profile, links: updatedLinks });
        setSaveSuccess(false);
      } else {
        alert(`Gagal mengunggah icon: ${data.error || "Server error"}`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Terjadi kesalahan saat mengunggah icon: ${err?.message || err}`);
    } finally {
      setUploadingField(null);
    }
  };

  const addLink = () => {
    const newLink: LinkItem = {
      id: `new-${Date.now()}`,
      title: "Link Baru",
      url: "https://",
      icon: "globe",
      customIconUrl: "",
      layout: "row",
      textAlign: "left",
      itemAlign: "left",
      iconWidth: 48,
      category: "custom",
      sectionTitle: "",
      sectionBgColor: "",
      sectionTextColor: "",
      waCustomMessage: "",
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
    const targetLink = profile.links[index];
    if (targetLink?.customIconUrl) {
      deleteUploadedFile(targetLink.customIconUrl);
    }
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
    const targetBanner = profile.banners?.[index];
    if (targetBanner?.imageUrl) {
      deleteUploadedFile(targetBanner.imageUrl);
    }
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

            {/* Section 0.8: Iklan Video Overlay (Chroma Key MP4) */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-purple-950/40 border border-purple-800/40 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span>Iklan Video Overlay (Playlist & Chroma Key)</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                        Rotation 60 FPS
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tampilkan 1 atau banyak iklan video MP4 secara bergantian (rotasi berurutan) tanpa background.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={profile.showVideoAd || false}
                    onChange={(e) => setProfile({ ...profile, showVideoAd: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  <span className="ml-2 text-xs font-semibold text-slate-300">
                    {profile.showVideoAd ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </label>
              </div>

              {profile.showVideoAd && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Responsive Sizing & Layout Controls */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
                    <span className="text-xs font-bold text-slate-200 block border-b border-slate-800/60 pb-2">
                      Ukuran Responsif (Desktop & Mobile) & Tata Letak Layar
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Desktop Width Slider */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                          <span>Ukuran Lebar Desktop / Laptop (px)</span>
                          <span className="text-purple-400 font-mono">
                            {profile.videoAdWidthDesktop || profile.videoAdWidth || 180}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="80"
                          max="400"
                          step="5"
                          value={profile.videoAdWidthDesktop || profile.videoAdWidth || 180}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              videoAdWidthDesktop: parseInt(e.target.value),
                              videoAdWidth: parseInt(e.target.value),
                            })
                          }
                          className="w-full accent-purple-500"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Ukuran video untuk pengunjung yang menggunakan laptop / komputer PC.
                        </p>
                      </div>

                      {/* Mobile Width Slider */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                          <span>Ukuran Lebar Mobile / HP (px)</span>
                          <span className="text-purple-400 font-mono">
                            {profile.videoAdWidthMobile || 120}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="280"
                          step="5"
                          value={profile.videoAdWidthMobile || 120}
                          onChange={(e) =>
                            setProfile({ ...profile, videoAdWidthMobile: parseInt(e.target.value) })
                          }
                          className="w-full accent-purple-500"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">
                          Ukuran video pas untuk layar smartphone agar tidak menghalangi tombol linktree.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Posisi Layar</label>
                        <select
                          value={profile.videoAdPosition || 'bottom-right'}
                          onChange={(e) => setProfile({ ...profile, videoAdPosition: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 outline-none focus:border-purple-500"
                        >
                          <option value="bottom-right">Pojok Kanan Bawah</option>
                          <option value="bottom-left">Pojok Kiri Bawah</option>
                          <option value="top-right">Pojok Kanan Atas</option>
                          <option value="top-left">Pojok Kiri Atas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Offset Horizontal X (px)</label>
                        <input
                          type="number"
                          value={profile.videoAdOffsetX ?? 20}
                          onChange={(e) => setProfile({ ...profile, videoAdOffsetX: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Offset Vertikal Y (px)</label>
                        <input
                          type="number"
                          value={profile.videoAdOffsetY ?? 20}
                          onChange={(e) => setProfile({ ...profile, videoAdOffsetY: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Z-Index Layer</label>
                        <input
                          type="number"
                          value={profile.videoAdZIndex ?? 50}
                          onChange={(e) => setProfile({ ...profile, videoAdZIndex: parseInt(e.target.value) || 50 })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Playlist / Multiple Video Ads List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-purple-800/30 pb-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                          <span>Daftar Playlist Iklan Video (Bisa Ditambah Bebas)</span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-300 text-[10px] font-mono">
                            {(profile.videoAds || []).length} Video
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Setiap iklan akan diputar secara berurutan. Setelah selesai, otomatis lanjut ke video berikutnya & berputar terus.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addVideoAd}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Iklan Video</span>
                      </button>
                    </div>

                    {/* Single Legacy Fallback Card if videoAds is empty */}
                    {(!profile.videoAds || profile.videoAds.length === 0) && (
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-900/40 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-purple-300">Iklan Utama (Mode Tunggal)</span>
                          <button
                            type="button"
                            onClick={() => {
                              // Migrate legacy single video to videoAds list
                              const initialAd: VideoAdItem = {
                                id: `ad-${Date.now()}`,
                                title: "Iklan 1",
                                videoUrl: profile.videoAdUrl || "",
                                targetUrl: profile.videoAdTargetUrl || "",
                                chromaEnable: profile.videoAdChromaEnable ?? true,
                                chromaColor: profile.videoAdChromaColor || "#00FF00",
                                chromaSimilarity: profile.videoAdChromaSimilarity ?? 0.35,
                                chromaSmoothness: profile.videoAdChromaSmoothness ?? 0.1,
                                isEnabled: true,
                                orderIndex: 0,
                              };
                              setProfile({ ...profile, videoAds: [initialAd] });
                            }}
                            className="text-xs text-purple-400 hover:underline font-semibold"
                          >
                            + Konversi Ke Playlist Multi-Iklan
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                              URL Video MP4 / Upload Ke Supabase
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={profile.videoAdUrl || ''}
                                onChange={(e) => setProfile({ ...profile, videoAdUrl: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:border-purple-500 text-xs font-mono text-slate-100"
                                placeholder="https://domain.com/video-iklan.mp4"
                              />
                              <label className="flex items-center justify-center px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors cursor-pointer shrink-0 gap-1">
                                {uploadingVideo ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5" />
                                )}
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="video/mp4,video/webm,video/ogg"
                                  className="hidden"
                                  disabled={uploadingVideo}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleVideoUpload(file);
                                  }}
                                />
                              </label>
                              {profile.videoAdUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteUploadedFile(profile.videoAdUrl);
                                    setProfile({ ...profile, videoAdUrl: "" });
                                  }}
                                  className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                                  title="Hapus Video Ad dari Supabase Storage"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  <span>Hapus</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                              Target Link Klik
                            </label>
                            <input
                              type="text"
                              value={profile.videoAdTargetUrl || ''}
                              onChange={(e) => setProfile({ ...profile, videoAdTargetUrl: e.target.value })}
                              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:border-purple-500 text-xs font-mono text-slate-100"
                              placeholder="https://website-tujuan.com"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Playlist Items */}
                    {(profile.videoAds || []).map((ad, idx) => (
                      <div
                        key={ad.id || idx}
                        className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-purple-800/60 transition-all space-y-4 shadow-md"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                          <div className="flex items-center gap-2 flex-1 mr-4">
                            <span className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 text-xs font-bold flex items-center justify-center border border-purple-500/30">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={ad.title || `Iklan ${idx + 1}`}
                              onChange={(e) => updateVideoAd(idx, 'title', e.target.value)}
                              className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-100 outline-none focus:border-purple-500 max-w-[200px]"
                              placeholder="Judul Iklan"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Enable switch */}
                            <label className="flex items-center gap-1.5 cursor-pointer mr-2">
                              <input
                                type="checkbox"
                                checked={ad.isEnabled ?? true}
                                onChange={(e) => updateVideoAd(idx, 'isEnabled', e.target.checked)}
                                className="w-3.5 h-3.5 accent-purple-500 rounded"
                              />
                              <span className="text-[11px] font-semibold text-slate-300">
                                {ad.isEnabled ? 'Aktif' : 'Mati'}
                              </span>
                            </label>

                            {/* Move Up/Down */}
                            <button
                              type="button"
                              onClick={() => moveVideoAd(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30"
                              title="Naikkan Urutan"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveVideoAd(idx, 'down')}
                              disabled={idx === (profile.videoAds || []).length - 1}
                              className="p-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30"
                              title="Turunkan Urutan"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => removeVideoAd(idx)}
                              className="p-1.5 rounded-lg bg-red-950/40 text-red-400 border border-red-900/60 hover:bg-red-900/60 transition-colors ml-1"
                              title="Hapus Iklan Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Video URL & Target Link */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              URL Video MP4 / Supabase Upload
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={ad.videoUrl || ''}
                                onChange={(e) => updateVideoAd(idx, 'videoUrl', e.target.value)}
                                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 outline-none focus:border-purple-500"
                                placeholder="https://domain.com/video.mp4"
                              />
                              <label className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors cursor-pointer shrink-0 gap-1">
                                {uploadingField === `videoAd-${idx}` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5" />
                                )}
                                <span>Upload MP4</span>
                                <input
                                  type="file"
                                  accept="video/mp4,video/webm,video/ogg"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleVideoAdUploadItem(file, idx);
                                  }}
                                />
                              </label>
                              {ad.videoUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteUploadedFile(ad.videoUrl);
                                    updateVideoAd(idx, 'videoUrl', '');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                                  title="Hapus Video dari Bucket Supabase"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  <span>Hapus</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                              Target Link Klik (Opsional)
                            </label>
                            <input
                              type="text"
                              value={ad.targetUrl || ''}
                              onChange={(e) => updateVideoAd(idx, 'targetUrl', e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 outline-none focus:border-purple-500"
                              placeholder="https://link-tujuan.com"
                            />
                          </div>
                        </div>

                        {/* Chroma Key Settings for this Video */}
                        <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-4 text-xs">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ad.chromaEnable ?? true}
                              onChange={(e) => updateVideoAd(idx, 'chromaEnable', e.target.checked)}
                              className="w-3.5 h-3.5 accent-purple-500 rounded"
                            />
                            <span className="text-slate-300 font-semibold">Chroma Key</span>
                          </label>

                          {ad.chromaEnable && (
                            <>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-400">Warna:</span>
                                <input
                                  type="color"
                                  value={ad.chromaColor || '#00FF00'}
                                  onChange={(e) => updateVideoAd(idx, 'chromaColor', e.target.value)}
                                  className="w-6 h-6 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                                />
                              </div>

                              <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                                <span className="text-[11px] text-slate-400">Toleransi:</span>
                                <input
                                  type="range"
                                  min="0.05"
                                  max="0.8"
                                  step="0.01"
                                  value={ad.chromaSimilarity ?? 0.35}
                                  onChange={(e) => updateVideoAd(idx, 'chromaSimilarity', parseFloat(e.target.value))}
                                  className="w-full accent-purple-500"
                                />
                                <span className="text-[10px] font-mono text-purple-400 w-8">
                                  {Math.round((ad.chromaSimilarity ?? 0.35) * 100)}%
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Preview Rotasi Iklan */}
                  {((profile.videoAds && profile.videoAds.length > 0) || profile.videoAdUrl) && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/20 space-y-2">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Live Rotasi Playlist Iklan:</span>
                      </span>
                      <div className="flex items-center justify-center p-4 bg-slate-900/80 rounded-lg border border-slate-800 min-h-[140px] overflow-hidden">
                        <ChromaVideoAd
                          ads={profile.videoAds}
                          videoUrl={profile.videoAdUrl}
                          chromaEnable={profile.videoAdChromaEnable}
                          chromaColor={profile.videoAdChromaColor}
                          chromaSimilarity={profile.videoAdChromaSimilarity}
                          chromaSmoothness={profile.videoAdChromaSmoothness}
                          widthDesktop={profile.videoAdWidthDesktop || profile.videoAdWidth || 180}
                          widthMobile={profile.videoAdWidthMobile || 120}
                          previewMode={true}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                    {profile.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteUploadedFile(profile.avatarUrl);
                          setProfile({ ...profile, avatarUrl: "" });
                        }}
                        className="px-3 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Hapus Avatar dari Supabase Storage"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bio / Deskripsi Singkat</label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100 resize-none font-mono"
                    placeholder="Tuliskan bio atau informasi singkat..."
                  />

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-[10px] text-slate-400">
                      Gunakan format <code className="text-cyan-400 font-mono">[Teks](URL|#warna|bold|underline)</code>
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowBioLinkModal(!showBioLinkModal)}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/50 flex items-center gap-1 cursor-pointer transition-all shadow-sm shrink-0"
                    >
                      <LinkIcon className="w-3 h-3 text-cyan-400" />
                      <span>+ Sisipkan Link Bio</span>
                    </button>
                  </div>

                  {showBioLinkModal && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Generator Link Teks Bio Kustom</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowBioLinkModal(false)}
                          className="text-[10px] text-slate-500 hover:text-slate-300"
                        >
                          Tutup
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] text-slate-300 font-semibold mb-1">Teks Link (misal: Aoi)</label>
                          <input
                            type="text"
                            value={bioLinkText}
                            onChange={(e) => setBioLinkText(e.target.value)}
                            placeholder="Aoi"
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-slate-100 focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-300 font-semibold mb-1">URL Target (misal TikTok)</label>
                          <input
                            type="text"
                            value={bioLinkUrl}
                            onChange={(e) => setBioLinkUrl(e.target.value)}
                            placeholder="https://tiktok.com/@onlyvirtus"
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-slate-100 focus:border-cyan-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center pt-2 border-t border-slate-800/60">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Warna Teks Link</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bioLinkColor.startsWith("#") ? bioLinkColor : "#38bdf8"}
                              onChange={(e) => setBioLinkColor(e.target.value)}
                              className="h-8 w-8 rounded bg-slate-900 border border-slate-800 cursor-pointer shrink-0"
                            />
                            <input
                              type="text"
                              value={bioLinkColor}
                              onChange={(e) => setBioLinkColor(e.target.value)}
                              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-200 outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-2 sm:pt-0">
                          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bioLinkBold}
                              onChange={(e) => setBioLinkBold(e.target.checked)}
                              className="rounded border-slate-700 text-cyan-500"
                            />
                            <span className="font-bold">Tebal</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bioLinkUnderline}
                              onChange={(e) => setBioLinkUnderline(e.target.checked)}
                              className="rounded border-slate-700 text-cyan-500"
                            />
                            <span className="underline">Garis Bawah</span>
                          </label>
                        </div>

                        <div className="flex justify-end pt-2 sm:pt-0">
                          <button
                            type="button"
                            onClick={insertBioLink}
                            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                          >
                            + Sisipkan Ke Bio
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Judul Header Sosial Media (Default Sub-Judul)</label>
                <input
                  type="text"
                  value={profile.socialHeaderTitle}
                  onChange={(e) => setProfile({ ...profile, socialHeaderTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-violet-500 text-sm outline-none text-slate-100"
                  placeholder="Contoh: Social Media Handles"
                />
              </div>

              {/* Sub-Judul / Kategori Styling (Warna Background & Font) */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">
                    Kostumisasi Warna Sub-Judul / Kategori (Default)
                  </label>
                  {/* Live Preview Badge */}
                  <span
                    style={{
                      ...(profile.categoryBgColor ? { backgroundColor: profile.categoryBgColor } : {}),
                      ...(profile.categoryTextColor ? { color: profile.categoryTextColor } : {}),
                    }}
                    className={`text-[10px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full ${
                      !profile.categoryBgColor ? "bg-white/10" : ""
                    } ${!profile.categoryTextColor ? "text-blue-100" : ""} border border-white/15 shadow-sm inline-block`}
                  >
                    {profile.socialHeaderTitle || "PREVIEW KATEGORI"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Warna Background Sub-Judul
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={profile.categoryBgColor?.startsWith("#") ? profile.categoryBgColor : "#1e293b"}
                        onChange={(e) => setProfile({ ...profile, categoryBgColor: e.target.value })}
                        className="h-9 w-10 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={profile.categoryBgColor || ""}
                        onChange={(e) => setProfile({ ...profile, categoryBgColor: e.target.value })}
                        placeholder="Default (Transparan) / #1e293b"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none focus:border-violet-500"
                      />
                      {profile.categoryBgColor && (
                        <button
                          type="button"
                          onClick={() => setProfile({ ...profile, categoryBgColor: "" })}
                          className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg shrink-0"
                          title="Reset ke Default"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Warna Font / Teks Sub-Judul
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={profile.categoryTextColor?.startsWith("#") ? profile.categoryTextColor : "#93c5fd"}
                        onChange={(e) => setProfile({ ...profile, categoryTextColor: e.target.value })}
                        className="h-9 w-10 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={profile.categoryTextColor || ""}
                        onChange={(e) => setProfile({ ...profile, categoryTextColor: e.target.value })}
                        placeholder="Default / #ffffff / #93c5fd"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none focus:border-violet-500"
                      />
                      {profile.categoryTextColor && (
                        <button
                          type="button"
                          onClick={() => setProfile({ ...profile, categoryTextColor: "" })}
                          className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg shrink-0"
                          title="Reset ke Default"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preset Sub-Judul Color Combinations */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">Preset Warna:</span>
                  {[
                    { label: "Dark Slate", bg: "#1e293b", text: "#94a3b8" },
                    { label: "Midnight Blue", bg: "#0f172a", text: "#38bdf8" },
                    { label: "Violet Dark", bg: "#2e1065", text: "#c084fc" },
                    { label: "Emerald Dark", bg: "#022c22", text: "#34d399" },
                    { label: "Amber Dark", bg: "#451a03", text: "#fbbf24" },
                    { label: "Ruby Red", bg: "#4c0519", text: "#fb7185" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          categoryBgColor: preset.bg,
                          categoryTextColor: preset.text,
                        })
                      }
                      style={{ backgroundColor: preset.bg, color: preset.text }}
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/10 hover:scale-105 transition-all cursor-pointer shadow-sm"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 1.1: Deretan Icon Social Media (Bawah Judul Virtus Official) */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-blue-950/40 border border-blue-800/40 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span>Icon Social Media Header (Bawah Judul Virtus Official)</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                        Linktree Icon Bar
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tampilkan deretan logo/icon sosial media tepat di bawah judul/bio Virtus Official dengan pilihan kustomisasi ukuran, jarak, warna, background, dan bentuk.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={profile.showSocialHeaderIcons ?? true}
                    onChange={(e) => setProfile({ ...profile, showSocialHeaderIcons: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-2 text-xs font-semibold text-slate-300">
                    {(profile.showSocialHeaderIcons ?? true) ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </label>
              </div>

              {(profile.showSocialHeaderIcons ?? true) && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* 1. Posisi Penempatan Icon Bar */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-2">Posisi Penempatan Icon Bar</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "under_bio", label: "📌 Bawah Judul & Bio (Default)", desc: "Tepat di bawah Virtus Official" },
                        { id: "above_links", label: "📋 Di Atas Links List", desc: "Di atas daftar link utama" },
                        { id: "disabled", label: "🚫 Sembunyikan Bar", desc: "Nonaktifkan icon bar header" },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setProfile({ ...profile, socialIconPosition: pos.id })}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            (profile.socialIconPosition || "under_bio") === pos.id
                              ? "bg-blue-900/40 border-blue-500 text-white font-bold shadow-md ring-1 ring-blue-500/50"
                              : "bg-slate-950/70 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                          }`}
                        >
                          <div className="text-xs font-semibold">{pos.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{pos.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Ukuran Icon & Jarak Spacing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Ukuran Icon (Icon Size)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "sm", label: "Kecil (S)" },
                          { id: "md", label: "Sedang (M)" },
                          { id: "lg", label: "Besar (L)" },
                          { id: "xl", label: "Extra (XL)" },
                        ].map((sz) => (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => setProfile({ ...profile, socialIconSize: sz.id })}
                            className={`py-2 px-1 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer ${
                              (profile.socialIconSize || "md") === sz.id
                                ? "bg-violet-600 text-white border-violet-400 font-bold"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                            }`}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Jarak Spacing (Gap)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "sm", label: "Rapat" },
                          { id: "md", label: "Sedang" },
                          { id: "lg", label: "Renggang" },
                          { id: "xl", label: "Jauh" },
                        ].map((gp) => (
                          <button
                            key={gp.id}
                            type="button"
                            onClick={() => setProfile({ ...profile, socialIconGap: gp.id })}
                            className={`py-2 px-1 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer ${
                              (profile.socialIconGap || "md") === gp.id
                                ? "bg-violet-600 text-white border-violet-400 font-bold"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                            }`}
                          >
                            {gp.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Bentuk Icon & Background Style */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Bentuk Sudut Icon (Shape)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "circle", label: "Circle", radius: "rounded-full" },
                          { id: "rounded", label: "Rounded", radius: "rounded-xl" },
                          { id: "square", label: "Square", radius: "rounded-md" },
                          { id: "pill", label: "Pill", radius: "rounded-2xl" },
                        ].map((shp) => (
                          <button
                            key={shp.id}
                            type="button"
                            onClick={() => setProfile({ ...profile, socialIconShape: shp.id })}
                            className={`py-2 px-1 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                              (profile.socialIconShape || "circle") === shp.id
                                ? "bg-blue-600 text-white border-blue-400 font-bold"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                            }`}
                          >
                            <div className={`w-4 h-4 border border-current ${shp.radius}`} />
                            <span>{shp.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">Tipe Background Icon</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "glass", label: "Glass" },
                          { id: "transparent", label: "Polos" },
                          { id: "solid", label: "Solid" },
                          { id: "custom", label: "Custom" },
                        ].map((bg) => (
                          <button
                            key={bg.id}
                            type="button"
                            onClick={() => setProfile({ ...profile, socialIconBg: bg.id })}
                            className={`py-2 px-1 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer ${
                              (profile.socialIconBg || "glass") === bg.id
                                ? "bg-blue-600 text-white border-blue-400 font-bold"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                            }`}
                          >
                            {bg.label}
                          </button>
                        ))}
                      </div>

                      {profile.socialIconBg === "custom" && (
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="color"
                            value={profile.socialIconCustomBg?.startsWith("#") ? profile.socialIconCustomBg : "#1e1b4b"}
                            onChange={(e) => setProfile({ ...profile, socialIconCustomBg: e.target.value })}
                            className="h-9 w-10 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={profile.socialIconCustomBg || ""}
                            onChange={(e) => setProfile({ ...profile, socialIconCustomBg: e.target.value })}
                            placeholder="#1e1b4b (Warna Hex Custom)"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Warna Icon & Brand Colors Toggle */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                    <label className="block text-xs font-semibold text-slate-300">Warna Icon / Logo</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Custom Warna Hex Icon</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={profile.socialIconColor?.startsWith("#") ? profile.socialIconColor : "#ffffff"}
                            onChange={(e) => setProfile({ ...profile, socialIconColor: e.target.value })}
                            className="h-9 w-10 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={profile.socialIconColor || ""}
                            onChange={(e) => setProfile({ ...profile, socialIconColor: e.target.value })}
                            placeholder="Default / #ffffff / #38bdf8"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none focus:border-blue-500"
                          />
                          {profile.socialIconColor && (
                            <button
                              type="button"
                              onClick={() => setProfile({ ...profile, socialIconColor: "" })}
                              className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg shrink-0"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div>
                          <div className="text-xs font-semibold text-slate-200">Gunakan Warna Brand Original</div>
                          <div className="text-[10px] text-slate-400">TikTok, YouTube, WA, Instagram, dll.</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={profile.socialIconUseBrandColor ?? false}
                            onChange={(e) => setProfile({ ...profile, socialIconUseBrandColor: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 5. Daftar Link yang Muncul di Header Icon Bar */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-200">
                        Pilih Link yang Tampil di Header Icon Bar ({profile.links.filter(l => l.showInHeaderIcons !== false && l.isEnabled).length} terpilih)
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Centang link yang ingin Anda munculkan sebagai icon di bawah nama/bio Virtus Official:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {profile.links.map((link, idx) => (
                        <label
                          key={link.id || idx}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            link.showInHeaderIcons !== false && link.isEnabled
                              ? "bg-slate-900 border-blue-500/50 text-white"
                              : "bg-slate-950/50 border-slate-800 text-slate-500"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-semibold truncate">{link.title || "Link " + (idx + 1)}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-mono">({link.icon})</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={link.showInHeaderIcons !== false}
                            onChange={(e) => {
                              const updatedLinks = [...profile.links];
                              updatedLinks[idx] = { ...updatedLinks[idx], showInHeaderIcons: e.target.checked };
                              setProfile({ ...profile, links: updatedLinks });
                            }}
                            className="rounded border-slate-700 text-blue-500 focus:ring-blue-500 h-4 w-4 shrink-0"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 1.2: Pengaturan Leaderboard (Top Supporters) */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5">
              <h2 className="text-base font-bold text-slate-100 flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Pengaturan Leaderboard (Top Supporters)</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={profile.showLeaderboard ?? true}
                    onChange={(e) => setProfile({ ...profile, showLeaderboard: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <span>Tampilkan di Halaman Utama</span>
                </label>
              </h2>

              {/* URL Leaderboard Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL Sociabuzz Leaderboard (Bila Expired / Ganti URL)
                </label>
                <input
                  type="text"
                  value={profile.leaderboardUrl || "https://sociabuzz.com/pro/tribe/topleaderboard/v2/8913094574"}
                  onChange={(e) => setProfile({ ...profile, leaderboardUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 text-xs font-mono outline-none text-slate-100"
                  placeholder="https://sociabuzz.com/pro/tribe/topleaderboard/v2/8913094574"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tempel URL lengkap dari Sociabuzz jika sewaktu-waktu tautan/ID leaderboard diperbarui. System akan otomatis mengekstrak ID aktif.
                </p>
              </div>

              {/* Header Text & ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Isi Teks Header Leaderboard
                  </label>
                  <input
                    type="text"
                    value={profile.leaderboardTitle || "TOP SUPPORTERS BULAN INI"}
                    onChange={(e) => setProfile({ ...profile, leaderboardTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 text-sm outline-none text-slate-100 font-bold"
                    placeholder="Contoh: TOP SUPPORTERS BULAN INI"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Sociabuzz Tribe ID (Opsional)
                  </label>
                  <input
                    type="text"
                    value={profile.sociabuzzTribeId || "8913094574"}
                    onChange={(e) => setProfile({ ...profile, sociabuzzTribeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:border-amber-500 text-sm font-mono outline-none text-slate-100"
                    placeholder="8913094574"
                  />
                </div>
              </div>

              {/* Icon / Simbol Header */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Ikon / Simbol Header Leaderboard
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "trophy", label: "🏆 Trophy" },
                    { id: "crown", label: "👑 Crown" },
                    { id: "flame", label: "🔥 Flame" },
                    { id: "star", label: "⭐️ Star" },
                    { id: "sparkles", label: "✨ Sparkles" },
                    { id: "diamond", label: "💎 Diamond" },
                    { id: "gamepad", label: "🎮 Gamepad" },
                    { id: "none", label: "🚫 Tanpa Ikon" },
                  ].map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, leaderboardHeaderIcon: ic.id })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        (profile.leaderboardHeaderIcon || "trophy") === ic.id
                          ? "bg-amber-950/60 border-amber-500 text-amber-300 shadow-md"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {ic.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warna, Font, & Ukuran Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Warna Header */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Warna Teks Header
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={profile.leaderboardHeaderColor?.startsWith("#") ? profile.leaderboardHeaderColor : "#34d399"}
                      onChange={(e) => setProfile({ ...profile, leaderboardHeaderColor: e.target.value })}
                      className="h-9 w-10 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={profile.leaderboardHeaderColor || ""}
                      onChange={(e) => setProfile({ ...profile, leaderboardHeaderColor: e.target.value })}
                      placeholder="Default Gradient / #34d399"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none focus:border-amber-500"
                    />
                    {profile.leaderboardHeaderColor && (
                      <button
                        type="button"
                        onClick={() => setProfile({ ...profile, leaderboardHeaderColor: "" })}
                        className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg shrink-0"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Jenis Font Header */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Jenis Font Header
                  </label>
                  <select
                    value={profile.leaderboardHeaderFont || "sans"}
                    onChange={(e) => setProfile({ ...profile, leaderboardHeaderFont: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-amber-500"
                  >
                    <option value="sans">Font Sans (Modern Clean)</option>
                    <option value="mono">Font Mono (Gaming Code)</option>
                    <option value="serif">Font Serif (Classic Elegant)</option>
                  </select>
                </div>

                {/* Ukuran Font Header */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Ukuran Font Header
                  </label>
                  <select
                    value={profile.leaderboardHeaderSize || "2xl"}
                    onChange={(e) => setProfile({ ...profile, leaderboardHeaderSize: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 outline-none focus:border-amber-500"
                  >
                    <option value="lg">Ukuran Sedang (text-lg)</option>
                    <option value="xl">Ukuran Besar (text-xl)</option>
                    <option value="2xl">Ukuran Sangat Besar (text-2xl)</option>
                    <option value="3xl">Ukuran Super Besar (text-3xl)</option>
                  </select>
                </div>
              </div>

              {/* Mode Tampilan Halaman Utama */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Mode Tampilan di Halaman Utama
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, leaderboardMode: "top3" })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      (profile.leaderboardMode || "top3") === "top3"
                        ? "bg-amber-950/30 border-amber-500 text-amber-200 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        🏆 Hanya Top 3 (Podium Juara)
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Menampilkan podium Juara 1, 2, dan 3 secara ringkas dan estetik.
                      </p>
                    </div>
                    {(profile.leaderboardMode || "top3") === "top3" && (
                      <Check className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, leaderboardMode: "top10" })}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      profile.leaderboardMode === "top10"
                        ? "bg-emerald-950/30 border-emerald-500 text-emerald-200 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        📜 Top 10 Lengkap
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Menampilkan podium Top 3 beserta daftar peringkat 4 hingga 10.
                      </p>
                    </div>
                    {profile.leaderboardMode === "top10" && (
                      <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* Live Preview Box Header */}
              <div className="pt-3 border-t border-slate-800/80">
                <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  👁️ Live Preview Header Leaderboard
                </label>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <h2
                    style={profile.leaderboardHeaderColor ? { color: profile.leaderboardHeaderColor } : {}}
                    className={`font-black tracking-wider ${
                      profile.leaderboardHeaderFont === "mono"
                        ? "font-mono"
                        : profile.leaderboardHeaderFont === "serif"
                        ? "font-serif"
                        : "font-sans"
                    } ${
                      profile.leaderboardHeaderSize === "lg"
                        ? "text-lg"
                        : profile.leaderboardHeaderSize === "xl"
                        ? "text-xl"
                        : profile.leaderboardHeaderSize === "3xl"
                        ? "text-3xl"
                        : "text-2xl"
                    } ${
                      !profile.leaderboardHeaderColor
                        ? "bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent"
                        : ""
                    } inline-flex items-center justify-center gap-2`}
                  >
                    <span>
                      {profile.leaderboardHeaderIcon === "crown"
                        ? "👑"
                        : profile.leaderboardHeaderIcon === "flame"
                        ? "🔥"
                        : profile.leaderboardHeaderIcon === "star"
                        ? "⭐️"
                        : profile.leaderboardHeaderIcon === "sparkles"
                        ? "✨"
                        : profile.leaderboardHeaderIcon === "diamond"
                        ? "💎"
                        : profile.leaderboardHeaderIcon === "gamepad"
                        ? "🎮"
                        : profile.leaderboardHeaderIcon === "none"
                        ? ""
                        : "🏆"}
                    </span>
                    <span>{profile.leaderboardTitle || "TOP SUPPORTERS BULAN INI"}</span>
                  </h2>
                </div>
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

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Sub-Judul / Kategori <span className="text-slate-500 font-normal">(opsional)</span>
                        </label>
                        <input
                          type="text"
                          value={link.sectionTitle || ""}
                          onChange={(e) => updateLink(idx, "sectionTitle", e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-violet-500 placeholder-slate-600 font-medium"
                          placeholder="Misal: Top Up, Social Media, dll"
                        />
                      </div>

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
                          onChange={(e) => {
                            const newIcon = e.target.value;
                            updateLink(idx, "icon", newIcon);
                            if (newIcon === "custom" && !link.iconWidth) {
                              updateLink(idx, "iconWidth", link.layout === "column" ? 80 : 48);
                            }
                          }}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs outline-none text-slate-200 focus:border-violet-500 font-medium"
                        >
                          {AVAILABLE_ICONS.map((ic) => (
                            <option key={ic.id} value={ic.id}>
                              {ic.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Custom Icon Upload & URL (Jika pilih icon kustom atau ada customIconUrl) */}
                    {(link.icon === "custom" || Boolean(link.customIconUrl)) && (
                      <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                            <span>Kustomisasi Ikon / Gambar Sendiri</span>
                          </label>
                          <span className="text-[10px] text-violet-400 font-mono">PNG / SVG / JPG / WebP</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                          <div className="sm:col-span-2 space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={link.customIconUrl || ""}
                                onChange={(e) => {
                                  updateLink(idx, "customIconUrl", e.target.value);
                                  if (e.target.value) updateLink(idx, "icon", "custom");
                                }}
                                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 outline-none focus:border-violet-500 placeholder-slate-600 font-mono"
                                placeholder="Masukkan URL gambar icon (https://...)"
                              />
                              <label
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-sm ${
                                  uploadingField === `link-icon-${idx}`
                                    ? "bg-violet-800 text-violet-200 cursor-not-allowed"
                                    : "bg-violet-600 hover:bg-violet-500 text-white"
                                }`}
                              >
                                {uploadingField === `link-icon-${idx}` ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Upload...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Upload Icon</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingField === `link-icon-${idx}`}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleLinkIconUpload(file, idx);
                                  }}
                                />
                              </label>
                              {link.customIconUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteUploadedFile(link.customIconUrl);
                                    updateLink(idx, "customIconUrl", "");
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 font-bold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                                  title="Hapus Icon dari Bucket Supabase"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  <span>Hapus</span>
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Unggah icon kustom atau paste URL gambar. Icon ini akan menggantikan icon standar.
                            </p>
                          </div>

                          {/* Mini Preview of the Custom Icon */}
                          <div className="flex items-center justify-center p-2 rounded-lg bg-slate-950 border border-slate-800 h-16">
                            {link.customIconUrl ? (
                              <img
                                src={link.customIconUrl}
                                alt="Preview Icon"
                                className="max-h-full max-w-full object-contain drop-shadow"
                              />
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">Belum ada icon kustom</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section Kontrol: Tata Letak & Perataan (Layout, Item Align, Text Align) */}
                    <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-3">
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        <Layout className="w-4 h-4 text-cyan-400" />
                        <span>Tata Letak & Perataan (Layout & Alignment)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. Tata Letak (Row vs Column) */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            Tata Letak (Layout)
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
                            <button
                              type="button"
                              onClick={() => updateLink(idx, "layout", "row")}
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-all ${
                                link.layout !== "column"
                                  ? "bg-cyan-600 text-white font-bold shadow-sm"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <Rows3 className="w-3.5 h-3.5" />
                              <span>Baris</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateLink(idx, "layout", "column");
                                if (!link.iconWidth) updateLink(idx, "iconWidth", 80);
                              }}
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-all ${
                                link.layout === "column"
                                  ? "bg-cyan-600 text-white font-bold shadow-sm"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                              title="Icon di atas, Nama link di bawah (rata tengah)"
                            >
                              <Columns3 className="w-3.5 h-3.5" />
                              <span>Kolom (Atas)</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {link.layout === "column"
                              ? "Icon di atas & nama di bawah (rata tengah)"
                              : "Icon di kiri & teks di kanan"}
                          </p>
                        </div>

                        {/* 2. Perataan Item (Item Align) */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            Perataan Konten (Item Align)
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
                            <button
                              type="button"
                              disabled={link.layout === "column"}
                              onClick={() => updateLink(idx, "itemAlign", "left")}
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-all ${
                                link.layout === "column"
                                  ? "opacity-30 cursor-not-allowed text-slate-500"
                                  : link.itemAlign !== "center"
                                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <AlignLeft className="w-3.5 h-3.5" />
                              <span>Kiri</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateLink(idx, "itemAlign", "center")}
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-all ${
                                link.layout === "column" || link.itemAlign === "center"
                                  ? "bg-indigo-600 text-white font-bold shadow-sm"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <AlignCenter className="w-3.5 h-3.5" />
                              <span>Tengah</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {link.layout === "column"
                              ? "Otomatis rata tengah di mode kolom"
                              : "Posisi elemen dalam tombol"}
                          </p>
                        </div>

                        {/* 3. Perataan Teks (Text Align) */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            Perataan Teks (Text Align)
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
                            <button
                              type="button"
                              onClick={() => updateLink(idx, "textAlign", "left")}
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-all ${
                                link.textAlign !== "center" && link.layout !== "column"
                                  ? "bg-emerald-600 text-white font-bold shadow-sm"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <AlignLeft className="w-3.5 h-3.5" />
                              <span>Rata Kiri</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateLink(idx, "textAlign", "center")}
                              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-all ${
                                link.textAlign === "center" || link.layout === "column"
                                  ? "bg-emerald-600 text-white font-bold shadow-sm"
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <AlignCenter className="w-3.5 h-3.5" />
                              <span>Rata Tengah</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            Format perataan nama link
                          </p>
                        </div>
                      </div>

                      {/* Slider Pengatur Lebar Horizontal Ikon (Tinggi Vertikal Fixed 56px) */}
                      <div className="pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Panjang Horizontal Ikon (Lebar)</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                              {link.iconWidth ?? (link.layout === "column" ? (link.customIconUrl ? 80 : 48) : 48)}px
                            </span>
                            <span className="text-[10px] text-slate-500">(Batas: 32px s/d 280px)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={32}
                            max={280}
                            step={2}
                            value={link.iconWidth ?? (link.layout === "column" ? (link.customIconUrl ? 80 : 48) : 48)}
                            onChange={(e) => updateLink(idx, "iconWidth", parseInt(e.target.value))}
                            className="flex-1 accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                          />
                          <input
                            type="number"
                            min={32}
                            max={280}
                            value={link.iconWidth ?? (link.layout === "column" ? (link.customIconUrl ? 80 : 48) : 48)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) {
                                updateLink(idx, "iconWidth", Math.max(24, Math.min(val, 280)));
                              }
                            }}
                            className="w-16 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-center text-amber-300 outline-none focus:border-amber-500"
                          />
                        </div>

                        <p className="text-[10px] text-slate-400">
                          ✨ <strong>Tinggi vertikal otomatis dikunci 56px</strong> agar bentuk kartu tetap proporsional dan rapi. Lebar horizontal dapat disesuaikan untuk icon logo memanjang/lebar dengan batas maksimal 280px.
                        </p>
                      </div>

                      {/* Mini Live Preview of this button */}
                      <div className="pt-2 border-t border-slate-800/60">
                        <span className="text-[10px] font-semibold text-slate-400 block mb-1.5">
                          Pratinjau Tombol Link ({link.layout === "column" ? "Mode Kolom / Kartu" : "Mode Baris"}):
                        </span>
                        <div
                          className={`w-full p-3 rounded-2xl bg-slate-900 border border-slate-700/60 shadow-md flex ${
                            link.layout === "column"
                              ? "flex-col items-center justify-center text-center gap-2"
                              : link.itemAlign === "center"
                              ? "items-center justify-center gap-3"
                              : "items-center justify-between"
                          }`}
                        >
                          <div
                            className={`flex items-center gap-3 ${
                              link.layout === "column"
                                ? "flex-col"
                                : link.textAlign === "center"
                                ? "justify-center text-center"
                                : "text-left"
                            }`}
                          >
                            {/* Icon Preview */}
                            <div
                              style={{
                                width: `${Math.max(
                                  24,
                                  Math.min(
                                    link.iconWidth ?? (link.layout === "column" ? (link.customIconUrl ? 80 : 48) : 40),
                                    280
                                  )
                                )}px`,
                                height: link.layout === "column" ? "56px" : "36px",
                              }}
                              className="flex items-center justify-center overflow-hidden rounded bg-slate-950 border border-slate-800 shrink-0 p-1"
                            >
                              {link.customIconUrl ? (
                                <img
                                  src={link.customIconUrl}
                                  alt=""
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Globe className="w-5 h-5 text-cyan-400" />
                              )}
                            </div>

                            <span
                              className={`text-xs font-bold text-slate-100 ${
                                link.textAlign === "center" || link.layout === "column"
                                  ? "text-center"
                                  : "text-left"
                              }`}
                            >
                              {link.title || "Judul Tombol"}
                            </span>
                          </div>

                          {link.layout !== "column" && link.itemAlign !== "center" && (
                            <span className="text-slate-600 text-xs">•••</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Optional Custom Colors for this Sub-Judul */}
                    {link.sectionTitle && (
                      <div className="pt-2 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/30 p-2.5 rounded-lg">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">
                            Override Warna BG Sub-Judul "{link.sectionTitle}" <span className="text-slate-500">(opsional)</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={link.sectionBgColor?.startsWith("#") ? link.sectionBgColor : "#1e293b"}
                              onChange={(e) => updateLink(idx, "sectionBgColor", e.target.value)}
                              className="h-7 w-8 rounded bg-slate-950 border border-slate-800 cursor-pointer shrink-0"
                            />
                            <input
                              type="text"
                              value={link.sectionBgColor || ""}
                              onChange={(e) => updateLink(idx, "sectionBgColor", e.target.value)}
                              placeholder="Default tema / #1e293b"
                              className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-slate-200 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">
                            Override Warna Font Sub-Judul "{link.sectionTitle}" <span className="text-slate-500">(opsional)</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="color"
                              value={link.sectionTextColor?.startsWith("#") ? link.sectionTextColor : "#93c5fd"}
                              onChange={(e) => updateLink(idx, "sectionTextColor", e.target.value)}
                              className="h-7 w-8 rounded bg-slate-950 border border-slate-800 cursor-pointer shrink-0"
                            />
                            <input
                              type="text"
                              value={link.sectionTextColor || ""}
                              onChange={(e) => updateLink(idx, "sectionTextColor", e.target.value)}
                              placeholder="Default tema / #ffffff"
                              className="w-full px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-slate-200 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WhatsApp Custom Default Message Box */}
                    {(link.icon?.toLowerCase().includes("whatsapp") ||
                      link.icon?.toLowerCase() === "wa" ||
                      link.url?.includes("wa.me") ||
                      link.url?.includes("whatsapp.com")) && (
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Pesan Otomatis WhatsApp (Default Message Chat)</span>
                          </label>
                          <span className="text-[10px] text-emerald-500 font-medium">Auto Pre-filled Text</span>
                        </div>
                        <textarea
                          rows={2}
                          value={link.waCustomMessage || ""}
                          onChange={(e) => updateLink(idx, "waCustomMessage", e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-emerald-900/50 rounded-lg text-xs text-slate-100 outline-none focus:border-emerald-500 resize-none placeholder-slate-600"
                          placeholder="Contoh: Halo Admin Astra Points, saya mau tanya order Top Up / Mabar VIP..."
                        />
                        <p className="text-[10px] text-slate-400">
                          Pesan ini akan langsung otomatis terisi di kolom chat WhatsApp pengunjung saat mereka mengeklik tombol ini.
                        </p>
                      </div>
                    )}
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
                          {banner.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                deleteUploadedFile(banner.imageUrl);
                                updateBanner(idx, "imageUrl", "");
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/80 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                              title="Hapus Gambar Banner dari Bucket Supabase"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              <span>Hapus</span>
                            </button>
                          )}
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
                  <h3 className="font-bold text-slate-100">{profile.name || "Virtus Official"}</h3>
                  <p className="text-xs text-slate-400 px-2 whitespace-pre-line">{profile.bio}</p>

                  {/* Mini Preview Social Icons Bar */}
                  {(profile.showSocialHeaderIcons ?? true) && profile.socialIconPosition !== "disabled" && (
                    <div className="flex items-center justify-center flex-wrap gap-2 pt-2 px-2">
                      {profile.links
                        .filter((l) => l.isEnabled && l.showInHeaderIcons !== false)
                        .map((l) => (
                          <span
                            key={l.id}
                            title={l.title}
                            className={`w-7 h-7 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center text-[10px] shadow-sm hover:scale-110 transition-all ${
                              profile.socialIconShape === "square" ? "rounded-md" : profile.socialIconShape === "rounded" ? "rounded-lg" : "rounded-full"
                            }`}
                          >
                            <span className="capitalize font-bold text-[9px] truncate max-w-[20px]">{l.icon.substring(0, 2)}</span>
                          </span>
                        ))}
                    </div>
                  )}
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
