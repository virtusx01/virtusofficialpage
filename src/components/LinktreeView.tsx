'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Globe,
  MessageCircle,
  Gamepad2,
  ExternalLink,
  Share2,
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  Send,
  Video,
  Music,
  Check,
  Copy,
  CreditCard,
  ShoppingBag,
  Coins,
  Store,
} from 'lucide-react';

export interface LinktreeItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  category: string;
  sectionTitle?: string;
  isEnabled: boolean;
  orderIndex: number;
}

export interface LinktreeBannerItem {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  targetUrl: string;
  imageUrl: string;
  isEnabled: boolean;
  orderIndex: number;
}

export interface LinktreeTopButtonItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  isShareAction: boolean;
  isEnabled: boolean;
  orderIndex: number;
}

export interface LinktreeCodeItem {
  id: string;
  title: string;
  code: string;
  isEnabled: boolean;
  orderIndex: number;
}

export interface LinktreeProfileData {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
  avatarBorderColor?: string;
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
  links: LinktreeItem[];
  banners?: LinktreeBannerItem[];
  topButtons?: LinktreeTopButtonItem[];
  codes?: LinktreeCodeItem[];
}

const getIconComponent = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'facebook':
      return (
        <svg className="w-5 h-5 fill-blue-500" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-5 h-5 fill-blue-600" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className="w-5 h-5 fill-red-500" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'twitter':
    case 'x':
      return (
        <svg className="w-5 h-5 fill-sky-400" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'github':
      return (
        <svg className="w-5 h-5 fill-slate-800 dark:fill-white" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case 'whatsapp':
    case 'wa':
      return (
        <svg className="w-5 h-5 fill-emerald-500" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      );
    case 'whatsapp-dark':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#0F172A" stroke="#25D366" strokeWidth="1.5" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2z" />
          <path fill="#25D366" d="M16.8 15.5c-.2.6-1.2 1.1-1.6 1.2-.4.1-1 .1-1.5-.1-.4-.1-.8-.3-1.4-.5-2.5-1.1-4.1-3.6-4.2-3.7-.1-.2-1-1.3-1-2.5 0-1.2.6-1.8.9-2 .2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.8.1.1.1.3 0 .4-.1.2-.1.3-.2.4-.1.1-.3.3-.4.4-.1.1-.3.3-.1.5.1.2.6 1.1 1.4 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5 0 .1-.2.6-.7.7-.9.2-.2.3-.2.5-.1.2.1 1.3.6 1.5.7.2.1.4.2.4.3 0 .1 0 .6-.2 1.1z" />
        </svg>
      );
    case 'telegram':
      return (
        <svg className="w-5 h-5 fill-sky-500" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm5.271 7.858c-.163 1.724-.871 5.897-1.234 7.837-.154.821-.457 1.096-.75 1.123-.637.058-1.121-.422-1.737-.826-.964-.633-1.51-1.026-2.445-1.642-1.08-.711-.38-1.102.235-1.741.161-.167 2.955-2.709 3.01-2.942.007-.03.014-.142-.052-.201-.066-.059-.163-.039-.234-.023-.101.023-1.713 1.089-4.835 3.197-.457.314-.871.468-1.242.459-.409-.009-1.197-.231-1.782-.421-.718-.234-1.288-.358-1.238-.756.026-.207.311-.42.855-.639 3.353-1.46 5.589-2.424 6.709-2.892 3.194-1.332 3.858-1.564 4.291-1.572.095 0 .308.023.447.136.117.095.149.224.164.316.015.093.034.306.019.472z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg className="w-5 h-5 fill-slate-800 dark:fill-white" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.33 22a6.34 6.34 0 0 0 6.34-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.13a4.85 4.85 0 0 1-.85-.44z" />
        </svg>
      );
    case 'topup':
    case 'credit-card':
    case 'payment':
      return <CreditCard className="w-5 h-5 text-amber-400" />;
    case 'store':
    case 'shop':
      return <Store className="w-5 h-5 text-cyan-400" />;
    case 'coins':
    case 'points':
      return <Coins className="w-5 h-5 text-yellow-400" />;
    case 'shopping-bag':
      return <ShoppingBag className="w-5 h-5 text-emerald-400" />;
    case 'message':
    case 'discord':
      return <MessageCircle className="w-5 h-5 text-indigo-500" />;
    case 'gamepad':
    case 'mabar':
      return <Gamepad2 className="w-5 h-5 text-emerald-500" />;
    case 'stream':
      return <Video className="w-5 h-5 text-purple-500" />;
    default:
      return <Globe className="w-5 h-5 text-blue-400" />;
  }
};

const THEMES: Record<string, { bg: string; cardBg: string; textColor: string; subColor: string; accent: string }> = {
  ocean: {
    bg: 'bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900',
    cardBg: 'bg-white/95 text-slate-800 hover:bg-white shadow-lg backdrop-blur-md',
    textColor: 'text-white',
    subColor: 'text-blue-100',
    accent: 'border-blue-400/30',
  },
  dark: {
    bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950',
    cardBg: 'bg-slate-900/90 text-slate-100 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 shadow-xl backdrop-blur-md',
    textColor: 'text-white',
    subColor: 'text-slate-400',
    accent: 'border-slate-700/50',
  },
  neon: {
    bg: 'bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950',
    cardBg: 'bg-white/10 text-white border border-purple-500/30 hover:border-cyan-400 hover:bg-purple-900/30 shadow-cyan-500/10 shadow-lg backdrop-blur-md',
    textColor: 'text-white',
    subColor: 'text-purple-200',
    accent: 'border-purple-500/40',
  },
  sunset: {
    bg: 'bg-gradient-to-br from-amber-600 via-rose-600 to-purple-800',
    cardBg: 'bg-white/90 text-slate-900 hover:bg-white shadow-xl backdrop-blur-md',
    textColor: 'text-white',
    subColor: 'text-amber-100',
    accent: 'border-rose-300/30',
  },
  glass: {
    bg: 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900',
    cardBg: 'bg-white/15 text-white border border-white/20 hover:bg-white/25 shadow-2xl backdrop-blur-lg',
    textColor: 'text-white',
    subColor: 'text-indigo-200',
    accent: 'border-white/20',
  },
};

export default function LinktreeView({ profile: initialProfile }: { profile: LinktreeProfileData }) {
  const [profile, setProfile] = useState<LinktreeProfileData>(initialProfile);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/linktree')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setProfile(data);
      })
      .catch(() => {});
  }, []);

  const handleCopyCode = (id: string, codeText: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeText);
    }
    setCopiedCodeId(id);
    setTimeout(() => {
      setCopiedCodeId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const currentTheme = THEMES[profile.theme] || THEMES.ocean;
  const enabledLinks = (profile.links || []).filter((l) => l.isEnabled);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        initialData={{
          siteTitle: profile.siteTitle,
          siteSubtitle: profile.siteSubtitle,
        }}
      />
      <main className={`flex-1 w-full flex items-center justify-center p-3 sm:p-6 ${currentTheme.bg} font-sans relative overflow-hidden`}>
        {/* Background Animated Blobs / Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' as const }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' as const }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"
        />

        {/* Main Container Card */}
        <div className="w-full max-w-md my-auto relative z-10 py-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center text-center space-y-6"
          >
            {/* Top Bar / Actions */}
            <motion.div variants={itemVariants} className="w-full flex items-center justify-between px-2 pt-2">
              {profile.topButtons && profile.topButtons.length > 0 ? (
                profile.topButtons
                  .filter((btn) => btn.isEnabled)
                  .map((btn) => {
                    if (btn.isShareAction || btn.url === '#share') {
                      return (
                        <button
                          key={btn.id}
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({ title: profile.name, url: window.location.href });
                            } else {
                              navigator.clipboard.writeText(window.location.href);
                              alert('Link copied to clipboard!');
                            }
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all duration-200 cursor-pointer"
                          title={btn.title}
                        >
                          <div className="w-4 h-4 flex items-center justify-center">{getIconComponent(btn.icon)}</div>
                          <span>{btn.title}</span>
                        </button>
                      );
                    }
                    const isInternal = btn.url.startsWith('/');
                    if (isInternal) {
                      return (
                        <Link
                          key={btn.id}
                          href={btn.url}
                          prefetch={true}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all duration-200"
                        >
                          <div className="w-4 h-4 flex items-center justify-center">{getIconComponent(btn.icon)}</div>
                          <span>{btn.title}</span>
                        </Link>
                      );
                    }
                    return (
                      <a
                        key={btn.id}
                        href={btn.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all duration-200"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">{getIconComponent(btn.icon)}</div>
                        <span>{btn.title}</span>
                      </a>
                    );
                  })
              ) : (
                <>
                  <Link
                    href="/mabarvip"
                    prefetch={true}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-md border border-white/15 transition-all duration-200"
                  >
                    <Gamepad2 className="w-4 h-4 text-emerald-400" />
                    <span>Mabar VIP</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: profile.name, url: window.location.href });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Link copied to clipboard!');
                        }
                      }}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-all duration-200"
                      title="Share Profile"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>

            {/* Profile Avatar */}
            <motion.div variants={itemVariants} className="relative group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden p-1 ${
                  profile.avatarBorderColor?.startsWith('bg-') || profile.avatarBorderColor?.startsWith('from-')
                    ? `bg-gradient-to-tr ${profile.avatarBorderColor}`
                    : profile.avatarBorderColor
                    ? profile.avatarBorderColor
                    : 'bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500'
                } shadow-2xl`}
              >
                <img
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-full bg-slate-800"
                />
              </motion.div>
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-md">
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
              </span>
            </motion.div>

            {/* Title & Bio */}
            <motion.div variants={itemVariants} className="space-y-2 px-4 w-full">
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${currentTheme.textColor}`}>
                {profile.name}
              </h1>
              <p className={`text-sm leading-relaxed max-w-xs mx-auto font-medium whitespace-pre-line ${currentTheme.subColor}`}>
                {profile.bio}
              </p>

              {/* Sensitivity & Game Codes (Located under Bio) */}
              {profile.codes && profile.codes.filter((c) => c.isEnabled).length > 0 && (
                <div className="pt-2 w-full max-w-xs mx-auto space-y-2">
                  {profile.codes
                    .filter((c) => c.isEnabled)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-xs transition-all hover:bg-white/15 shadow-sm"
                      >
                        <div className="flex flex-col text-left truncate">
                          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                            {c.title || 'Kode Sensitivitas'}:
                          </span>
                          <span className="font-mono font-bold text-white tracking-wide truncate">
                            {c.code}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c.id, c.code)}
                          className={`px-3 py-1 rounded-xl text-[10px] shrink-0 border transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1.5 font-bold ${
                            copiedCodeId === c.id
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold scale-105'
                              : 'bg-violet-600/80 hover:bg-violet-500 text-white border-violet-400/30'
                          }`}
                          title="Salin Kode"
                        >
                          {copiedCodeId === c.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-white/80" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>

            {/* Links List with Dynamic Section Headers */}
            <motion.div variants={containerVariants} className="w-full space-y-3.5 px-1">
              {enabledLinks.map((link, idx) => {
                // If link has a specific sectionTitle, show it; or if first link and profile.socialHeaderTitle exists, show default
                const prevLink = idx > 0 ? enabledLinks[idx - 1] : null;
                const showHeader =
                  (link.sectionTitle && (!prevLink || prevLink.sectionTitle !== link.sectionTitle)) ||
                  (idx === 0 && !link.sectionTitle && profile.socialHeaderTitle);
                const headerText = link.sectionTitle || (idx === 0 ? profile.socialHeaderTitle : '');

                return (
                  <div key={link.id} className="w-full space-y-3.5">
                    {showHeader && headerText && (
                      <motion.div variants={itemVariants} className="pt-3 pb-1 text-center">
                        <span className={`text-xs uppercase font-bold tracking-widest px-3.5 py-1 rounded-full bg-white/10 ${currentTheme.subColor} border border-white/10 shadow-sm inline-block`}>
                          {headerText}
                        </span>
                      </motion.div>
                    )}

                    <motion.a
                      href={link.url}
                      target={link.url.startsWith('http') ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      variants={itemVariants}
                      whileHover={{ scale: 1.025, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-4 px-6 rounded-full flex items-center justify-between transition-all duration-300 font-semibold text-base ${currentTheme.cardBg}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center shadow-inner">
                          {getIconComponent(link.icon)}
                        </div>
                        <span className="tracking-wide">{link.title}</span>
                      </div>
                      <MoreHorizontal className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </motion.a>
                  </div>
                );
              })}
            </motion.div>

            {/* Live / Custom Banner Cards (Multiple Support) */}
            {profile.banners && profile.banners.length > 0 ? (
              profile.banners
                .filter((banner) => banner.isEnabled !== false)
                .map((banner) => {
                  const isInternal = banner.targetUrl?.startsWith('/');
                  return (
                    <motion.div
                      key={banner.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full pt-2"
                    >
                      {isInternal ? (
                        <Link
                          href={banner.targetUrl || '/mabarvip'}
                          prefetch={true}
                          className="block relative w-full h-44 sm:h-48 rounded-3xl overflow-hidden group shadow-2xl border border-white/20 bg-slate-900"
                        >
                          <img
                            src={
                              banner.imageUrl ||
                              'https://images.unsplash.com/photo-1616588589676-63b3bd49651c?w=600&auto=format&fit=crop&q=80'
                            }
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-5 flex flex-col justify-end text-left">
                            <h3 className="text-white font-bold text-lg leading-snug drop-shadow-md">
                              {banner.title}
                            </h3>
                            {banner.subtitle && (
                              <p className="text-slate-300 text-xs mt-0.5 line-clamp-1">
                                {banner.subtitle}
                              </p>
                            )}
                            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                              <span>Kunjungi</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <a
                          href={banner.targetUrl || '/mabarvip'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative w-full h-44 sm:h-48 rounded-3xl overflow-hidden group shadow-2xl border border-white/20 bg-slate-900"
                        >
                          <img
                            src={
                              banner.imageUrl ||
                              'https://images.unsplash.com/photo-1616588589676-63b3bd49651c?w=600&auto=format&fit=crop&q=80'
                            }
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-5 flex flex-col justify-end text-left">
                            <h3 className="text-white font-bold text-lg leading-snug drop-shadow-md">
                              {banner.title}
                            </h3>
                            {banner.subtitle && (
                              <p className="text-slate-300 text-xs mt-0.5 line-clamp-1">
                                {banner.subtitle}
                              </p>
                            )}
                            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                              <span>Kunjungi</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </a>
                      )}
                    </motion.div>
                  );
                })
            ) : (
              profile.showLiveBanner && (
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full pt-2"
                >
                  <Link
                    href={profile.liveBannerUrl || '/mabarvip'}
                    prefetch={true}
                    className="block relative w-full h-44 sm:h-48 rounded-3xl overflow-hidden group shadow-2xl border border-white/20 bg-slate-900"
                  >
                    <img
                      src={
                        profile.liveBannerImage ||
                        'https://images.unsplash.com/photo-1616588589676-63b3bd49651c?w=600&auto=format&fit=crop&q=80'
                      }
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-5 flex flex-col justify-end text-left">
                      <h3 className="text-white font-bold text-lg leading-snug drop-shadow-md">
                        {profile.liveBannerTitle}
                      </h3>
                      <p className="text-slate-300 text-xs mt-0.5 line-clamp-1">
                        {profile.liveBannerSub}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                        <span>Kunjungi</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            )}

            {/* Branding badge */}
            <motion.div variants={itemVariants} className="pt-2 text-center text-xs opacity-60 text-white">
              <p className="flex items-center justify-center gap-1 font-medium">
                <span>Powered by</span>
                <Link href="/mabarvip" prefetch={true} className="underline hover:text-cyan-300 transition-colors">
                  Virtus Official
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer
        initialData={{
          siteTitle: profile.siteTitle,
          siteSubtitle: profile.siteSubtitle,
          footerDesc: profile.footerDesc,
          links: profile.links,
        }}
      />
    </div>
  );
}
