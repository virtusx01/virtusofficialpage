'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SociabuzzLeaderboard } from '@/components/SociabuzzLeaderboard';
import { ChromaVideoAd } from '@/components/ChromaVideoAd';
import { BackgroundEffects } from '@/components/BackgroundEffects';
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
  customIconUrl?: string;
  layout?: 'row' | 'column' | string;
  textAlign?: 'left' | 'center' | string;
  itemAlign?: 'left' | 'center' | string;
  iconWidth?: number;
  category: string;
  sectionTitle?: string;
  sectionBgColor?: string;
  sectionTextColor?: string;
  waCustomMessage?: string;
  animation?: 'none' | 'shake' | 'bounce' | 'pulse' | 'glow' | 'shake-bounce' | 'bell-shake' | string;
  animationSpeed?: 'slow' | 'normal' | 'fast' | string;
  animationStrength?: number;
  animationCount?: number;
  bgImageUrl?: string;
  bgOpacity?: number;
  textShadow?: 'none' | 'subtle' | 'medium' | 'glow' | 'heavy' | string;
  iconShadow?: 'none' | 'subtle' | 'medium' | 'glow' | 'heavy' | string;
  showInHeaderIcons?: boolean;
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
  bannerImageUrl?: string;
  showBannerImage?: boolean;
  bannerHeight?: number;
  bannerOpacity?: number;
  bannerOffsetTop?: number;
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
  videoAdHideClose?: boolean;
  showSocialHeaderIcons?: boolean;
  socialIconPosition?: string;
  socialIconSize?: string;
  socialIconGap?: string;
  socialIconColor?: string;
  socialIconUseBrandColor?: boolean;
  socialIconBg?: string;
  socialIconCustomBg?: string;
  socialIconShape?: string;
  bgImageUrl?: string;
  bgDarkness?: number;
  bgBlur?: number;
  bgEffect?: string;
  bgEffectSpeed?: string;
  videoAds?: any[];
  links: LinktreeItem[];
  banners?: LinktreeBannerItem[];
  topButtons?: LinktreeTopButtonItem[];
  codes?: LinktreeCodeItem[];
}

const getIconComponent = (iconName: string, linkUrl: string = '') => {
  const name = (iconName || '').toLowerCase().trim();
  const url = (linkUrl || '').toLowerCase().trim();

  // 1. TikTok
  if (name.includes('tiktok') || url.includes('tiktok.com')) {
    return (
      <svg className="w-5 h-5 fill-current text-slate-100 dark:text-white" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.33 22a6.34 6.34 0 0 0 6.34-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.13a4.85 4.85 0 0 1-.85-.44z" />
      </svg>
    );
  }

  // 2. WhatsApp
  if (name.includes('whatsapp') || name === 'wa' || url.includes('wa.me') || url.includes('whatsapp.com')) {
    if (name.includes('dark')) {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#0F172A" stroke="#25D366" strokeWidth="1.5" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2z" />
          <path fill="#25D366" d="M16.8 15.5c-.2.6-1.2 1.1-1.6 1.2-.4.1-1 .1-1.5-.1-.4-.1-.8-.3-1.4-.5-2.5-1.1-4.1-3.6-4.2-3.7-.1-.2-1-1.3-1-2.5 0-1.2.6-1.8.9-2 .2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.8 1.8.1.1.1.3 0 .4-.1.2-.1.3-.2.4-.1.1-.3.3-.4.4-.1.1-.3.3-.1.5.1.2.6 1.1 1.4 1.7.9.8 1.7 1.1 2 1.2.2.1.4.1.5 0 .1-.2.6-.7.7-.9.2-.2.3-.2.5-.1.2.1 1.3.6 1.5.7.2.1.4.2.4.3 0 .1 0 .6-.2 1.1z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 fill-[#25D366]" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    );
  }

  // 3. Instagram
  if (name.includes('instagram') || name === 'ig' || url.includes('instagram.com')) {
    return (
      <svg className="w-5 h-5 text-pink-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }

  // 4. YouTube
  if (name.includes('youtube') || name === 'yt' || url.includes('youtube.com') || url.includes('youtu.be')) {
    return (
      <svg className="w-5 h-5 fill-red-500 shrink-0" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  // 5. Facebook
  if (name.includes('facebook') || name === 'fb' || url.includes('facebook.com')) {
    return (
      <svg className="w-5 h-5 fill-blue-500 shrink-0" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  // 6. Telegram
  if (name.includes('telegram') || name === 'tg' || url.includes('t.me') || url.includes('telegram.org')) {
    return (
      <svg className="w-5 h-5 fill-sky-500 shrink-0" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm5.271 7.858c-.163 1.724-.871 5.897-1.234 7.837-.154.821-.457 1.096-.75 1.123-.637.058-1.121-.422-1.737-.826-.964-.633-1.51-1.026-2.445-1.642-1.08-.711-.38-1.102.235-1.741.161-.167 2.955-2.709 3.01-2.942.007-.03.014-.142-.052-.201-.066-.059-.163-.039-.234-.023-.101.023-1.713 1.089-4.835 3.197-.457.314-.871.468-1.242.459-.409-.009-1.197-.231-1.782-.421-.718-.234-1.288-.358-1.238-.756.026-.207.311-.42.855-.639 3.353-1.46 5.589-2.424 6.709-2.892 3.194-1.332 3.858-1.564 4.291-1.572.095 0 .308.023.447.136.117.095.149.224.164.316.015.093.034.306.019.472z" />
      </svg>
    );
  }

  // 7. Twitter / X
  if (name.includes('twitter') || name === 'x' || url.includes('twitter.com') || url.includes('x.com')) {
    return (
      <svg className="w-5 h-5 fill-sky-400 shrink-0" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  // 8. GitHub
  if (name.includes('github') || url.includes('github.com')) {
    return (
      <svg className="w-5 h-5 fill-current text-slate-100 dark:text-white shrink-0" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    );
  }

  // 9. LinkedIn
  if (name.includes('linkedin') || url.includes('linkedin.com')) {
    return (
      <svg className="w-5 h-5 fill-blue-600 shrink-0" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
      </svg>
    );
  }

  // Other types
  switch (name) {
    case 'topup':
    case 'credit-card':
    case 'payment':
      return <CreditCard className="w-5 h-5 text-amber-400 shrink-0" />;
    case 'store':
    case 'shop':
      return <Store className="w-5 h-5 text-cyan-400 shrink-0" />;
    case 'coins':
    case 'points':
      return <Coins className="w-5 h-5 text-yellow-400 shrink-0" />;
    case 'shopping-bag':
      return <ShoppingBag className="w-5 h-5 text-emerald-400 shrink-0" />;
    case 'message':
    case 'discord':
      return <MessageCircle className="w-5 h-5 text-indigo-500 shrink-0" />;
    case 'gamepad':
    case 'mabar':
      return <Gamepad2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    case 'stream':
      return <Video className="w-5 h-5 text-purple-500 shrink-0" />;
    default:
      return <Globe className="w-5 h-5 text-blue-400 shrink-0" />;
  }
};

const renderLinkIcon = (link: LinktreeItem) => {
  const isCustom = Boolean(link.customIconUrl && link.customIconUrl.trim());
  const isColumn = link.layout === 'column';
  const defaultWidth = isColumn ? (isCustom ? 80 : 48) : (isCustom ? 44 : 36);
  const rawWidth = typeof link.iconWidth === 'number' && !isNaN(link.iconWidth) ? link.iconWidth : defaultWidth;
  // Clamp width strictly between 24px and 280px for neatness
  const clampedWidth = Math.max(24, Math.min(Math.round(rawWidth), 280));

  if (isCustom) {
    if (isColumn) {
      return (
        <div
          style={{ width: `${clampedWidth}px`, height: '56px' }}
          className="flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300 max-w-full"
        >
          <img
            src={link.customIconUrl}
            alt={link.title}
            className="w-full h-full object-contain drop-shadow-sm rounded-lg"
            loading="lazy"
          />
        </div>
      );
    }

    return (
      <div
        style={{ width: `${clampedWidth}px`, height: '36px' }}
        className="flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300 max-w-[120px]"
      >
        <img
          src={link.customIconUrl}
          alt={link.title}
          className="w-full h-full object-contain drop-shadow-sm rounded"
          loading="lazy"
        />
      </div>
    );
  }

  // Predefined SVG icon
  if (isColumn) {
    return (
      <div className="w-14 h-14 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/15 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300 shrink-0">
        <div className="w-8 h-8 flex items-center justify-center [&>svg]:w-7 [&>svg]:h-7">
          {getIconComponent(link.icon, link.url)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform duration-300">
      {getIconComponent(link.icon, link.url)}
    </div>
  );
};

const renderSocialHeaderIcons = (profile: LinktreeProfileData, itemVariants: any) => {
  if (profile.showSocialHeaderIcons === false || profile.socialIconPosition === 'disabled') return null;

  const headerLinks = (profile.links || []).filter(
    (l) => l.isEnabled && l.showInHeaderIcons !== false
  );

  if (headerLinks.length === 0) return null;

  // Size mapping
  const sizeMap: Record<string, { btn: string; icon: string }> = {
    sm: { btn: 'w-8 h-8', icon: 'w-4 h-4' },
    md: { btn: 'w-10 h-10', icon: 'w-5 h-5' },
    lg: { btn: 'w-12 h-12', icon: 'w-6 h-6' },
    xl: { btn: 'w-14 h-14', icon: 'w-7 h-7' },
  };
  const sizeStyle = sizeMap[profile.socialIconSize || 'md'] || sizeMap.md;

  // Gap mapping
  const gapMap: Record<string, string> = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4.5',
    xl: 'gap-6',
  };
  const gapClass = gapMap[profile.socialIconGap || 'md'] || 'gap-3';

  // Shape mapping
  const shapeMap: Record<string, string> = {
    circle: 'rounded-full',
    rounded: 'rounded-xl',
    square: 'rounded-md',
    pill: 'rounded-2xl',
  };
  const shapeClass = shapeMap[profile.socialIconShape || 'circle'] || 'rounded-full';

  // Bg style
  const bgType = profile.socialIconBg || 'glass';
  let bgClass = '';
  let inlineBgStyle: React.CSSProperties = {};

  if (bgType === 'transparent') {
    bgClass = 'bg-transparent hover:bg-white/10 border border-transparent text-white';
  } else if (bgType === 'solid') {
    bgClass = 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 shadow-md text-white';
  } else if (bgType === 'custom' && profile.socialIconCustomBg) {
    bgClass = 'hover:brightness-110 border border-white/20 shadow-sm text-white';
    inlineBgStyle.backgroundColor = profile.socialIconCustomBg;
  } else {
    // default glass
    bgClass = 'bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 shadow-sm text-white';
  }

  if (profile.socialIconColor) {
    inlineBgStyle.color = profile.socialIconColor;
  }

  return (
    <motion.div variants={itemVariants} className={`flex items-center justify-center flex-wrap ${gapClass} pt-2.5 pb-1 px-4 w-full`}>
      {headerLinks.map((link) => {
        let targetUrl = link.url;
        const isWa =
          link.icon?.toLowerCase().includes('whatsapp') ||
          link.icon?.toLowerCase() === 'wa' ||
          link.url.includes('wa.me') ||
          link.url.includes('whatsapp.com');

        if (isWa && link.waCustomMessage && link.waCustomMessage.trim() && !targetUrl.includes('text=')) {
          const separator = targetUrl.includes('?') ? '&' : '?';
          targetUrl = `${targetUrl}${separator}text=${encodeURIComponent(link.waCustomMessage.trim())}`;
        }

        return (
          <motion.a
            key={link.id}
            href={targetUrl}
            target={targetUrl.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.92 }}
            title={link.title}
            style={inlineBgStyle}
            className={`flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${sizeStyle.btn} ${shapeClass} ${bgClass}`}
          >
            {link.customIconUrl && link.customIconUrl.trim() ? (
              <img
                src={link.customIconUrl}
                alt={link.title}
                className={`${sizeStyle.icon} object-contain rounded`}
              />
            ) : (
              <div className={`flex items-center justify-center ${sizeStyle.icon} [&>svg]:w-full [&>svg]:h-full`}>
                {getIconComponent(link.icon, link.url)}
              </div>
            )}
          </motion.a>
        );
      })}
    </motion.div>
  );
};

const renderFormattedBioText = (bio: string) => {
  if (!bio) return null;

  const parseBioContent = (text: string) => {
    // Regex matches markdown links: [Text](URL) or [Text](URL|color|bold|underline) OR HTML <a> tags
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|<a\s+(?:[^>]*?\bhref=["']([^"']+)["'])?[^>]*>(.*?)<\/a>/gi;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const plainText = text.substring(lastIndex, match.index);
        parts.push(parseFormattedSubText(plainText, `plain-${lastIndex}`));
      }

      if (match[1] && match[2]) {
        // Markdown style: [Text](URL|options)
        const label = match[1];
        const rawUrl = match[2];
        const urlParts = rawUrl.split('|');
        const url = urlParts[0].trim();
        const colorOpt = urlParts[1]?.trim();
        const isBold = rawUrl.toLowerCase().includes('bold') || rawUrl.toLowerCase().includes('b');
        const isUnderline = rawUrl.toLowerCase().includes('underline') || rawUrl.toLowerCase().includes('u');

        let linkColorStyle: React.CSSProperties = {};
        let linkClass = 'transition-all hover:opacity-80 inline-block cursor-pointer font-semibold';

        if (colorOpt && (colorOpt.startsWith('#') || colorOpt.startsWith('rgb') || colorOpt.startsWith('hsl'))) {
          linkColorStyle.color = colorOpt;
        } else if (colorOpt && colorOpt !== 'bold' && colorOpt !== 'underline') {
          if (colorOpt === 'cyan') linkClass += ' text-cyan-400';
          else if (colorOpt === 'gold' || colorOpt === 'amber') linkClass += ' text-amber-400';
          else if (colorOpt === 'pink') linkClass += ' text-pink-400';
          else if (colorOpt === 'emerald' || colorOpt === 'green') linkClass += ' text-emerald-400';
          else if (colorOpt === 'red') linkClass += ' text-red-400';
          else linkClass += ` text-${colorOpt}`;
        } else {
          linkClass += ' text-cyan-400';
        }

        if (isBold) linkClass += ' font-extrabold';
        if (isUnderline) linkClass += ' underline underline-offset-2';

        parts.push(
          <a
            key={`link-${match.index}`}
            href={url}
            target={url.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            style={linkColorStyle}
            className={linkClass}
          >
            {label}
          </a>
        );
      } else if (match[4]) {
        // HTML <a> tag
        const url = match[3] || '#';
        const label = match[4];
        parts.push(
          <a
            key={`html-link-${match.index}`}
            href={url}
            target={url.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="text-cyan-400 font-bold underline underline-offset-2 hover:opacity-80 transition-all inline-block"
          >
            {label}
          </a>
        );
      }

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(parseFormattedSubText(text.substring(lastIndex), `plain-${lastIndex}`));
    }

    return parts;
  };

  const parseFormattedSubText = (text: string, keyPrefix: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const inlineRegex = /\*\*([^*]+)\*\*|<u>(.*?)<\/u>/g;
      const inlineParts: React.ReactNode[] = [];
      let lastIdx = 0;
      let inMatch: RegExpExecArray | null;

      while ((inMatch = inlineRegex.exec(line)) !== null) {
        if (inMatch.index > lastIdx) {
          inlineParts.push(line.substring(lastIdx, inMatch.index));
        }

        if (inMatch[1]) {
          inlineParts.push(<strong key={`${keyPrefix}-b-${inMatch.index}`} className="font-bold">{inMatch[1]}</strong>);
        } else if (inMatch[2]) {
          inlineParts.push(<u key={`${keyPrefix}-u-${inMatch.index}`} className="underline underline-offset-2">{inMatch[2]}</u>);
        }

        lastIdx = inlineRegex.lastIndex;
      }

      if (lastIdx < line.length) {
        inlineParts.push(line.substring(lastIdx));
      }

      return (
        <React.Fragment key={`${keyPrefix}-line-${lineIdx}`}>
          {inlineParts}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return parseBioContent(bio);
};

const AutoScrollText = ({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [overflowDistance, setOverflowDistance] = React.useState(0);

  React.useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        if (textWidth > containerWidth + 2) {
          setOverflowDistance(textWidth - containerWidth);
        } else {
          setOverflowDistance(0);
        }
      }
    };

    checkOverflow();
    const timer = setTimeout(checkOverflow, 150);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [text]);

  if (overflowDistance > 0) {
    const scrollDuration = Math.max(3, overflowDistance / 25);
    return (
      <div
        ref={containerRef}
        className={`overflow-hidden whitespace-nowrap min-w-0 w-full ${className}`}
      >
        <motion.div
          animate={{
            x: [0, -(overflowDistance + 12), -(overflowDistance + 12), 0, 0],
          }}
          transition={{
            duration: scrollDuration * 2 + 3,
            times: [0, 0.4, 0.5, 0.9, 1],
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="inline-block"
        >
          <span ref={textRef} className="inline-block">
            {text}
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap min-w-0 w-full ${className}`}
    >
      <span ref={textRef} className="inline-block truncate max-w-full">
        {text}
      </span>
    </div>
  );
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
      <main className={`flex-1 w-full flex items-center justify-center p-3 sm:p-6 ${profile.bgImageUrl ? 'bg-slate-950' : currentTheme.bg} font-sans relative overflow-hidden`}>
        {/* Custom Background Image & Ultra-fast Visual Effects Layer */}
        <BackgroundEffects
          bgImageUrl={profile.bgImageUrl}
          bgDarkness={profile.bgDarkness ?? 40}
          bgBlur={profile.bgBlur ?? 0}
          bgEffect={profile.bgEffect || 'none'}
          bgEffectSpeed={profile.bgEffectSpeed || 'normal'}
        />

        {/* Background Animated Blobs / Glow (Fallback if no custom image & effect) */}
        {!profile.bgImageUrl && profile.bgEffect === 'none' && (
          <>
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
          </>
        )}

        {/* Main Container Card */}
        <div className="w-full max-w-md my-auto relative z-10 py-6">
          {/* Profile Header Banner (Posisi dari paling atas di belakang tombol aksi atas & avatar) */}
          {profile.showBannerImage && profile.bannerImageUrl && (
            <div
              className="absolute left-0 right-0 w-full overflow-hidden pointer-events-none rounded-3xl select-none -z-10 transition-all duration-300"
              style={{
                top: `${profile.bannerOffsetTop ?? 0}px`,
                height: `${profile.bannerHeight || 260}px`,
              }}
            >
              {/* Banner Image */}
              <img
                src={profile.bannerImageUrl}
                alt="Profile Banner"
                className="w-full h-full object-cover object-center"
              />

              {/* Seamless Dynamic Gradient Mask:
                  Atas: jernih / tidak transparan (100% visible)
                  Bawah: memudar sesuai persentase transparansi yang dikustom (default 50%) hingga menyatu ke background */}
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 40%, rgba(15,23,42,${((profile.bannerOpacity ?? 50) / 100).toFixed(2)}) 70%, rgba(15,23,42,1) 100%)`,
                  WebkitMaskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,${(1 - ((profile.bannerOpacity ?? 50) / 100)).toFixed(2)}) 75%, rgba(0,0,0,0) 100%)`,
                  maskImage: `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 35%, rgba(0,0,0,${(1 - ((profile.bannerOpacity ?? 50) / 100)).toFixed(2)}) 75%, rgba(0,0,0,0) 100%)`
                }}
              />
            </div>
          )}

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center text-center space-y-6 relative"
          >
            {/* Top Bar / Actions */}
            <motion.div variants={itemVariants} className="w-full flex items-center justify-between px-2 pt-2 z-10">
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
                          <div className="w-4 h-4 flex items-center justify-center">{getIconComponent(btn.icon, btn.url)}</div>
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
                          <div className="w-4 h-4 flex items-center justify-center">{getIconComponent(btn.icon, btn.url)}</div>
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
                        <div className="w-4 h-4 flex items-center justify-center">{getIconComponent(btn.icon, btn.url)}</div>
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
              <p className={`text-sm leading-relaxed max-w-xs mx-auto font-medium ${currentTheme.subColor}`}>
                {renderFormattedBioText(profile.bio)}
              </p>

              {/* Social Media Header Icons (Bawah Judul & Bio) */}
              {(profile.socialIconPosition === 'under_bio' || !profile.socialIconPosition) &&
                renderSocialHeaderIcons(profile, itemVariants)}

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

            {/* Leaderboard Top Supporters Bulan Ini */}
            {(profile.showLeaderboard ?? true) && (
              <motion.div variants={itemVariants} className="w-full my-4">
                <SociabuzzLeaderboard
                  tribeId={profile.sociabuzzTribeId || '8913094574'}
                  leaderboardUrl={profile.leaderboardUrl || 'https://sociabuzz.com/pro/tribe/topleaderboard/v2/8913094574'}
                  title={profile.leaderboardTitle || 'TOP SUPPORTERS BULAN INI'}
                  displayMode={(profile.leaderboardMode as 'top3' | 'top10') || 'top3'}
                  headerIcon={profile.leaderboardHeaderIcon || 'trophy'}
                  headerColor={profile.leaderboardHeaderColor || ''}
                  headerFont={profile.leaderboardHeaderFont || 'sans'}
                  headerSize={profile.leaderboardHeaderSize || '2xl'}
                />
              </motion.div>
            )}

            {/* Social Media Header Icons (Di Atas Links List) */}
            {profile.socialIconPosition === 'above_links' && renderSocialHeaderIcons(profile, itemVariants)}

            {/* Links List with Dynamic Section Headers */}
            <motion.div variants={containerVariants} className="w-full space-y-3.5 px-1">
              {enabledLinks.map((link, idx) => {
                // If link has a specific sectionTitle, show it; or if first link and profile.socialHeaderTitle exists, show default
                const prevLink = idx > 0 ? enabledLinks[idx - 1] : null;
                const showHeader =
                  (link.sectionTitle && (!prevLink || prevLink.sectionTitle !== link.sectionTitle)) ||
                  (idx === 0 && !link.sectionTitle && profile.socialHeaderTitle);
                const headerText = link.sectionTitle || (idx === 0 ? profile.socialHeaderTitle : '');

                // Category custom styling
                const sectionBg = link.sectionBgColor || profile.categoryBgColor;
                const sectionText = link.sectionTextColor || profile.categoryTextColor;

                // Process WhatsApp custom default message if applicable
                const isWa =
                  link.icon?.toLowerCase().includes('whatsapp') ||
                  link.icon?.toLowerCase() === 'wa' ||
                  link.url.includes('wa.me') ||
                  link.url.includes('whatsapp.com');
                
                let targetUrl = link.url;
                if (isWa && link.waCustomMessage && link.waCustomMessage.trim() && !targetUrl.includes('text=')) {
                  const separator = targetUrl.includes('?') ? '&' : '?';
                  targetUrl = `${targetUrl}${separator}text=${encodeURIComponent(link.waCustomMessage.trim())}`;
                }

                // Calculate animation properties
                const animType = link.animation || 'none';
                const animSpeed = link.animationSpeed || 'normal';
                const animStrength = typeof link.animationStrength === 'number' ? link.animationStrength : 5;
                const factor = animStrength / 5; // 1 is default (factor=1)

                // Base duration in seconds for loop cycle
                let cycleDuration = 3;
                if (animSpeed === 'fast') cycleDuration = 1.8;
                if (animSpeed === 'slow') cycleDuration = 4.5;

                let linkAnimateProps: any = undefined;
                let linkTransitionProps: any = undefined;

                if (animType === 'shake') {
                  const xDist = Math.round(5 * factor);
                  linkAnimateProps = {
                    x: [0, -xDist, xDist, -xDist, xDist, 0, 0],
                  };
                  linkTransitionProps = {
                    duration: cycleDuration,
                    times: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 1],
                    repeat: Infinity,
                    ease: 'easeInOut',
                  };
                } else if (animType === 'bounce') {
                  const yDist = Math.round(8 * factor);
                  linkAnimateProps = {
                    y: [0, -yDist, 0, Math.round(-yDist * 0.4), 0, 0],
                  };
                  linkTransitionProps = {
                    duration: cycleDuration,
                    times: [0, 0.15, 0.3, 0.45, 0.6, 1],
                    repeat: Infinity,
                    ease: 'easeInOut',
                  };
                } else if (animType === 'shake-bounce' || animType === 'bell-shake') {
                  // Authentic Bell Swing Pendulum Physics
                  // NOTE: transformOrigin MUST be set via CSS style, NOT inside animate prop (framer-motion ignores it there)
                  const count = typeof link.animationCount === 'number' && link.animationCount > 0 ? link.animationCount : 3;
                  const maxDeg = Math.max(3, Math.round(7 * factor));

                  const rotateArray: number[] = [0];
                  const timesArray: number[] = [0];

                  // 60% of the cycle: active swings, 40%: rest at 0
                  const activeShare = 0.6;
                  const swings = count * 2; // back-and-forth
                  const swingTime = activeShare / swings;

                  for (let i = 1; i <= swings; i++) {
                    const damp = Math.pow(0.75, i - 1); // natural air-resistance damping
                    const direction = i % 2 === 1 ? -1 : 1;
                    const angle = Number((direction * maxDeg * damp).toFixed(2));
                    rotateArray.push(angle);
                    timesArray.push(Number((i * swingTime).toFixed(3)));
                  }

                  // Land back at 0 cleanly
                  rotateArray.push(0, 0);
                  timesArray.push(Number((activeShare + 0.08).toFixed(3)), 1);

                  // Only rotate goes in animate; transformOrigin is set via style prop on the element
                  linkAnimateProps = {
                    rotate: rotateArray,
                  };
                  linkTransitionProps = {
                    duration: cycleDuration,
                    times: timesArray,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  };
                } else if (animType === 'pulse') {
                  const scaleVal = 1 + 0.04 * factor;
                  linkAnimateProps = {
                    scale: [1, scaleVal, 1, scaleVal, 1, 1],
                  };
                  linkTransitionProps = {
                    duration: cycleDuration,
                    times: [0, 0.15, 0.3, 0.45, 0.6, 1],
                    repeat: Infinity,
                    ease: 'easeInOut',
                  };
                } else if (animType === 'glow') {
                  linkAnimateProps = {
                    boxShadow: [
                      '0 0 0px rgba(56, 189, 248, 0)',
                      `0 0 ${Math.round(15 * factor)}px rgba(56, 189, 248, 0.8)`,
                      '0 0 0px rgba(56, 189, 248, 0)',
                    ],
                  };
                  linkTransitionProps = {
                    duration: cycleDuration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  };
                }

                // Shadow CSS generator
                const getTextShadowStyle = (shadowType?: string) => {
                  if (shadowType === 'subtle') return 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6))';
                  if (shadowType === 'medium') return 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.85)) drop-shadow(0 1px 2px rgba(0,0,0,0.5))';
                  if (shadowType === 'heavy') return 'drop-shadow(0 3px 6px rgba(0, 0, 0, 1)) drop-shadow(0 0 8px rgba(0, 0, 0, 0.9))';
                  if (shadowType === 'glow') return 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.9)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.6))';
                  return undefined;
                };

                const getIconShadowStyle = (shadowType?: string) => {
                  if (shadowType === 'subtle') return 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))';
                  if (shadowType === 'medium') return 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8))';
                  if (shadowType === 'heavy') return 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 6px rgba(0,0,0,0.8))';
                  if (shadowType === 'glow') return 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.95)) drop-shadow(0 0 15px rgba(236, 72, 153, 0.7))';
                  return undefined;
                };

                const textShadowCss = getTextShadowStyle(link.textShadow);
                const iconShadowCss = getIconShadowStyle(link.iconShadow);

                const cardOpacity = typeof link.bgOpacity === 'number' ? link.bgOpacity / 100 : 1;

                return (
                  <div key={link.id} className="w-full space-y-3.5">
                    {showHeader && headerText && (
                      <motion.div variants={itemVariants} className="pt-3 pb-1 text-center">
                        <span
                          style={{
                            ...(sectionBg ? { backgroundColor: sectionBg } : {}),
                            ...(sectionText ? { color: sectionText } : {}),
                          }}
                          className={`text-xs uppercase font-bold tracking-widest px-3.5 py-1 rounded-full ${
                            !sectionBg ? 'bg-white/10' : ''
                          } ${!sectionText ? currentTheme.subColor : ''} border border-white/10 shadow-sm inline-block`}
                        >
                          {headerText}
                        </span>
                      </motion.div>
                    )}

                    {link.layout === 'column' ? (
                      <motion.a
                        href={targetUrl}
                        target={targetUrl.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        variants={itemVariants}
                        animate={linkAnimateProps}
                        transition={linkTransitionProps}
                        whileHover={{ scale: 1.025, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        style={(animType === 'bell-shake' || animType === 'shake-bounce') ? { transformOrigin: 'top center' } : undefined}
                        className="w-full py-4 px-5 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 font-semibold gap-2.5 relative group shadow-md overflow-hidden"
                      >
                        {/* Background Base Container with Opacity */}
                        <div
                          style={{ opacity: cardOpacity }}
                          className={`absolute inset-0 z-0 transition-opacity duration-300 ${
                            link.bgImageUrl ? 'bg-slate-900 border border-white/20' : currentTheme.cardBg
                          }`}
                        >
                          {link.bgImageUrl && (
                            <div className="absolute inset-0">
                              <img
                                src={link.bgImageUrl}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/25 transition-colors duration-300" />
                            </div>
                          )}
                        </div>

                        <div className="relative z-10 flex flex-col items-center justify-center w-full gap-2.5">
                          <div style={{ filter: iconShadowCss }}>
                            {renderLinkIcon(link)}
                          </div>
                          <div style={{ filter: textShadowCss }} className="w-full">
                            <AutoScrollText
                              text={link.title}
                              className="tracking-wide text-base font-bold text-center"
                            />
                          </div>
                        </div>

                        <div className="absolute top-3.5 right-4 opacity-30 group-hover:opacity-90 transition-opacity z-10">
                          <MoreHorizontal className="w-4 h-4" />
                        </div>
                      </motion.a>
                    ) : (
                      <motion.a
                        href={targetUrl}
                        target={targetUrl.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        variants={itemVariants}
                        animate={linkAnimateProps}
                        transition={linkTransitionProps}
                        whileHover={{ scale: 1.025, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        style={(animType === 'bell-shake' || animType === 'shake-bounce') ? { transformOrigin: 'top center' } : undefined}
                        className={`w-full py-4 px-6 rounded-full flex items-center transition-all duration-300 font-semibold text-base relative group shadow-md overflow-hidden ${
                          link.itemAlign === 'center' ? 'justify-center' : 'justify-between'
                        }`}
                      >
                        {/* Background Base Container with Opacity */}
                        <div
                          style={{ opacity: cardOpacity }}
                          className={`absolute inset-0 z-0 transition-opacity duration-300 ${
                            link.bgImageUrl ? 'bg-slate-900 border border-white/20' : currentTheme.cardBg
                          }`}
                        >
                          {link.bgImageUrl && (
                            <div className="absolute inset-0">
                              <img
                                src={link.bgImageUrl}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/25 transition-colors duration-300" />
                            </div>
                          )}
                        </div>

                        {link.itemAlign === 'center' ? (
                          <>
                            <div className="relative z-10 flex items-center gap-3.5 max-w-[85%] min-w-0 flex-1">
                              <div style={{ filter: iconShadowCss }}>
                                {renderLinkIcon(link)}
                              </div>
                              <div style={{ filter: textShadowCss }} className="min-w-0 flex-1">
                                <AutoScrollText
                                  text={link.title}
                                  className={`tracking-wide font-medium ${
                                    link.textAlign === 'center' ? 'text-center' : 'text-left'
                                  }`}
                                />
                              </div>
                            </div>
                            <MoreHorizontal className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity absolute right-6 shrink-0 z-10" />
                          </>
                        ) : (
                          <>
                            <div className="relative z-10 flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                              <div style={{ filter: iconShadowCss }}>
                                {renderLinkIcon(link)}
                              </div>
                              <div style={{ filter: textShadowCss }} className="min-w-0 flex-1">
                                <AutoScrollText
                                  text={link.title}
                                  className={`tracking-wide font-medium ${
                                    link.textAlign === 'center' ? 'text-center flex-1' : 'text-left'
                                  }`}
                                />
                              </div>
                            </div>
                            <MoreHorizontal className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 z-10" />
                          </>
                        )}
                      </motion.a>
                    )}
                  </div>
                );
              })}
            </motion.div>

            {/* Live / Custom Banner Cards (Multiple Support) */}
            {profile.showLiveBanner !== false && (() => {
              const activeBanners = (profile.banners || []).filter((banner) => banner.isEnabled !== false);
              if (activeBanners.length === 0) return null;
              return activeBanners.map((banner) => {
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
                        {banner.imageUrl && (
                          <img
                            src={banner.imageUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        )}
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
                        {banner.imageUrl && (
                          <img
                            src={banner.imageUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        )}
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
              });
            })()}

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

      {/* Chroma Key Video Overlay Ad */}
      {profile.showVideoAd && ((profile.videoAds && profile.videoAds.length > 0) || profile.videoAdUrl) && (
        <ChromaVideoAd
          ads={profile.videoAds}
          videoUrl={profile.videoAdUrl}
          targetUrl={profile.videoAdTargetUrl}
          chromaEnable={profile.videoAdChromaEnable}
          chromaColor={profile.videoAdChromaColor}
          chromaSimilarity={profile.videoAdChromaSimilarity}
          chromaSmoothness={profile.videoAdChromaSmoothness}
          widthDesktop={profile.videoAdWidthDesktop || profile.videoAdWidth || 180}
          widthMobile={profile.videoAdWidthMobile || 120}
          position={profile.videoAdPosition}
          offsetX={profile.videoAdOffsetX}
          offsetY={profile.videoAdOffsetY}
          zIndex={profile.videoAdZIndex}
          hideCloseButton={profile.videoAdHideClose}
        />
      )}
    </div>
  );
}
