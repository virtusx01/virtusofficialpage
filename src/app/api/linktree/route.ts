import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const isUUID = (str: any) =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const DEFAULT_LINKS = [
  { title: 'Tiktok', url: 'https://tiktok.com/@onlyvirtus', icon: 'tiktok', category: 'social', sectionTitle: '', orderIndex: 0 },
  { title: 'Youtube', url: 'https://www.youtube.com/channel/UCS4s9c5ADSshIhr3BnlTlVg', icon: 'youtube', category: 'social', sectionTitle: '', orderIndex: 1 },
  { title: 'Astra Points', url: 'https://astrapoints.com', icon: 'coins', category: 'custom', sectionTitle: 'Top Up', orderIndex: 2 },
  { title: 'Mabar VIP Queue', url: '/mabarvip', icon: 'gamepad', category: 'custom', sectionTitle: '', orderIndex: 3 },
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
        },
      });
    } else if (!profile.codes || profile.codes.length === 0) {
      // Seed default sensitivity code if missing
      await prisma.linktreeCode.createMany({
        data: DEFAULT_CODES.map((c) => ({
          ...c,
          profileId: 'profile',
        })),
      });

      profile = await prisma.linktreeProfile.findUnique({
        where: { id: 'profile' },
        include: {
          links: { orderBy: { orderIndex: 'asc' } },
          banners: { orderBy: { orderIndex: 'asc' } },
          topButtons: { orderBy: { orderIndex: 'asc' } },
          codes: { orderBy: { orderIndex: 'asc' } },
        },
      });
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
      },
      create: {
        id: 'profile',
        name: name || 'Jessica Jones',
        bio: bio || '',
        avatarUrl: avatarUrl || '',
        avatarBorderColor: avatarBorderColor || 'from-cyan-400 via-indigo-500 to-purple-500',
        theme: theme || 'ocean',
        socialHeaderTitle: socialHeaderTitle || 'Social Media Handles',
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
            category: link.category || 'social',
            sectionTitle: typeof link.sectionTitle === 'string' ? link.sectionTitle : '',
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

    const result = await prisma.linktreeProfile.findUnique({
      where: { id: 'profile' },
      include: {
        links: { orderBy: { orderIndex: 'asc' } },
        banners: { orderBy: { orderIndex: 'asc' } },
        topButtons: { orderBy: { orderIndex: 'asc' } },
        codes: { orderBy: { orderIndex: 'asc' } },
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating linktree profile:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update linktree profile' }, { status: 500 });
  }
}
