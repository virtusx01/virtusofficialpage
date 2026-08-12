import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Default links to populate if empty
const DEFAULT_LINKS = [
  { title: 'Facebook', url: 'https://facebook.com', icon: 'facebook', category: 'social', orderIndex: 0 },
  { title: 'Instagram', url: 'https://instagram.com', icon: 'instagram', category: 'social', orderIndex: 1 },
  { title: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin', category: 'social', orderIndex: 2 },
  { title: 'Mabar VIP Queue', url: '/mabarvip', icon: 'globe', category: 'custom', orderIndex: 3 },
];

export async function GET() {
  try {
    let profile = await prisma.linktreeProfile.findUnique({
      where: { id: 'profile' },
      include: {
        links: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!profile) {
      profile = await prisma.linktreeProfile.create({
        data: {
          id: 'profile',
          name: 'Jessica Jones',
          bio: 'Seasoned Senior Marketing Manager, excels in strategic marketing.',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
          theme: 'ocean',
          socialHeaderTitle: 'Social Media Handles',
          showLiveBanner: true,
          liveBannerTitle: 'Contact Me',
          liveBannerSub: 'Join Mabar VIP Queue & Exclusive Stream',
          liveBannerUrl: '/mabarvip',
          liveBannerImage: 'https://images.unsplash.com/photo-1616588589676-63b3bd49651c?w=600&auto=format&fit=crop&q=80',
          links: {
            create: DEFAULT_LINKS,
          },
        },
        include: {
          links: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching linktree profile:', error);
    return NextResponse.json({ error: 'Failed to fetch linktree profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      bio,
      avatarUrl,
      theme,
      socialHeaderTitle,
      showLiveBanner,
      liveBannerTitle,
      liveBannerSub,
      liveBannerUrl,
      liveBannerImage,
      links,
    } = body;

    // Update profile metadata
    const updatedProfile = await prisma.linktreeProfile.upsert({
      where: { id: 'profile' },
      update: {
        name,
        bio,
        avatarUrl,
        theme,
        socialHeaderTitle,
        showLiveBanner,
        liveBannerTitle,
        liveBannerSub,
        liveBannerUrl,
        liveBannerImage,
      },
      create: {
        id: 'profile',
        name: name || 'Jessica Jones',
        bio: bio || '',
        avatarUrl: avatarUrl || '',
        theme: theme || 'ocean',
        socialHeaderTitle: socialHeaderTitle || 'Social Media Handles',
        showLiveBanner: showLiveBanner ?? true,
        liveBannerTitle: liveBannerTitle || 'Contact Me',
        liveBannerSub: liveBannerSub || '',
        liveBannerUrl: liveBannerUrl || '/mabarvip',
        liveBannerImage: liveBannerImage || '',
      },
    });

    // Sync links if provided
    if (Array.isArray(links)) {
      // Delete existing links and recreate (or update) to maintain clean ordering
      await prisma.linktreeLink.deleteMany({
        where: { profileId: 'profile' },
      });

      if (links.length > 0) {
        await prisma.linktreeLink.createMany({
          data: links.map((link: any, idx: number) => ({
            id: link.id && typeof link.id === 'string' && link.id.length > 10 ? link.id : undefined,
            title: link.title || 'Link',
            url: link.url || '#',
            icon: link.icon || 'globe',
            category: link.category || 'social',
            isEnabled: link.isEnabled ?? true,
            orderIndex: idx,
            profileId: 'profile',
          })),
        });
      }
    }

    const result = await prisma.linktreeProfile.findUnique({
      where: { id: 'profile' },
      include: {
        links: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating linktree profile:', error);
    return NextResponse.json({ error: 'Failed to update linktree profile' }, { status: 500 });
  }
}
