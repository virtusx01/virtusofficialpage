import prisma from '@/lib/prisma';

export interface ServerBranding {
  siteTitle: string;
  siteSubtitle: string;
  footerDesc: string;
  siteLogoUrl: string;
  faviconUrl: string;
}

export async function getServerBranding(): Promise<ServerBranding> {
  try {
    const profile = await prisma.linktreeProfile.findUnique({
      where: { id: 'profile' },
      select: {
        siteTitle: true,
        siteSubtitle: true,
        footerDesc: true,
        siteLogoUrl: true,
        faviconUrl: true,
      },
    });

    if (profile) {
      return {
        siteTitle: profile.siteTitle || 'Virtus Official',
        siteSubtitle: profile.siteSubtitle || 'Streamer TIDAK KIKIR',
        footerDesc: profile.footerDesc || '',
        siteLogoUrl: profile.siteLogoUrl || '/logo.png',
        faviconUrl: profile.faviconUrl || '/favicon.ico',
      };
    }
  } catch (err) {
    console.error('Error in getServerBranding:', err);
  }

  return {
    siteTitle: 'Virtus Official',
    siteSubtitle: 'Streamer TIDAK KIKIR',
    footerDesc: '',
    siteLogoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
  };
}
