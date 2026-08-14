"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Heart, ArrowUpRight } from "lucide-react";

interface SocialLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  category?: string;
  isEnabled?: boolean;
}

interface FooterProps {
  initialData?: {
    siteTitle?: string;
    siteSubtitle?: string;
    footerDesc?: string;
    links?: SocialLink[];
  };
}

export default function Footer({ initialData }: FooterProps = {}) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialData?.links || []);
  const [siteTitle, setSiteTitle] = useState(initialData?.siteTitle || "Virtus Official");
  const [siteSubtitle, setSiteSubtitle] = useState(initialData?.siteSubtitle || "Streamer TIDAK KIKIR");
  const [footerDesc, setFooterDesc] = useState(
    initialData?.footerDesc ||
    "Platform resmi Virtus Official. Dapatkan akses ke game streaming eksklusif, antrean VIP real-time, dan tautan sosial media resmi kami."
  );

  const [isLoaded, setIsLoaded] = useState(!!initialData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/linktree", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.links)) {
            const active = data.links.filter((l: SocialLink) => l.isEnabled !== false);
            setSocialLinks(active);
          }
          if (data.siteTitle) setSiteTitle(data.siteTitle);
          if (data.siteSubtitle) setSiteSubtitle(data.siteSubtitle);
          if (data.footerDesc !== undefined) setFooterDesc(data.footerDesc || "");
        }
      } catch (err) {
        console.error("Failed to fetch footer data:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchData();
  }, []);

  const linksToRender = socialLinks;

  return (
    <footer className="border-t border-slate-900 bg-slate-950/90 text-slate-400 font-sans relative overflow-hidden">
      {/* Background Subtle Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" prefetch={true} className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl  flex items-center justify-center  group-hover:scale-105 transition-all duration-300 overflow-hidden shrink-0">
                <img src="/logo.png" alt="Virtus Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-white bg-clip-text text-transparent">
                  {siteTitle}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{siteSubtitle}</p>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md whitespace-pre-line">
              {footerDesc}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Navigasi Utama</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" prefetch={true} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Halaman Utama</span>
                </Link>
              </li>
              <li>
                <Link href="/mabarvip" prefetch={true} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Mabar VIP</span>
                </Link>
              </li>
              <li>
                <Link href="/fanbase-cupidut-dudud" prefetch={true} className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Fanbase Cupidut & Dudud</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Social & Support (Based on main page Linktree data) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Sosial Media & Join</h4>
            <ul className="space-y-2 text-sm">
              {linksToRender.map((link) => {
                const isInternal = link.url.startsWith("/");
                if (isInternal) {
                  return (
                    <li key={link.id}>
                      <Link
                        href={link.url}
                        prefetch={true}
                        className="hover:text-white transition-colors flex items-center gap-1 text-slate-300"
                      >
                        <span>{link.title}</span>
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-violet-300 transition-colors flex items-center gap-1 text-slate-300"
                    >
                      <span>{link.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Virtus Official. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-1">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>untuk Komunitas Virtus</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
