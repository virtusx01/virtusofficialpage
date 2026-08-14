"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sparkles, Cat, Heart, Image as ImageIcon, Loader2, Sparkle } from "lucide-react";

interface CatPhoto {
  id: string;
  catType: "CUPIDUT" | "DUDUD";
  title: string;
  description: string;
  imageUrl: string;
  orderIndex: number;
}

export default function FanbaseCupidutDududPage() {
  const [photos, setPhotos] = useState<CatPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "CUPIDUT" | "DUDUD">("ALL");
  const [selectedPhoto, setSelectedPhoto] = useState<CatPhoto | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch("/api/fanbase-cat");
        if (res.ok) {
          const data = await res.json();
          setPhotos(data.photos || []);
        }
      } catch (err) {
        console.error("Failed to load fanbase cat photos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const filteredPhotos = photos.filter((p) => {
    if (activeTab === "CUPIDUT") return p.catType === "CUPIDUT";
    if (activeTab === "DUDUD") return p.catType === "DUDUD";
    return true;
  });

  const cupidutCount = photos.filter((p) => p.catType === "CUPIDUT").length;
  const dududCount = photos.filter((p) => p.catType === "DUDUD").length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8">
        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 border border-slate-800/80 p-6 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 h-64 w-64 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-64 w-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-bold uppercase tracking-wider">
                <Cat className="w-4 h-4" />
                <span>Cupidut & Dudud</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-fuchsia-200 to-amber-200 bg-clip-text text-transparent">
                Fanbase Cupidut & Dudud
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Galeri album cupidut & dudud.{" "}
                <span className="text-slate-300 font-semibold">Cupidut</span> si kucing abu-abu yang cantik dan{" "}
                <span className="text-amber-400 font-semibold">Dudud</span> si kucing oren yang super sigma!
              </p>

              {/* Badges / Stats */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="font-semibold text-slate-300">Cupidut</span>
                  <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {cupidutCount} Foto
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-semibold text-amber-300">Dudud</span>
                  <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300">
                    {dududCount} Foto
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-900 pb-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "ALL"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
            >
              Semua Foto ({photos.length})
            </button>

            <button
              onClick={() => setActiveTab("CUPIDUT")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "CUPIDUT"
                ? "bg-slate-200 text-slate-950 shadow-lg shadow-white/10"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Cupidut</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">{cupidutCount}</span>
            </button>

            <button
              onClick={() => setActiveTab("DUDUD")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === "DUDUD"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Dudud</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300">{dududCount}</span>
            </button>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-3" />
            <p className="text-xs">Memuat galeri album Cupidut & Dudud...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-900/30 border border-dashed border-slate-850 rounded-3xl p-8">
            <ImageIcon className="w-12 h-12 text-slate-700 mb-3" />
            <h3 className="text-base font-bold text-slate-300">Belum Ada Foto</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Admin belum mengunggah foto untuk kategori ini. Foto terbaru akan muncul di sini!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group cursor-pointer rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-600/10 flex flex-col"
              >
                {/* Image Wrapper */}
                <div className="relative aspect-square overflow-hidden bg-slate-950">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Badge Cat Type */}
                  <div className="absolute top-3 left-3">
                    {photo.catType === "CUPIDUT" ? (
                      <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[10px] font-extrabold text-slate-200 flex items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Cupidut
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-950/90 backdrop-blur-md border border-amber-600/50 text-[10px] font-extrabold text-amber-300 flex items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Dudud
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Text */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-1">
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

      {/* Lightbox / Modal Detail Preview */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
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
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border-t border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${selectedPhoto.catType === "CUPIDUT"
                      ? "bg-slate-800 border-slate-700 text-slate-300"
                      : "bg-amber-950 border-amber-700 text-amber-300"
                      }`}
                  >
                    {selectedPhoto.catType === "CUPIDUT" ? "Cupidut" : "Dudud"}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedPhoto.title}</h2>
                {selectedPhoto.description && (
                  <p className="text-xs text-slate-400 mt-1">{selectedPhoto.description}</p>
                )}
              </div>

              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer shrink-0"
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
