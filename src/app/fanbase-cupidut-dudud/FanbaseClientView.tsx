"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Cat,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  Heart,
  X,
  Share2,
  Check,
} from "lucide-react";

export interface FanbaseCatPhoto {
  id: string;
  catType: "CUPIDUT" | "DUDUD";
  title: string;
  description: string;
  imageUrl: string;
  orderIndex: number;
}

interface FanbaseClientViewProps {
  initialPhotos: FanbaseCatPhoto[];
}

export default function FanbaseClientView({ initialPhotos }: FanbaseClientViewProps) {
  const [photos] = useState<FanbaseCatPhoto[]>(initialPhotos);
  const [activeTab, setActiveTab] = useState<"ALL" | "CUPIDUT" | "DUDUD">("ALL");
  const [selectedPhoto, setSelectedPhoto] = useState<FanbaseCatPhoto | null>(null);
  const [copied, setCopied] = useState(false);

  const cupidutCount = useMemo(
    () => photos.filter((p) => p.catType === "CUPIDUT").length,
    [photos]
  );
  const dududCount = useMemo(
    () => photos.filter((p) => p.catType === "DUDUD").length,
    [photos]
  );

  const filteredPhotos = useMemo(() => {
    if (activeTab === "ALL") return photos;
    return photos.filter((p) => p.catType === activeTab);
  }, [photos, activeTab]);

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Galeri Fanbase Cupidut & Dudud",
          text: "Lihat galeri foto kucing lucu kesayangan Virtus: Cupidut & Dudud!",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignore share abort
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-950/40 to-slate-900/90 border border-slate-800/80 p-6 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Album Resmi Kucing Kesayangan</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Galeri Fanbase Cupidut & Dudud 🐾
              </h1>

              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Koleksi foto eksklusif dua kucing gemas yang sering muncul menemani streaming live Bang Virtus.
                Kenali keimutan <strong className="text-slate-200">Cupidut</strong> si abu-abu anggun dan <strong className="text-amber-300">Dudud</strong> si oren belang aktif!
              </p>

              {/* Badges Info */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="font-semibold text-slate-300">Cupidut (Abu-abu)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {cupidutCount} Foto
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-semibold text-amber-300">Dudud (Oren Belang)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300">
                    {dududCount} Foto
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Beranda</span>
              </Link>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? "Tautan Disalin!" : "Bagikan"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-850 pb-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "ALL"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 ring-1 ring-violet-400/50"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              Semua Foto ({photos.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("CUPIDUT")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "CUPIDUT"
                  ? "bg-slate-200 text-slate-950 shadow-lg shadow-white/20 ring-1 ring-white/50"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Cupidut</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {cupidutCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("DUDUD")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "DUDUD"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 ring-1 ring-amber-400/50"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Dudud</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300">
                {dududCount}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/30" />
            <span>Klik foto untuk melihat ukuran penuh</span>
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-900/30 border border-dashed border-slate-850 rounded-3xl p-8 space-y-3">
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-500">
              <ImageIcon className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Belum Ada Foto</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Admin belum mengunggah foto untuk kategori ini. Foto terbaru yang diunggah akan langsung muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group cursor-pointer rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden hover:border-violet-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-600/10 flex flex-col"
              >
                {/* Image Container with native lazy loading & fallback */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-950">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badge Cat Type */}
                  <div className="absolute top-3 left-3">
                    {photo.catType === "CUPIDUT" ? (
                      <span className="px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700 text-[10px] font-extrabold text-slate-200 flex items-center gap-1.5 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Cupidut
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-950/90 backdrop-blur-md border border-amber-600/50 text-[10px] font-extrabold text-amber-300 flex items-center gap-1.5 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Dudud
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Text */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-1.5 bg-slate-950/40">
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-violet-300 transition-colors line-clamp-1">
                    {photo.title}
                  </h3>
                  {photo.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {photo.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal Detail Preview */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-h-full max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                title="Tutup Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border-t border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      selectedPhoto.catType === "CUPIDUT"
                        ? "bg-slate-800 border-slate-700 text-slate-300"
                        : "bg-amber-950 border-amber-700 text-amber-300"
                    }`}
                  >
                    {selectedPhoto.catType === "CUPIDUT" ? "Cupidut (Abu-abu)" : "Dudud (Oren Belang)"}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedPhoto.title}</h2>
                {selectedPhoto.description && (
                  <p className="text-xs text-slate-400">{selectedPhoto.description}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
