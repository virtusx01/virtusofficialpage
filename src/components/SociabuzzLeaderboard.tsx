"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Flame, Award, HeartHandshake, Trophy, Star, Sparkles, Gem, Gamepad2 } from "lucide-react";

export interface Supporter {
  rank: number;
  name: string;
  amount: number;
  formattedAmount: string;
}

interface SociabuzzLeaderboardProps {
  tribeId?: string;
  leaderboardUrl?: string;
  title?: string;
  displayMode?: "top3" | "top10";
  headerIcon?: string; // "trophy" | "crown" | "flame" | "star" | "sparkles" | "diamond" | "gamepad" | "none"
  headerColor?: string; // Hex color e.g. "#34d399" or empty
  headerFont?: string; // "sans" | "mono" | "serif"
  headerSize?: string; // "lg" | "xl" | "2xl" | "3xl"
}

export const SociabuzzLeaderboard: React.FC<SociabuzzLeaderboardProps> = ({
  tribeId = "8913094574",
  leaderboardUrl = "https://sociabuzz.com/pro/tribe/topleaderboard/v2/8913094574",
  title = "TOP SUPPORTERS BULAN INI",
  displayMode = "top10",
  headerIcon = "trophy",
  headerColor = "",
  headerFont = "sans",
  headerSize = "2xl",
}) => {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      const endpoint = leaderboardUrl && leaderboardUrl.trim()
        ? `/api/sociabuzz/leaderboard?url=${encodeURIComponent(leaderboardUrl.trim())}`
        : `/api/sociabuzz/leaderboard?id=${tribeId}`;

      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success && Array.isArray(data.supporters)) {
        setSupporters(data.supporters);
        setError(null);
      } else {
        setError(data.error || "Gagal memuat data leaderboard.");
      }
    } catch (err: any) {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetches ONLY ONCE on mount as requested (no background polling/auto-refresh interval)
    fetchLeaderboard();
  }, [tribeId, leaderboardUrl]);

  const rank1 = supporters.find((s) => s.rank === 1);
  const rank2 = supporters.find((s) => s.rank === 2);
  const rank3 = supporters.find((s) => s.rank === 3);
  const restSupporters = supporters.filter((s) => s.rank > 3);

  const maxAmount = rank1?.amount || 1;
  const isTop3Only = displayMode === "top3";

  // Header Icon component/emoji renderer
  const renderHeaderIcon = () => {
    switch (headerIcon) {
      case "crown":
        return <Crown className="w-6 h-6 text-amber-400 inline shrink-0" />;
      case "flame":
        return <Flame className="w-6 h-6 text-orange-400 inline shrink-0" />;
      case "star":
        return <Star className="w-6 h-6 text-yellow-300 inline shrink-0" />;
      case "sparkles":
        return <Sparkles className="w-6 h-6 text-amber-300 inline shrink-0 animate-pulse" />;
      case "diamond":
        return <Gem className="w-6 h-6 text-cyan-300 inline shrink-0" />;
      case "gamepad":
        return <Gamepad2 className="w-6 h-6 text-emerald-400 inline shrink-0" />;
      case "none":
        return null;
      case "trophy":
      default:
        return <Trophy className="w-6 h-6 text-emerald-400 inline shrink-0" />;
    }
  };

  // Font family mapping
  const fontClass =
    headerFont === "mono"
      ? "font-mono"
      : headerFont === "serif"
      ? "font-serif"
      : "font-sans";

  // Size mapping
  const sizeClass =
    headerSize === "lg"
      ? "text-lg sm:text-xl"
      : headerSize === "xl"
      ? "text-xl sm:text-2xl"
      : headerSize === "3xl"
      ? "text-2xl sm:text-4xl"
      : "text-xl sm:text-3xl"; // 2xl default

  return (
    <div className={`w-full ${isTop3Only ? "max-w-2xl" : "max-w-4xl"} mx-auto text-white bg-transparent font-sans transition-all`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2
          style={headerColor ? { color: headerColor } : {}}
          className={`${sizeClass} ${fontClass} font-black tracking-wider ${
            !headerColor
              ? "bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent"
              : ""
          } inline-flex items-center justify-center gap-2.5`}
        >
          {renderHeaderIcon()}
          <span>{title}</span>
        </h2>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-xs font-medium">Memuat top supporters...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-rose-400 bg-rose-950/20 border border-rose-800/30 rounded-2xl p-4">
          <p className="font-semibold text-xs">{error}</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Section */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-2 pb-2">
            {/* Rank 2 (Silver) */}
            <div className="flex flex-col items-center">
              {rank2 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="relative mb-2">
                    <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 p-0.5 shadow-lg shadow-slate-400/20 flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-base sm:text-lg font-bold text-slate-200 uppercase">
                        {rank2.name.substring(0, 2)}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-100 flex items-center gap-1 shadow">
                      <Award className="w-3 h-3" /> #2
                    </div>
                  </div>
                  <div className="text-center mt-2.5 w-full">
                    <p className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[90px] sm:max-w-[130px] mx-auto">
                      {rank2.name}
                    </p>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-400">
                      Rp {rank2.formattedAmount}
                    </p>
                  </div>
                  <div className="w-full h-20 sm:h-24 mt-2.5 bg-gradient-to-b from-slate-800/80 to-slate-900/40 border-t-2 border-slate-400 rounded-t-xl flex items-center justify-center text-slate-500 font-extrabold text-xl sm:text-2xl">
                    2
                  </div>
                </motion.div>
              ) : (
                <div className="text-xs text-slate-600">-</div>
              )}
            </div>

            {/* Rank 1 (Gold) */}
            <div className="flex flex-col items-center">
              {rank1 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="relative mb-2">
                    <Crown className="w-6 h-6 text-amber-400 absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce" />
                    <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-200 p-1 shadow-xl shadow-amber-500/30 flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-lg sm:text-xl font-black text-amber-300 uppercase">
                        {rank1.name.substring(0, 2)}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 shadow-md">
                      <Flame className="w-3 h-3 fill-slate-950" /> #1
                    </div>
                  </div>
                  <div className="text-center mt-2.5 w-full">
                    <p className="text-xs sm:text-sm font-black text-amber-300 truncate max-w-[110px] sm:max-w-[150px] mx-auto">
                      {rank1.name}
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-amber-400/90">
                      Rp {rank1.formattedAmount}
                    </p>
                  </div>
                  <div className="w-full h-28 sm:h-32 mt-2.5 bg-gradient-to-b from-amber-500/20 via-slate-800/80 to-slate-900/40 border-t-2 border-amber-400 rounded-t-xl flex items-center justify-center text-amber-400 font-extrabold text-2xl sm:text-3xl shadow-lg shadow-amber-500/10">
                    1
                  </div>
                </motion.div>
              ) : (
                <div className="text-xs text-slate-600">-</div>
              )}
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="flex flex-col items-center">
              {rank3 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="relative mb-2">
                    <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 p-0.5 shadow-lg shadow-amber-700/20 flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-base sm:text-lg font-bold text-amber-600 uppercase">
                        {rank3.name.substring(0, 2)}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-100 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-600 flex items-center gap-1 shadow">
                      <Award className="w-3 h-3" /> #3
                    </div>
                  </div>
                  <div className="text-center mt-2.5 w-full">
                    <p className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[90px] sm:max-w-[130px] mx-auto">
                      {rank3.name}
                    </p>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-400">
                      Rp {rank3.formattedAmount}
                    </p>
                  </div>
                  <div className="w-full h-16 sm:h-20 mt-2.5 bg-gradient-to-b from-slate-800/80 to-slate-900/40 border-t-2 border-amber-700 rounded-t-xl flex items-center justify-center text-slate-500 font-extrabold text-xl sm:text-2xl">
                    3
                  </div>
                </motion.div>
              ) : (
                <div className="text-xs text-slate-600">-</div>
              )}
            </div>
          </div>

          {/* Supporters List (Rank 4 to 10) - ONLY shown if displayMode is "top10" */}
          {!isTop3Only && restSupporters.length > 0 && (
            <div className="space-y-2.5 mt-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-3 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                Supporter Peringkat 4 - 10
              </h3>

              <AnimatePresence>
                {restSupporters.map((item, index) => {
                  const percentage = Math.min(
                    100,
                    Math.max(10, Math.round((item.amount / maxAmount) * 100))
                  );

                  return (
                    <motion.div
                      key={item.rank}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/30 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-4 transition shadow-sm overflow-hidden"
                    >
                      {/* Background Progress Bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-all duration-500 rounded-2xl"
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="flex items-center gap-3 sm:gap-4 z-10">
                        <span className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-xs font-extrabold text-slate-300 group-hover:border-emerald-500/40 group-hover:text-emerald-400 transition">
                          #{item.rank}
                        </span>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition">
                            {item.name}
                          </p>
                        </div>
                      </div>

                      <div className="text-right z-10">
                        <p className="text-xs sm:text-sm font-extrabold text-emerald-400">
                          Rp {item.formattedAmount}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
};
