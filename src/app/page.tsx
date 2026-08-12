import prisma from '@/lib/prisma';
import LinktreeView, { LinktreeProfileData } from '@/components/LinktreeView';

// Revalidate on demand or every 5s
export const revalidate = 0;

export default async function HomePage() {
  let profile = await prisma.linktreeProfile.findUnique({
    where: { id: 'profile' },
    include: {
      links: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!profile) {
    // Return fallback profile until initialized via GET route or admin
    profile = {
      id: 'profile',
      name: 'Jessica Jones',
      bio: 'Seasoned Senior Marketing Manager, excels in strategic marketing.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      theme: 'ocean',
      socialHeaderTitle: 'Social Media Handles',
      showLiveBanner: true,
      liveBannerTitle: 'Contact Me / Mabar VIP Queue',
      liveBannerSub: 'Join our exclusive gaming stream & VIP queue',
      liveBannerUrl: '/mabarvip',
      liveBannerImage: 'https://images.unsplash.com/photo-1616588589676-63b3bd49651c?w=600&auto=format&fit=crop&q=80',
      updatedAt: new Date(),
      links: [
        { id: '1', title: 'Facebook', url: 'https://facebook.com', icon: 'facebook', category: 'social', isEnabled: true, orderIndex: 0, profileId: 'profile', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'Instagram', url: 'https://instagram.com', icon: 'instagram', category: 'social', isEnabled: true, orderIndex: 1, profileId: 'profile', createdAt: new Date(), updatedAt: new Date() },
        { id: '3', title: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin', category: 'social', isEnabled: true, orderIndex: 2, profileId: 'profile', createdAt: new Date(), updatedAt: new Date() },
        { id: '4', title: 'Mabar VIP Queue', url: '/mabarvip', icon: 'globe', category: 'custom', isEnabled: true, orderIndex: 3, profileId: 'profile', createdAt: new Date(), updatedAt: new Date() },
      ],
    };
  }

  return <LinktreeView profile={profile as unknown as LinktreeProfileData} />;
}
