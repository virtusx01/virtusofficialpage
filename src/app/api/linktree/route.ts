import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const isUUID = (str: any) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const DEFAULT_LINKS = [
  { title: 'Tiktok', url: 'https://tiktok.com/@onlyvirtus', icon: 'tiktok', customIconUrl: '', layout: 'row', textAlign: 'left', itemAlign: 'left', iconWidth: 48, category: 'social', sectionTitle: '', orderIndex: 0 },
  { title: 'Youtube', url: 'https://www.youtube.com/channel/UCS4s9c5ADSshIhr3BnlTlVg', icon: 'youtube', customIconUrl: '', layout: 'row', textAlign: 'left', itemAlign: 'left', iconWidth: 48, category: 'social', sectionTitle: '', orderIndex: 1 },
  { title: 'Astra Points', url: 'https://astrapoints.com', icon: 'coins', customIconUrl: '', layout: 'row', textAlign: 'left', itemAlign: 'left', iconWidth: 48, category: 'custom', sectionTitle: 'Top Up', orderIndex: 2 },
  { title: 'Mabar VIP Queue', url: '/mabarvip', icon: 'gamepad', customIconUrl: '', layout: 'row', textAlign: 'left', itemAlign: 'left', iconWidth: 48, category: 'custom', sectionTitle: '', orderIndex: 3 },
];

const DEFAULT_BANNERS = [
  {
    title: 'Cupidut & Dudud Lovers',
    subtitle: 'Galeri album foto eksklusif dua kucing kesayangan Virtus',
    badgeText: 'LIVE / QUEUE',
    targetUrl: '/fanbase-cupidut-dudud',
    imageUrl: 'https://images.unsplash.com/photo-1616588589676-63b3bd49651c?w=600&auto=format&fit=crop&q=80',
    isEnabled: true,
    orderIndex: 0,
  },
];

const DEFAULT_TOP_BUTTONS = [
  {
    title: 'Mabar VIP',
    url: '/mabarvip',
    icon: 'gamepad',
    isShareAction: false,
    isEnabled: true,
    orderIndex: 0,
  },
  {
    title: 'Share Profile',
    url: '#share',
    icon: 'share',
    isShareAction: true,
    isEnabled: true,
    orderIndex: 1,
  },
];

const DEFAULT_CODES = [
  {
    title: 'Kode Sensitivitas',
    code: '7284-9102-1827-0192',
    isEnabled: true,
    orderIndex: 0,
  },
];

export async function GET() {
  try {
    let profile = await prisma.linktreeProfile.findUnique({
      where: { id: 'profile' },
      include: {
        links: { orderBy: { orderIndex: 'asc' } },
        banners: { orderBy: { orderIndex: 'asc' } },
        topButtons: { orderBy: { orderIndex: 'asc' } },
        codes: { orderBy: { orderIndex: 'asc' } },
        videoAds: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!profile) {
      profile = await prisma.linktreeProfile.create({
        data: {
          id: 'profile',
          name: 'Virtus Official',
          bio: 'Streamer TIDAK KIKIR | Mobile Legends & Gaming Content Creator 🔥',
          avatarUrl: '/logo.png',
          avatarBorderColor: 'from-cyan-400 via-indigo-500 to-purple-500',
          theme: 'ocean',
          socialHeaderTitle: 'Social Media Handles',
          showLiveBanner: true,
          liveBannerTitle: 'Cupidut & Dudud Lovers',
          liveBannerSub: 'Galeri album foto eksklusif dua kucing kesayangan Virtus',
          liveBannerUrl: '/fanbase-cupidut-dudud',
          liveBannerImage: 'https://images.unsplash.com/photo-1616588589676-63b3bd49651c?w=600&auto=format&fit=crop&q=80',
          siteTitle: 'Virtus Official',
          siteSubtitle: 'Streamer TIDAK KIKIR',
          footerDesc: 'Platform resmi Virtus Official. Dapatkan akses ke game streaming eksklusif, antrean VIP real-time, dan tautan sosial media resmi kami.',
          links: { create: DEFAULT_LINKS },
          banners: { create: DEFAULT_BANNERS },
          topButtons: { create: DEFAULT_TOP_BUTTONS },
          codes: { create: DEFAULT_CODES },
        },
        include: {
          links: { orderBy: { orderIndex: 'asc' } },
          banners: { orderBy: { orderIndex: 'asc' } },
          topButtons: { orderBy: { orderIndex: 'asc' } },
          codes: { orderBy: { orderIndex: 'asc' } },
          videoAds: { orderBy: { orderIndex: 'asc' } },
        },
      });
    } else {
      let needsRefresh = false;


      // Seed default video ad if legacy videoAdUrl exists but videoAds table is empty
      if (profile.videoAdUrl && (!profile.videoAds || profile.videoAds.length === 0)) {
        await prisma.linktreeVideoAd.create({
          data: {
            title: 'Iklan Utama',
            videoUrl: profile.videoAdUrl,
            targetUrl: profile.videoAdTargetUrl || '',
            chromaEnable: profile.videoAdChromaEnable ?? true,
            chromaColor: profile.videoAdChromaColor || '#00FF00',
            chromaSimilarity: profile.videoAdChromaSimilarity ?? 0.35,
            chromaSmoothness: profile.videoAdChromaSmoothness ?? 0.1,
            isEnabled: true,
            orderIndex: 0,
            profileId: 'profile',
          },
        });
        needsRefresh = true;
      }

      if (needsRefresh) {
        profile = await prisma.linktreeProfile.findUnique({
          where: { id: 'profile' },
          include: {
            links: { orderBy: { orderIndex: 'asc' } },
            banners: { orderBy: { orderIndex: 'asc' } },
            topButtons: { orderBy: { orderIndex: 'asc' } },
            codes: { orderBy: { orderIndex: 'asc' } },
            videoAds: { orderBy: { orderIndex: 'asc' } },
          },
        });
      }
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error fetching linktree profile:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch linktree profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      bio,
      avatarUrl,
      avatarBorderColor,
      theme,
      socialHeaderTitle,
      categoryBgColor,
      categoryTextColor,
      showLiveBanner,
      liveBannerTitle,
      liveBannerSub,
      liveBannerUrl,
      liveBannerImage,
      siteTitle,
      siteSubtitle,
      siteLogoUrl,
      faviconUrl,
      footerDesc,
      showLeaderboard,
      leaderboardTitle,
      sociabuzzTribeId,
      leaderboardMode,
      leaderboardUrl,
      leaderboardHeaderIcon,
      leaderboardHeaderColor,
      leaderboardHeaderFont,
      leaderboardHeaderSize,
      showVideoAd,
      videoAdUrl,
      videoAdTargetUrl,
      videoAdChromaEnable,
      videoAdChromaColor,
      videoAdChromaSimilarity,
      videoAdChromaSmoothness,
      videoAdWidth,
      videoAdWidthDesktop,
      videoAdWidthMobile,
      videoAdPosition,
      videoAdOffsetX,
      videoAdOffsetY,
      videoAdZIndex,
      showSocialHeaderIcons,
      socialIconPosition,
      socialIconSize,
      socialIconGap,
      socialIconColor,
      socialIconUseBrandColor,
      socialIconBg,
      bgImageUrl,
      bgDarkness,
      bgBlur,
      bgEffect,
      bgEffectSpeed,
      videoAds,
      links,
      banners,
      topButtons,
      codes,
    } = body;

    // Update profile metadata
    const updatedProfile = await prisma.linktreeProfile.upsert({
      where: { id: 'profile' },
      update: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(avatarBorderColor !== undefined && { avatarBorderColor }),
        ...(theme !== undefined && { theme }),
        ...(socialHeaderTitle !== undefined && { socialHeaderTitle }),
        ...(categoryBgColor !== undefined && { categoryBgColor }),
        ...(categoryTextColor !== undefined && { categoryTextColor }),
        ...(showLiveBanner !== undefined && { showLiveBanner }),
        ...(liveBannerTitle !== undefined && { liveBannerTitle }),
        ...(liveBannerSub !== undefined && { liveBannerSub }),
        ...(liveBannerUrl !== undefined && { liveBannerUrl }),
        ...(liveBannerImage !== undefined && { liveBannerImage }),
        ...(siteTitle !== undefined && { siteTitle }),
        ...(siteSubtitle !== undefined && { siteSubtitle }),
        ...(siteLogoUrl !== undefined && { siteLogoUrl }),
        ...(faviconUrl !== undefined && { faviconUrl }),
        ...(footerDesc !== undefined && { footerDesc }),
        ...(showLeaderboard !== undefined && { showLeaderboard }),
        ...(leaderboardTitle !== undefined && { leaderboardTitle }),
        ...(sociabuzzTribeId !== undefined && { sociabuzzTribeId }),
        ...(leaderboardMode !== undefined && { leaderboardMode }),
        ...(leaderboardUrl !== undefined && { leaderboardUrl }),
        ...(leaderboardHeaderIcon !== undefined && { leaderboardHeaderIcon }),
        ...(leaderboardHeaderColor !== undefined && { leaderboardHeaderColor }),
        ...(leaderboardHeaderFont !== undefined && { leaderboardHeaderFont }),
        ...(leaderboardHeaderSize !== undefined && { leaderboardHeaderSize }),
        ...(showVideoAd !== undefined && { showVideoAd }),
        ...(videoAdUrl !== undefined && { videoAdUrl }),
        ...(videoAdTargetUrl !== undefined && { videoAdTargetUrl }),
        ...(videoAdChromaEnable !== undefined && { videoAdChromaEnable }),
        ...(videoAdChromaColor !== undefined && { videoAdChromaColor }),
        ...(videoAdChromaSimilarity !== undefined && { videoAdChromaSimilarity }),
        ...(videoAdChromaSmoothness !== undefined && { videoAdChromaSmoothness }),
        ...(videoAdWidth !== undefined && { videoAdWidth }),
        ...(videoAdWidthDesktop !== undefined && { videoAdWidthDesktop }),
        ...(videoAdWidthMobile !== undefined && { videoAdWidthMobile }),
        ...(videoAdPosition !== undefined && { videoAdPosition }),
        ...(videoAdOffsetX !== undefined && { videoAdOffsetX }),
        ...(videoAdOffsetY !== undefined && { videoAdOffsetY }),
        ...(videoAdZIndex !== undefined && { videoAdZIndex }),
        ...(showSocialHeaderIcons !== undefined && { showSocialHeaderIcons }),
        ...(socialIconPosition !== undefined && { socialIconPosition }),
        ...(socialIconSize !== undefined && { socialIconSize }),
        ...(socialIconGap !== undefined && { socialIconGap }),
        ...(socialIconColor !== undefined && { socialIconColor }),
        ...(socialIconUseBrandColor !== undefined && { socialIconUseBrandColor }),
        ...(socialIconBg !== undefined && { socialIconBg }),
        ...(bgImageUrl !== undefined && { bgImageUrl }),
        ...(bgDarkness !== undefined && { bgDarkness }),
        ...(bgBlur !== undefined && { bgBlur }),
        ...(bgEffect !== undefined && { bgEffect }),
        ...(bgEffectSpeed !== undefined && { bgEffectSpeed }),
      },
      create: {
        id: 'profile',
        name: name || 'Jessica Jones',
        bio: bio || '',
        avatarUrl: avatarUrl || '',
        avatarBorderColor: avatarBorderColor || 'from-cyan-400 via-indigo-500 to-purple-500',
        theme: theme || 'ocean',
        socialHeaderTitle: socialHeaderTitle || 'Social Media Handles',
        categoryBgColor: categoryBgColor || '',
        categoryTextColor: categoryTextColor || '',
        showLiveBanner: showLiveBanner ?? true,
        liveBannerTitle: liveBannerTitle || 'Contact Me',
        liveBannerSub: liveBannerSub || '',
        liveBannerUrl: liveBannerUrl || '/mabarvip',
        liveBannerImage: liveBannerImage || '',
        siteTitle: siteTitle || 'Virtus Official',
        siteSubtitle: siteSubtitle || 'Streamer TIDAK KIKIR',
        siteLogoUrl: siteLogoUrl || '',
        faviconUrl: faviconUrl || '',
        footerDesc: footerDesc || 'Platform resmi Virtus Official. Dapatkan akses ke game streaming eksklusif, antrean VIP real-time, dan tautan sosial media resmi kami.',
        showLeaderboard: showLeaderboard ?? true,
        leaderboardTitle: leaderboardTitle || 'TOP SUPPORTERS BULAN INI',
        sociabuzzTribeId: sociabuzzTribeId || '8913094574',
        leaderboardMode: leaderboardMode || 'top3',
        leaderboardUrl: leaderboardUrl || 'https://sociabuzz.com/pro/tribe/topleaderboard/v2/8913094574',
        leaderboardHeaderIcon: leaderboardHeaderIcon || 'trophy',
        leaderboardHeaderColor: leaderboardHeaderColor || '',
        leaderboardHeaderFont: leaderboardHeaderFont || 'sans',
        leaderboardHeaderSize: leaderboardHeaderSize || '2xl',
        showVideoAd: showVideoAd ?? false,
        videoAdUrl: videoAdUrl || '',
        videoAdTargetUrl: videoAdTargetUrl || '',
        videoAdChromaEnable: videoAdChromaEnable ?? true,
        videoAdChromaColor: videoAdChromaColor || '#00FF00',
        videoAdChromaSimilarity: videoAdChromaSimilarity ?? 0.35,
        videoAdChromaSmoothness: videoAdChromaSmoothness ?? 0.1,
        videoAdWidth: videoAdWidth ?? 180,
        videoAdWidthDesktop: videoAdWidthDesktop ?? 180,
        videoAdWidthMobile: videoAdWidthMobile ?? 120,
        videoAdPosition: videoAdPosition || 'bottom-right',
        videoAdOffsetX: videoAdOffsetX ?? 20,
        videoAdOffsetY: videoAdOffsetY ?? 20,
        videoAdZIndex: videoAdZIndex ?? 50,
        showSocialHeaderIcons: showSocialHeaderIcons ?? true,
        socialIconPosition: socialIconPosition || 'under_bio',
        socialIconSize: socialIconSize || 'md',
        socialIconGap: socialIconGap || 'md',
        socialIconColor: socialIconColor || '',
        socialIconUseBrandColor: socialIconUseBrandColor ?? false,
        socialIconBg: socialIconBg || 'glass',
        bgImageUrl: bgImageUrl || '',
        bgDarkness: bgDarkness ?? 40,
        bgBlur: bgBlur ?? 0,
        bgEffect: bgEffect || 'none',
        bgEffectSpeed: bgEffectSpeed || 'normal',
      },
    });

    // Sync links if provided
    if (Array.isArray(links)) {
      await prisma.linktreeLink.deleteMany({
        where: { profileId: 'profile' },
      });

      if (links.length > 0) {
        await prisma.linktreeLink.createMany({
          data: links.map((link: any, idx: number) => ({
            id: isUUID(link.id) ? link.id : undefined,
            title: link.title || 'Link',
            url: link.url || '#',
            icon: link.icon || 'globe',
            customIconUrl: typeof link.customIconUrl === 'string' ? link.customIconUrl : '',
            layout: link.layout === 'column' ? 'column' : 'row',
            textAlign: link.textAlign === 'center' ? 'center' : 'left',
            itemAlign: link.itemAlign === 'center' ? 'center' : 'left',
            iconWidth: typeof link.iconWidth === 'number' && !isNaN(link.iconWidth) ? Math.max(24, Math.min(Math.round(link.iconWidth), 280)) : 48,
            category: link.category || 'social',
            sectionTitle: typeof link.sectionTitle === 'string' ? link.sectionTitle : '',
            sectionBgColor: typeof link.sectionBgColor === 'string' ? link.sectionBgColor : '',
            sectionTextColor: typeof link.sectionTextColor === 'string' ? link.sectionTextColor : '',
            waCustomMessage: typeof link.waCustomMessage === 'string' ? link.waCustomMessage : '',
            shakeEnable: link.shakeEnable ?? false,
            shakeDirection: link.shakeDirection || 'vertical',
            shakeDistance: typeof link.shakeDistance === 'number' && !isNaN(link.shakeDistance) ? Math.max(2, Math.min(Math.round(link.shakeDistance), 40)) : 8,
            shakeIntensity: link.shakeIntensity || 'medium',
            shakeFrequency: link.shakeFrequency || 'normal',
            showInHeaderIcons: link.showInHeaderIcons ?? true,
            isEnabled: link.isEnabled ?? true,
            orderIndex: idx,
            profileId: 'profile',
          })),
        });
      }
    }

    // Sync banners if provided
    if (Array.isArray(banners)) {
      await prisma.linktreeBanner.deleteMany({
        where: { profileId: 'profile' },
      });

      if (banners.length > 0) {
        await prisma.linktreeBanner.createMany({
          data: banners.map((banner: any, idx: number) => ({
            id: isUUID(banner.id) ? banner.id : undefined,
            title: banner.title || 'Judul Banner',
            subtitle: banner.subtitle || '',
            badgeText: banner.badgeText || 'LIVE / QUEUE',
            targetUrl: banner.targetUrl || '/mabarvip',
            imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1616588589676-63b3bd49651c?w=600&auto=format&fit=crop&q=80',
            isEnabled: banner.isEnabled ?? true,
            orderIndex: idx,
            profileId: 'profile',
          })),
        });
      }
    }

    // Sync topButtons if provided
    if (Array.isArray(topButtons)) {
      await prisma.linktreeTopButton.deleteMany({
        where: { profileId: 'profile' },
      });

      if (topButtons.length > 0) {
        await prisma.linktreeTopButton.createMany({
          data: topButtons.map((btn: any, idx: number) => ({
            id: isUUID(btn.id) ? btn.id : undefined,
            title: btn.title || 'Tombol',
            url: btn.url || '#',
            icon: btn.icon || 'gamepad',
            isShareAction: !!btn.isShareAction,
            isEnabled: btn.isEnabled ?? true,
            orderIndex: idx,
            profileId: 'profile',
          })),
        });
      }
    }

    // Sync codes if provided
    if (Array.isArray(codes)) {
      await prisma.linktreeCode.deleteMany({
        where: { profileId: 'profile' },
      });

      if (codes.length > 0) {
        await prisma.linktreeCode.createMany({
          data: codes.map((c: any, idx: number) => ({
            id: isUUID(c.id) ? c.id : undefined,
            title: c.title || 'Kode Sensitivitas',
            code: c.code || '',
            isEnabled: c.isEnabled ?? true,
            orderIndex: idx,
            profileId: 'profile',
          })),
        });
      }
    }

    // Sync videoAds if provided
    if (Array.isArray(videoAds)) {
      await prisma.linktreeVideoAd.deleteMany({
        where: { profileId: 'profile' },
      });

      if (videoAds.length > 0) {
        await prisma.linktreeVideoAd.createMany({
          data: videoAds.map((ad: any, idx: number) => ({
            id: isUUID(ad.id) ? ad.id : undefined,
            title: ad.title || `Iklan ${idx + 1}`,
            videoUrl: ad.videoUrl || '',
            targetUrl: ad.targetUrl || '',
            chromaEnable: ad.chromaEnable ?? true,
            chromaColor: ad.chromaColor || '#00FF00',
            chromaSimilarity: typeof ad.chromaSimilarity === 'number' ? ad.chromaSimilarity : 0.35,
            chromaSmoothness: typeof ad.chromaSmoothness === 'number' ? ad.chromaSmoothness : 0.1,
            isEnabled: ad.isEnabled ?? true,
            orderIndex: idx,
            profileId: 'profile',
          })),
        });
      }
    }

    const result = await prisma.linktreeProfile.findUnique({
      where: { id: 'profile' },
      include: {
        links: { orderBy: { orderIndex: 'asc' } },
        banners: { orderBy: { orderIndex: 'asc' } },
        topButtons: { orderBy: { orderIndex: 'asc' } },
        codes: { orderBy: { orderIndex: 'asc' } },
        videoAds: { orderBy: { orderIndex: 'asc' } },
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating linktree profile:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update linktree profile' }, { status: 500 });
  }
}
