"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Settings,
  Eye,
  EyeOff,
  X,
  Save,
  Copy,
  Check,
  RotateCcw,
  Bold,
  Italic,
  Palette,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Tv,
  Gamepad2
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Player {
  id: string;
  name: string;
  gameId: string;
  vipType: string;
  status: string;
  matchesPlayed: number;
  matchesTotal: number;
}

interface TextBerjalanConfig {
  text: string;
  showPlaying: boolean;
  direction: "rtl" | "ltr";
  speed: number;
  isFullWidth: boolean;
  width: number;
  height: number;
  verticalPos: number;
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  bold: boolean;
  italic: boolean;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  bgColor: string;
  bgOpacity: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  loopMode: "continuous" | "full";
  gap: number;
}

interface Props {
  initialPlayers: Player[];
  initialConfig: Record<string, unknown>;
}

// ── Defaults ───────────────────────────────────────────────────────────────
const DEFAULT_CONFIG: TextBerjalanConfig = {
  text: "Selamat Datang di Mabar VIP! || Gabung Mabar VIP sekarang via Sociabuzz || 🔥 ENJOY THE STREAM! 🔥",
  showPlaying: true,
  direction: "rtl",
  speed: 12,
  isFullWidth: true,
  width: 900,
  height: 60,
  verticalPos: 50,
  fontSize: 28,
  fontFamily: "Baloo 2",
  fontColor: "#ffffff",
  bold: true,
  italic: false,
  strokeEnabled: true,
  strokeColor: "#000000",
  strokeWidth: 2.5,
  bgColor: "#8b5cf6",
  bgOpacity: 80,
  borderRadius: 8,
  borderWidth: 0,
  borderColor: "#ffffff",
  loopMode: "continuous",
  gap: 120
};

const FONT_OPTIONS = [
  { value: "Baloo 2", label: "Baloo 2 (Bubbly)" },
  { value: "Passion One", label: "Passion One (Heavy)" },
  { value: "Inter", label: "Inter (Modern)" },
  { value: "Roboto", label: "Roboto (Clean)" },
  { value: "Montserrat", label: "Montserrat (Elegant)" },
  { value: "Poppins", label: "Poppins (Rounded)" },
  { value: "sans-serif", label: "Sans Serif" }
];

const LOCAL_STORAGE_KEY = "mabarvip_textBerjalanConfig_v1";

// ── Component ──────────────────────────────────────────────────────────────
export default function TextBerjalanClient({ initialPlayers, initialConfig }: Props) {
  const { data: session } = useSession();
  const isAdmin = session?.user && (session.user as any).role === "admin";

  // Initialize config: merge saved DB config over defaults
  const [config, setConfig] = useState<TextBerjalanConfig>(() => ({
    ...DEFAULT_CONFIG,
    ...(Object.keys(initialConfig).length > 0 ? (initialConfig as Partial<TextBerjalanConfig>) : {})
  }));

  // ── Player state: pre-populated from SSR data ──
  const [playingPlayers] = useState<Player[]>(initialPlayers);

  const [showEditor, setShowEditor] = useState(false);
  const [isGreenScreen, setIsGreenScreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Transparent body for OBS Browser Source ──
  useEffect(() => {
    const el = document.body;
    const html = document.documentElement;

    el.style.setProperty("background", "transparent", "important");
    el.style.setProperty("background-color", "transparent", "important");
    html.style.setProperty("background", "transparent", "important");
    html.style.setProperty("background-color", "transparent", "important");
    html.style.setProperty("overflow", "hidden", "important");

    return () => {
      el.style.removeProperty("background");
      el.style.removeProperty("background-color");
      html.style.removeProperty("background");
      html.style.removeProperty("background-color");
      html.style.removeProperty("overflow");
    };
  }, []);

  // ── Apply localStorage config override (client-side only) ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig(prev => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  // ── Helper: build display text ──
  const buildDisplayText = useCallback((players: Player[], cfg: TextBerjalanConfig): string => {
    const raw = cfg.text || DEFAULT_CONFIG.text;
    let playingStr: string;
    if (players.length > 0) {
      playingStr = "🎮 SEDANG BERMAIN: " + players.map(p => {
        const matchInfo = p.vipType === "PER_MATCH"
          ? ` (${p.matchesPlayed}/${p.matchesTotal} Match)`
          : " (End Live)";
        const idInfo = p.gameId ? ` [ID: ${p.gameId}]` : "";
        return `${p.name}${idInfo}${matchInfo}`;
      }).join(" • ");
    } else {
      playingStr = "🎮 SEDANG BERMAIN: Belum ada player di room saat ini";
    }
    if (raw.includes("{PLAYING_PLAYERS}")) return raw.replace(/{PLAYING_PLAYERS}/g, playingStr);
    if (cfg.showPlaying) return `${playingStr} || ${raw}`;
    return raw;
  }, []);

  // ── Poll versi ringan: cek satu angka dari server setiap 3 detik ──
  // Kalau versi berubah → reload. Bekerja sama di OBS, browser, HP, semua platform.
  useEffect(() => {
    let currentVersion = 0;
    let timer: ReturnType<typeof setInterval>;

    // Ambil versi awal dulu tanpa reload
    const initVersion = async () => {
      try {
        const res = await fetch("/api/players/version", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          currentVersion = data.version ?? 0;
        }
      } catch { /* silent */ }
    };

    const checkVersion = async () => {
      try {
        const res = await fetch("/api/players/version", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const newVersion = data.version ?? 0;
          if (currentVersion !== 0 && newVersion !== currentVersion) {
            window.location.reload();
          }
          currentVersion = newVersion;
        }
      } catch { /* silent */ }
    };

    initVersion().then(() => {
      timer = setInterval(checkVersion, 3000);
    });

    return () => clearInterval(timer);
  }, []);


  // ── Save / Reset / Copy URL ──
  const saveConfig = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
      await fetch("/api/textberjalan-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      setTimeout(() => setIsSaving(false), 600);
    } catch {
      setIsSaving(false);
      alert("Gagal menyimpan konfigurasi.");
    }
  };

  const resetConfig = async () => {
    if (window.confirm("Reset konfigurasi ke default?")) {
      setConfig(DEFAULT_CONFIG);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
      try {
        await fetch("/api/textberjalan-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(DEFAULT_CONFIG)
        });
      } catch {}
    }
  };

  const copyWidgetUrl = () => {
    try {
      const url = `${window.location.origin}/textberjalan`;
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      alert("Gagal menyalin URL.");
    }
  };

  // ── Helpers ──
  const getBgStyle = () => {
    if (config.bgOpacity === 0) return "transparent";
    let hex = config.bgColor.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    const alpha = Math.round(config.bgOpacity * 2.55).toString(16).padStart(2, "0");
    return `#${hex}${alpha}`;
  };

  // Display text computed from SSR-provided players (page reloads on any update via SSE)
  const displayText = buildDisplayText(playingPlayers, config);

  const duration = Math.max(1, 400 / config.speed);
  const strokeShadow = config.strokeEnabled
    ? `-${config.strokeWidth}px -${config.strokeWidth}px 0 ${config.strokeColor}, ${config.strokeWidth}px -${config.strokeWidth}px 0 ${config.strokeColor}, -${config.strokeWidth}px ${config.strokeWidth}px 0 ${config.strokeColor}, ${config.strokeWidth}px ${config.strokeWidth}px 0 ${config.strokeColor}`
    : "none";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: isGreenScreen ? "#00ff00" : "transparent",
        overflow: "hidden",
        fontFamily: "sans-serif"
      }}
    >
      {/* ── Animation keyframes + Google Fonts ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;700;800&family=Passion+One:wght@400;900&family=Inter:wght@400;600;800&family=Roboto:wght@400;700&family=Montserrat:wght@400;700&family=Poppins:wght@400;600;800&display=swap');

        @keyframes mqRTL {
          0%   { left: 100%; transform: translate3d(0, -50%, 0); }
          100% { left: 0%;   transform: translate3d(-100%, -50%, 0); }
        }
        @keyframes mqLTR {
          0%   { left: 0%;   transform: translate3d(-100%, -50%, 0); }
          100% { left: 100%; transform: translate3d(0, -50%, 0); }
        }
        @keyframes mqContRTL {
          0%   { transform: translate3d(0, -50%, 0); }
          100% { transform: translate3d(-33.3333%, -50%, 0); }
        }
        @keyframes mqContLTR {
          0%   { transform: translate3d(-33.3333%, -50%, 0); }
          100% { transform: translate3d(0, -50%, 0); }
        }

        .mq-rtl      { position:absolute; top:50%; will-change:transform,left; animation: mqRTL ${duration}s linear infinite; }
        .mq-ltr      { position:absolute; top:50%; will-change:transform,left; animation: mqLTR ${duration}s linear infinite; }
        .mq-cont-rtl { position:absolute; left:0; top:50%; display:flex; width:max-content; will-change:transform; animation: mqContRTL ${duration}s linear infinite; }
        .mq-cont-ltr { position:absolute; left:0; top:50%; display:flex; width:max-content; will-change:transform; animation: mqContLTR ${duration}s linear infinite; }
      ` }} />

      {/* ── Editor Controls Bar ── */}
      {showEditor && (
        <div style={{ position:"absolute", top:16, left:16, zIndex:50, display:"flex", alignItems:"center", gap:12,
          background:"rgba(2,6,23,0.85)", backdropFilter:"blur(12px)", padding:"12px 16px",
          borderRadius:16, border:"1px solid #1e293b", boxShadow:"0 25px 50px rgba(0,0,0,0.5)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#8b5cf6", animation:"ping 1s infinite" }} />
            <span style={{ fontSize:11, fontWeight:900, color:"#fff", textTransform:"uppercase", letterSpacing:"0.1em" }}>
              Mode Pengaturan
            </span>
          </div>
          <div style={{ width:1, height:24, background:"#1e293b" }} />
          <button onClick={() => setIsGreenScreen(!isGreenScreen)}
            style={{ padding:"6px 12px", borderRadius:10, fontSize:10, fontWeight:900, textTransform:"uppercase",
              background: isGreenScreen ? "#10b981" : "#0f172a", color: isGreenScreen ? "#000" : "#94a3b8",
              border: isGreenScreen ? "none" : "1px solid #1e293b", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
            <Tv size={12} /> Chroma Key
          </button>
          <button onClick={copyWidgetUrl}
            style={{ padding:"6px 12px", borderRadius:10, fontSize:10, fontWeight:900, textTransform:"uppercase",
              background:"#0f172a", color:"#94a3b8", border:"1px solid #1e293b", cursor:"pointer",
              display:"flex", alignItems:"center", gap:4 }}>
            {isCopied ? <Check size={12} style={{ color:"#10b981" }} /> : <Copy size={12} />}
            {isCopied ? "Tersalin!" : "Salin URL OBS"}
          </button>
        </div>
      )}

      {/* ── Marquee Container ── */}
      <div style={{
        position: "absolute",
        left: config.isFullWidth ? 0 : "50%",
        top: `${config.verticalPos}%`,
        transform: `translate(${config.isFullWidth ? "0px" : "-50%"}, -50%)`,
        width: config.isFullWidth ? "100%" : `${config.width}px`,
        height: `${config.height}px`,
        backgroundColor: getBgStyle(),
        borderRadius: `${config.borderRadius}px`,
        borderWidth: `${config.borderWidth}px`,
        borderColor: config.borderColor,
        borderStyle: config.borderWidth > 0 ? "solid" : "none",
        outline: showEditor ? "2px dashed #8b5cf680" : "none",
        outlineOffset: 4,
        overflow: "hidden",
      } as React.CSSProperties}>
        <div style={{ width:"100%", height:"100%", position:"relative" }}>
          {config.loopMode === "continuous" ? (
            <div
              key={`c-${config.direction}-${config.speed}-${config.fontSize}-${config.fontFamily}-${config.gap}`}
              className={config.direction === "rtl" ? "mq-cont-rtl" : "mq-cont-ltr"}
              style={{
                color: config.fontColor,
                fontSize: `${config.fontSize}px`,
                fontFamily: config.fontFamily,
                fontWeight: config.bold ? "bold" : "normal",
                fontStyle: config.italic ? "italic" : "normal",
                textShadow: strokeShadow,
                whiteSpace: "nowrap"
              }}
            >
              {/* Spans are static — SSE triggers full page reload on update */}
              <span style={{ paddingRight: `${config.gap}px` }}>{displayText}</span>
              <span style={{ paddingRight: `${config.gap}px` }} aria-hidden="true">{displayText}</span>
              <span style={{ paddingRight: `${config.gap}px` }} aria-hidden="true">{displayText}</span>
            </div>
          ) : (
            <div
              key={`f-${config.direction}-${config.speed}-${config.fontSize}-${config.fontFamily}`}
              className={config.direction === "rtl" ? "mq-rtl" : "mq-ltr"}
              style={{
                color: config.fontColor,
                fontSize: `${config.fontSize}px`,
                fontFamily: config.fontFamily,
                fontWeight: config.bold ? "bold" : "normal",
                fontStyle: config.italic ? "italic" : "normal",
                textShadow: strokeShadow,
                whiteSpace: "nowrap"
              }}
            >
              {/* Static span — SSE triggers full page reload on update */}
              <span>{displayText}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Settings Panel ── */}
      {showEditor && (
        <div style={{
          position:"absolute", right:0, top:0, bottom:0, width:400, zIndex:50,
          background:"rgba(2,6,23,0.92)", backdropFilter:"blur(20px)",
          borderLeft:"1px solid #1e293b", display:"flex", flexDirection:"column",
          boxShadow:"-25px 0 50px rgba(0,0,0,0.5)"
        }}>
          {/* Header */}
          <div style={{ padding:24, borderBottom:"1px solid #1e293b", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ padding:8, background:"rgba(139,92,246,0.2)", borderRadius:12 }}>
                <Settings size={18} style={{ color:"#a78bfa" }} />
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:900, color:"#fff", textTransform:"uppercase", letterSpacing:"0.05em" }}>Pengaturan Widget</div>
                <div style={{ fontSize:10, color:"#64748b" }}>Kustomisasi teks berjalan</div>
              </div>
            </div>
            <button onClick={() => setShowEditor(false)}
              style={{ padding:6, background:"transparent", border:"none", color:"#64748b", cursor:"pointer", borderRadius:8 }}>
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Form */}
          <div style={{ flex:1, overflowY:"auto", padding:24, display:"flex", flexDirection:"column", gap:20 }}>

            {/* Show Playing Toggle */}
            <div style={{ background:"rgba(15,23,42,0.6)", border:"1px solid #1e293b", borderRadius:20, padding:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Gamepad2 size={14} style={{ color:"#a78bfa" }} />
                  <span style={{ fontSize:10, fontWeight:900, color:"#a78bfa", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                    Tampilkan Player Playing
                  </span>
                </div>
                <button onClick={() => setConfig(p => ({ ...p, showPlaying: !p.showPlaying }))}
                  style={{ width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s",
                    background: config.showPlaying ? "#7c3aed" : "#1e293b" }}>
                  <div style={{ position:"absolute", top:4, width:16, height:16, background:"#fff", borderRadius:"50%", transition:"transform 0.2s",
                    transform: `translateX(${config.showPlaying ? 24 : 4}px)` }} />
                </button>
              </div>
              <div style={{ fontSize:9, color:"#475569", marginTop:8 }}>
                Aktifkan untuk menggunakan tag {"{PLAYING_PLAYERS}"} di teks.
              </div>
              {/* Player count debug indicator */}
              <div style={{ fontSize:9, color: playingPlayers.length > 0 ? "#10b981" : "#f59e0b", marginTop:4, fontWeight:700 }}>
                ● {playingPlayers.length} player sedang bermain (update tiap 3s)
              </div>
            </div>

            {/* Custom Text with Tag Buttons */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:9, fontWeight:900, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.1em" }}>Isi Teks Berjalan</span>
                <span style={{ fontSize:8, color:"#a78bfa" }}>Klik tag untuk menambah</span>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button
                  onClick={() => setConfig(p => ({ ...p, text: p.text ? `${p.text} {PLAYING_PLAYERS}` : "{PLAYING_PLAYERS}" }))}
                  style={{ padding:"6px 12px", background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.4)",
                    color:"#c4b5fd", borderRadius:10, fontSize:10, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                  <Gamepad2 size={12} /> + Tag Player Playing
                </button>
              </div>
              <textarea
                value={config.text}
                onChange={e => setConfig(p => ({ ...p, text: e.target.value }))}
                style={{ width:"100%", background:"rgba(15,23,42,0.6)", border:"1px solid #1e293b", borderRadius:12, padding:16,
                  color:"#fff", fontSize:12, minHeight:100, resize:"none", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}
                placeholder="Contoh: Selamat Datang! || {PLAYING_PLAYERS} || Enjoy!"
              />
            </div>

            {/* Position & Size */}
            <div style={{ background:"rgba(15,23,42,0.6)", border:"1px solid #1e293b", borderRadius:20, padding:20, display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ fontSize:10, fontWeight:900, color:"#a78bfa", textTransform:"uppercase", display:"flex", alignItems:"center", gap:6 }}>
                <Sliders size={12} /> Posisi & Ukuran Frame
              </div>
              {/* Full width toggle */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Lebar Penuh</span>
                <button onClick={() => setConfig(p => ({ ...p, isFullWidth: !p.isFullWidth }))}
                  style={{ width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", position:"relative",
                    background: config.isFullWidth ? "#7c3aed" : "#1e293b" }}>
                  <div style={{ position:"absolute", top:4, width:16, height:16, background:"#fff", borderRadius:"50%", transition:"transform 0.2s",
                    transform: `translateX(${config.isFullWidth ? 24 : 4}px)` }} />
                </button>
              </div>
              {!config.isFullWidth && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Lebar Frame</span>
                    <span style={{ fontSize:10, fontFamily:"monospace", fontWeight:700, color:"#fff" }}>{config.width}px</span>
                  </div>
                  <input type="range" min="300" max="1920" step="10" value={config.width}
                    onChange={e => setConfig(p => ({ ...p, width: +e.target.value }))}
                    style={{ width:"100%", accentColor:"#7c3aed" }} />
                </div>
              )}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Tinggi Frame</span>
                  <span style={{ fontSize:10, fontFamily:"monospace", fontWeight:700, color:"#fff" }}>{config.height}px</span>
                </div>
                <input type="range" min="30" max="200" step="2" value={config.height}
                  onChange={e => setConfig(p => ({ ...p, height: +e.target.value }))}
                  style={{ width:"100%", accentColor:"#7c3aed" }} />
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Posisi Vertikal</span>
                  <span style={{ fontSize:10, fontFamily:"monospace", fontWeight:700, color:"#fff" }}>{config.verticalPos}%</span>
                </div>
                <input type="range" min="0" max="100" value={config.verticalPos}
                  onChange={e => setConfig(p => ({ ...p, verticalPos: +e.target.value }))}
                  style={{ width:"100%", accentColor:"#7c3aed" }} />
              </div>
            </div>

            {/* Direction & Speed */}
            <div style={{ background:"rgba(15,23,42,0.6)", border:"1px solid #1e293b", borderRadius:20, padding:20, display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ fontSize:10, fontWeight:900, color:"#a78bfa", textTransform:"uppercase", display:"flex", alignItems:"center", gap:6 }}>
                <Sliders size={12} /> Arah & Kecepatan
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, padding:4, background:"rgba(2,6,23,0.5)", borderRadius:12, border:"1px solid #1e293b" }}>
                {[["rtl","← Kanan ke Kiri"], ["ltr","Kiri ke Kanan →"]].map(([val, label]) => (
                  <button key={val} onClick={() => setConfig(p => ({ ...p, direction: val as "rtl"|"ltr" }))}
                    style={{ padding:"10px 0", borderRadius:10, border: config.direction === val ? "1px solid #334155" : "none",
                      background: config.direction === val ? "#1e293b" : "transparent",
                      color: config.direction === val ? "#fff" : "#64748b", fontSize:10, fontWeight:900, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                    {val === "rtl" ? <ArrowLeft size={12} /> : <ArrowRight size={12} />} {label}
                  </button>
                ))}
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Kecepatan ({config.speed})</span>
                  <span style={{ fontSize:8, background:"rgba(139,92,246,0.2)", color:"#c4b5fd", padding:"2px 8px", borderRadius:6, fontWeight:900 }}>
                    {config.speed < 10 ? "Lambat" : config.speed > 25 ? "Cepat" : "Sedang"}
                  </span>
                </div>
                <input type="range" min="1" max="50" value={config.speed}
                  onChange={e => setConfig(p => ({ ...p, speed: +e.target.value }))}
                  style={{ width:"100%", accentColor:"#7c3aed" }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, padding:4, background:"rgba(2,6,23,0.5)", borderRadius:12, border:"1px solid #1e293b" }}>
                {[["continuous","Loop Menerus"], ["full","Tunggu Habis"]].map(([val, label]) => (
                  <button key={val} onClick={() => setConfig(p => ({ ...p, loopMode: val as "continuous"|"full" }))}
                    style={{ padding:"8px 0", borderRadius:10, border:"none",
                      background: config.loopMode === val ? "#7c3aed" : "transparent",
                      color: config.loopMode === val ? "#fff" : "#64748b", fontSize:10, fontWeight:900, cursor:"pointer" }}>
                    {label}
                  </button>
                ))}
              </div>
              {config.loopMode === "continuous" && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Gap Antar Teks</span>
                    <span style={{ fontSize:10, fontFamily:"monospace", fontWeight:700, color:"#fff" }}>{config.gap}px</span>
                  </div>
                  <input type="range" min="20" max="400" step="10" value={config.gap}
                    onChange={e => setConfig(p => ({ ...p, gap: +e.target.value }))}
                    style={{ width:"100%", accentColor:"#7c3aed" }} />
                </div>
              )}
            </div>

            {/* Typography */}
            <div style={{ background:"rgba(15,23,42,0.6)", border:"1px solid #1e293b", borderRadius:20, padding:20, display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ fontSize:10, fontWeight:900, color:"#a78bfa", textTransform:"uppercase", display:"flex", alignItems:"center", gap:6 }}>
                <Bold size={12} /> Tipografi
              </div>
              <select value={config.fontFamily} onChange={e => setConfig(p => ({ ...p, fontFamily: e.target.value }))}
                style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, padding:"8px 12px", color:"#fff", fontSize:12 }}>
                {FONT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Ukuran Huruf</span>
                  <span style={{ fontSize:10, fontFamily:"monospace", fontWeight:700, color:"#fff" }}>{config.fontSize}px</span>
                </div>
                <input type="range" min="12" max="120" value={config.fontSize}
                  onChange={e => setConfig(p => ({ ...p, fontSize: +e.target.value }))}
                  style={{ width:"100%", accentColor:"#7c3aed" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Warna Teks</span>
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"#0f172a", padding:"6px 12px", borderRadius:10, border:"1px solid #1e293b" }}>
                  <span style={{ fontSize:10, fontFamily:"monospace", color:"#64748b" }}>{config.fontColor.toUpperCase()}</span>
                  <input type="color" value={config.fontColor} onChange={e => setConfig(p => ({ ...p, fontColor: e.target.value }))}
                    style={{ width:28, height:24, border:"none", background:"transparent", cursor:"pointer" }} />
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[["bold","B","Bold"],["italic","I","Italic"]].map(([key, sym, label]) => (
                  <button key={key} onClick={() => setConfig(p => ({ ...p, [key]: !p[key as keyof TextBerjalanConfig] }))}
                    style={{ padding:"8px 0", borderRadius:10, fontSize:12, fontWeight:900,
                      background: config[key as keyof TextBerjalanConfig] ? "rgba(139,92,246,0.15)" : "#0f172a",
                      border: config[key as keyof TextBerjalanConfig] ? "1px solid rgba(139,92,246,0.4)" : "1px solid #1e293b",
                      color: config[key as keyof TextBerjalanConfig] ? "#a78bfa" : "#64748b", cursor:"pointer",
                      fontStyle: key === "italic" ? "italic" : "normal" }}>
                    {sym} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stroke */}
            <div style={{ background:"rgba(15,23,42,0.6)", border:"1px solid #1e293b", borderRadius:20, padding:20, display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:10, fontWeight:900, color:"#a78bfa", textTransform:"uppercase" }}>Outline Teks (Stroke)</span>
                <button onClick={() => setConfig(p => ({ ...p, strokeEnabled: !p.strokeEnabled }))}
                  style={{ width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", position:"relative",
                    background: config.strokeEnabled ? "#7c3aed" : "#1e293b" }}>
                  <div style={{ position:"absolute", top:4, width:16, height:16, background:"#fff", borderRadius:"50%", transition:"transform 0.2s",
                    transform: `translateX(${config.strokeEnabled ? 24 : 4}px)` }} />
                </button>
              </div>
              {config.strokeEnabled && (
                <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12, borderTop:"1px solid #1e293b" }}>
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Tebal Stroke</span>
                      <span style={{ fontSize:10, fontFamily:"monospace", fontWeight:700, color:"#fff" }}>{config.strokeWidth}px</span>
                    </div>
                    <input type="range" min="0.5" max="10" step="0.5" value={config.strokeWidth}
                      onChange={e => setConfig(p => ({ ...p, strokeWidth: +e.target.value }))}
                      style={{ width:"100%", accentColor:"#7c3aed" }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Warna Stroke</span>
                    <div style={{ display:"flex", alignItems:"center", gap:8, background:"#0f172a", padding:"6px 12px", borderRadius:10, border:"1px solid #1e293b" }}>
                      <span style={{ fontSize:10, fontFamily:"monospace", color:"#64748b" }}>{config.strokeColor.toUpperCase()}</span>
                      <input type="color" value={config.strokeColor} onChange={e => setConfig(p => ({ ...p, strokeColor: e.target.value }))}
                        style={{ width:28, height:24, border:"none", background:"transparent", cursor:"pointer" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Background & Frame */}
            <div style={{ background:"rgba(15,23,42,0.6)", border:"1px solid #1e293b", borderRadius:20, padding:20, display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ fontSize:10, fontWeight:900, color:"#a78bfa", textTransform:"uppercase", display:"flex", alignItems:"center", gap:6 }}>
                <Palette size={12} /> Background & Frame
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Warna Latar</span>
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"#0f172a", padding:"6px 12px", borderRadius:10, border:"1px solid #1e293b" }}>
                  <span style={{ fontSize:10, fontFamily:"monospace", color:"#64748b" }}>{config.bgColor.toUpperCase()}</span>
                  <input type="color" value={config.bgColor} onChange={e => setConfig(p => ({ ...p, bgColor: e.target.value }))}
                    style={{ width:28, height:24, border:"none", background:"transparent", cursor:"pointer" }} />
                </div>
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Transparansi Latar</span>
                  <span style={{ fontSize:10, fontFamily:"monospace", fontWeight:700, color:"#fff" }}>{config.bgOpacity}%</span>
                </div>
                <input type="range" min="0" max="100" step="5" value={config.bgOpacity}
                  onChange={e => setConfig(p => ({ ...p, bgOpacity: +e.target.value }))}
                  style={{ width:"100%", accentColor:"#7c3aed" }} />
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Sudut Frame (Radius)</span>
                  <span style={{ fontSize:10, fontFamily:"monospace", fontWeight:700, color:"#fff" }}>{config.borderRadius}px</span>
                </div>
                <input type="range" min="0" max="60" value={config.borderRadius}
                  onChange={e => setConfig(p => ({ ...p, borderRadius: +e.target.value }))}
                  style={{ width:"100%", accentColor:"#7c3aed" }} />
              </div>
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Tebal Border Frame</span>
                  <span style={{ fontSize:10, fontFamily:"monospace", fontWeight:700, color:"#fff" }}>{config.borderWidth}px</span>
                </div>
                <input type="range" min="0" max="10" value={config.borderWidth}
                  onChange={e => setConfig(p => ({ ...p, borderWidth: +e.target.value }))}
                  style={{ width:"100%", accentColor:"#7c3aed" }} />
              </div>
              {config.borderWidth > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:9, fontWeight:700, color:"#64748b", textTransform:"uppercase" }}>Warna Border</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8, background:"#0f172a", padding:"6px 12px", borderRadius:10, border:"1px solid #1e293b" }}>
                    <span style={{ fontSize:10, fontFamily:"monospace", color:"#64748b" }}>{config.borderColor.toUpperCase()}</span>
                    <input type="color" value={config.borderColor} onChange={e => setConfig(p => ({ ...p, borderColor: e.target.value }))}
                      style={{ width:28, height:24, border:"none", background:"transparent", cursor:"pointer" }} />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer Actions */}
          <div style={{ padding:24, borderTop:"1px solid #1e293b", background:"rgba(2,6,23,0.8)", display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <button onClick={resetConfig}
              style={{ padding:12, background:"#0f172a", border:"1px solid #1e293b", color:"#64748b", borderRadius:16, fontSize:10, fontWeight:900, textTransform:"uppercase", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
              <RotateCcw size={12} /> Reset
            </button>
            <button onClick={saveConfig}
              style={{ padding:12, background:"#7c3aed", border:"none", color:"#fff", borderRadius:16, fontSize:10, fontWeight:900, textTransform:"uppercase", cursor:"pointer", boxShadow:"0 10px 25px rgba(124,58,237,0.3)", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
              <Save size={12} /> {isSaving ? "Disimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      )}

      {/* ── Toggle Editor Button (Hanya Tampil Jika Login Admin) ── */}
      {isAdmin && (
        <button
          onClick={() => setShowEditor(s => !s)}
          style={{
            position:"fixed", bottom:24, right:24, padding:16, borderRadius:"50%",
            background:"rgba(2,6,23,0.6)", border:"1px solid #1e293b", color:"#fff",
            backdropFilter:"blur(12px)", cursor:"pointer", zIndex:200,
            opacity: showEditor ? 1 : 0.6, transition:"all 0.3s",
            boxShadow:"0 10px 25px rgba(0,0,0,0.4)"
          }}
          title="Toggle Pengaturan (Admin)"
        >
          {showEditor ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      )}
    </div>
  );
}
