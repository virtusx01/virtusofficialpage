"use client";

import Link from "next/link";
import { Sparkles, Heart, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/90 text-slate-400 font-sans relative overflow-hidden">
      {/* Background Subtle Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shadow-lg shadow-violet-500/10 group-hover:scale-105 transition-all">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-white bg-clip-text text-transparent">
                  Mabar VIP By Virtus
                </h3>
                <p className="text-xs text-slate-500 font-medium">DIJAMIN AUTO DIGENDONG EUYY</p>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Platform resmi antrean Mabar VIP dan Linktree Virtus. Dapatkan akses ke game streaming eksklusif, antrean VIP real-time, dan konten terbaru kami.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-full w-fit">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">Server & System Operational</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Navigasi Utama</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Halaman Utama (Linktree)</span>
                </Link>
              </li>
              <li>
                <Link href="/mabarvip" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Mabar VIP</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300">QUEUE</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Social & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Sosial Media & Join</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://sociabuzz.com/onlyvirtus/tribe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1 text-amber-500 font-medium"
                >
                  <span>Order VIP Sociabuzz</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <span>WhatsApp Community</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <span>TikTok Virtus</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <span>YouTube Channel</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Mabar VIP By Virtus. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for Virtus Community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
