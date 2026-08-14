"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard, Sparkles, Menu, X, Home, Users, Cat } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user && (session.user as any).role === "admin";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLive, setIsLive] = useState<boolean>(false);

  const [siteTitle, setSiteTitle] = useState("Virtus Official");
  const [siteSubtitle, setSiteSubtitle] = useState("Streamer TIDAK KIKIR");
  // Logo selalu dari path statis /site-logo.png — tidak perlu fetch API
  const [logoExists, setLogoExists] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    // Cek apakah file statis logo tersedia
    fetch(`/site-logo.png`, { method: 'HEAD' })
      .then((r) => { if (r.ok) setLogoExists(true); })
      .catch(() => { });
  }, []);

  // Auto-detect live status & site branding settings
  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setIsLive(!!data.isLive);
        }
      } catch (err) {
        console.error("Failed to check live status:", err);
      }
    };

    const fetchBranding = async () => {
      try {
        const res = await fetch("/api/linktree");
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            if (data.siteTitle) setSiteTitle(data.siteTitle);
            if (data.siteSubtitle) setSiteSubtitle(data.siteSubtitle);
          }
        }
      } catch (err) { }
    };

    checkLiveStatus();
    fetchBranding();
    const interval = setInterval(checkLiveStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: "/", label: "Halaman Utama", icon: Home },
    {
      href: "/mabarvip",
      label: "Mabar VIP",
      icon: Users,
      badge: isLive ? "SEDANG LIVE" : "BELUM LIVE",
      isLive,
    },
    {
      href: "/fanbase-cupidut-dudud",
      label: "Fanbase Cupidut & Dudud",
      icon: Cat,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          prefetch={true}
          id="nav-brand-logo"
          className="flex items-center gap-3 group shrink-0"
        >
          <div className="h-10 w-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-all duration-300 overflow-hidden shrink-0">
            {logoExists && !logoError ? (
              <img src="/site-logo.png" alt="" onError={() => setLogoError(true)} className="w-full h-full object-cover" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-white bg-clip-text text-transparent tracking-tight leading-none">
              {siteTitle}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">{siteSubtitle}</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 p-1 rounded-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${active
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-850"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge && (
                  <span
                    className={`flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${link.isLive
                      ? "bg-red-500/20 text-red-400 border-red-500/30 shadow-sm shadow-red-500/20"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${link.isLive ? "bg-red-500 animate-pulse" : "bg-emerald-400"
                        }`}
                    />
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Admin Controls (Shown ONLY if logged in as Admin) */}
        <div className="hidden md:flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard"
                id="nav-dashboard-btn"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-100 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all px-3 py-1.5 rounded-xl"
              >
                <LayoutDashboard className="h-4 w-4 text-violet-400" />
                <span>Dashboard Admin</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                id="nav-logout-btn"
                className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/30 border border-red-900/40 hover:border-red-900/70 transition-all px-3 py-1.5 rounded-xl cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-900 bg-slate-950 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${active
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${link.isLive
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {isAdmin && (
            <div className="pt-3 border-t border-slate-900 flex flex-col gap-2">
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-slate-200 font-semibold text-sm border border-slate-800"
              >
                <LayoutDashboard className="w-4 h-4 text-violet-400" />
                <span>Dashboard Admin</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/40 text-red-300 font-semibold text-sm border border-red-900/50 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
