import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { TopDonorThemeProvider } from "@/components/TopDonorThemeProvider";
import { TopDonorKingBanner } from "@/components/TopDonorKingBanner";
import DocumentBrandingSync from "@/components/DocumentBrandingSync";

import { getServerBranding } from "@/lib/brandingServer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getServerBranding();
  const title = branding.siteSubtitle
    ? `${branding.siteTitle} - ${branding.siteSubtitle}`
    : branding.siteTitle;

  return {
    title,
    description: branding.footerDesc || "Streamer & Content Creator",
    icons: {
      icon: branding.faviconUrl || "/favicon.ico",
      shortcut: branding.faviconUrl || "/favicon.ico",
      apple: branding.siteLogoUrl || "/logo.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('virtus_site_branding');
                  if (raw) {
                    var b = JSON.parse(raw);
                    if (b && b.siteTitle) {
                      var sub = b.siteSubtitle ? ' - ' + b.siteSubtitle : '';
                      document.title = b.siteTitle + sub;
                    }
                    if (b && b.faviconUrl) {
                      var icons = document.querySelectorAll("link[rel*='icon']");
                      if (icons.length > 0) {
                        for (var i = 0; i < icons.length; i++) {
                          icons[i].href = b.faviconUrl;
                        }
                      } else {
                        var link = document.createElement('link');
                        link.rel = 'icon';
                        link.href = b.faviconUrl;
                        document.head.appendChild(link);
                      }
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
        <AuthProvider>
          <DocumentBrandingSync />
          <TopDonorThemeProvider>
            <TopDonorKingBanner />
            {children}
          </TopDonorThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

