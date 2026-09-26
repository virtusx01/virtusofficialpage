import { NextResponse } from 'next/server';
import { getServerBranding } from '@/lib/brandingServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const branding = await getServerBranding();
    const faviconUrl = branding.faviconUrl || '/favicon.ico';

    // Jika custom favicon adalah URL eksternal (misal Supabase), redirect browser langsung
    if (faviconUrl && faviconUrl.startsWith('http')) {
      return NextResponse.redirect(faviconUrl, {
        status: 307,
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      });
    }

    // Jika path lokal atau default, rewrite/redirect ke static icon di public
    return NextResponse.rewrite(new URL('/favicon.ico', 'http://localhost:3000'));
  } catch (error) {
    console.error('Error serving dynamic favicon:', error);
    return NextResponse.rewrite(new URL('/favicon.ico', 'http://localhost:3000'));
  }
}
