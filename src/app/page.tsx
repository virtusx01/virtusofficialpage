import prisma from '@/lib/prisma';
import LinktreeView, { LinktreeProfileData } from '@/components/LinktreeView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let profile = null;

  try {
    profile = await prisma.linktreeProfile.findUnique({
      where: { id: 'profile' },
      include: {
        links: { orderBy: { orderIndex: 'asc' } },
        banners: { orderBy: { orderIndex: 'asc' } },
        topButtons: { orderBy: { orderIndex: 'asc' } },
        codes: { orderBy: { orderIndex: 'asc' } },
      },
    });
  } catch (err) {
    console.error('Error fetching profile from Prisma, using fallback:', err);
  }

  if (!profile) {
    // Return fallback profile until initialized via GET route or admin
    profile = {
      id: 'profile',
      name: 'Virtus Official',
      bio: 'Streamer & Content Creator',
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
      siteLogoUrl: '',
      faviconUrl: '',
      footerDesc: 'Platform resmi Virtus Official. Dapatkan akses ke game streaming eksklusif, antrean VIP real-time, dan tautan sosial media resmi kami.',
      updatedAt: new Date(),
      links: [
        { id: '1', title: 'Tiktok', url: 'https://www.tiktok.com/@onlyvirtus', icon: 'tiktok', category: 'social', headerTitle: '', isEnabled: true, orderIndex: 0, profileId: 'profile', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'Youtube', url: 'https://youtube.com', icon: 'youtube', category: 'social', headerTitle: '', isEnabled: true, orderIndex: 1, profileId: 'profile', createdAt: new Date(), updatedAt: new Date() },
        { id: '3', title: 'Astra Points (Top Up)', url: 'https://astrapoints.com', icon: 'globe', category: 'custom', headerTitle: 'Top Up di sini', isEnabled: true, orderIndex: 2, profileId: 'profile', createdAt: new Date(), updatedAt: new Date() },
      ],
      banners: [],
      topButtons: [
        { id: '1', title: 'Mabar VIP', url: '/mabarvip', icon: 'gamepad', isShareAction: false, isEnabled: true, orderIndex: 0, profileId: 'profile', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'Share Profile', url: '#share', icon: 'share', isShareAction: true, isEnabled: true, orderIndex: 1, profileId: 'profile', createdAt: new Date(), updatedAt: new Date() },
      ],
      codes: [],
    };
  }

  return <LinktreeView profile={profile as unknown as LinktreeProfileData} />;
}
