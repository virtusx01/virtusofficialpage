"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Shield, LogOut, Radio, LayoutDashboard } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const isAdmin = session?.user && (session.user as any).role === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        <Link
          href="/"
          id="nav-brand-logo"
          className="flex items-center gap-2 group"
        >
          <div className="h-10 w-10 rounded-xl bg-transparen flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-all duration-300">
            <img
              src="/images/profile-images.png"
              alt="Foto Profil Pengguna"
              width={500}
              height={300}
            />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-white bg-clip-text text-transparent tracking-tight">
              Mabar VIP By Virtus
            </h1>
            <p className="text-xs text-slate-500 font-medium -mt-0.5">DIJAMIN AUTO DIGENDONG EUYY</p>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/mabarvip"
            id="nav-home-btn"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-900"
          >
            Live Queue
          </Link>
          <Link
            href="/textberjalan"
            id="nav-textberjalan-btn"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-900"
          >
            Teks Berjalan
          </Link>

          {isAdmin ? (
            <>
              <Link
                href="/admin/dashboard"
                id="nav-dashboard-btn"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all px-3 py-1.5 rounded-lg"
              >
                <LayoutDashboard className="h-4 w-4 text-violet-400" />
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                id="nav-logout-btn"
                className="flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/30 hover:border-red-900/60 transition-all px-3 py-1.5 rounded-lg cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </header>
  );
}
