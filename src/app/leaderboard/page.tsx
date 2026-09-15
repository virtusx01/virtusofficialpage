import React from "react";
import { SociabuzzLeaderboard } from "@/components/SociabuzzLeaderboard";

export const metadata = {
  title: "Top 10 Supporters Leaderboard - MabarVIP",
  description: "Live Top 10 Supporters Leaderboard powered by Sociabuzz",
};

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 flex flex-col items-center justify-center relative">
      <div className="w-full max-w-4xl mx-auto mb-8 text-center space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
          HALL OF FAME
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
          Penghargaan khusus untuk Top 10 Supporter paling dermawan. Terima kasih atas dukungan luar biasa kalian!
        </p>
      </div>

      <SociabuzzLeaderboard tribeId="8913094574" />
    </main>
  );
}
