/**
 * timerHelpers.ts
 * Utility for parsing and formatting PER_HOUR timer state.
 * Timer state can be stored in player.notes with a special tag: [TIMER:status:timestampOrRemaining:totalSeconds]
 * or calculated based on matchesTotal (in hours) / matchesPlayed.
 */

export interface ParsedTimer {
  cleanNotes: string;
  isRunning: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  totalSeconds: number;
}

export function parsePlayerTimer(notes: string = "", totalHours: number = 1, playedHours: number = 0): ParsedTimer {
  const remainingHours = Math.max(0, totalHours - playedHours);
  const defaultTotalSeconds = remainingHours * 3600;
  
  // Format tag: [TIMER:status:timestampOrRemaining:totalSeconds]
  // status: "RUNNING" | "PAUSED" | "STOPPED"
  const timerMatch = notes.match(/\[TIMER:(RUNNING|PAUSED|STOPPED):(-?\d+):(\d+)\]/);

  if (!timerMatch) {
    return {
      cleanNotes: notes.replace(/\[TIMER:[^\]]+\]/g, "").trim(),
      isRunning: false,
      isPaused: false,
      remainingSeconds: defaultTotalSeconds,
      totalSeconds: defaultTotalSeconds,
    };
  }

  const [, status, valStr, totalStr] = timerMatch;
  const storedTotal = parseInt(totalStr, 10);
  const total = storedTotal > 0 ? storedTotal : defaultTotalSeconds;
  const val = parseInt(valStr, 10) || 0;
  const cleanNotes = notes.replace(/\[TIMER:[^\]]+\]/g, "").trim();

  if (status === "RUNNING") {
    const startTimestamp = val;
    const now = Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((now - startTimestamp) / 1000));
    const remainingSeconds = Math.max(0, total - elapsedSeconds);
    return {
      cleanNotes,
      isRunning: remainingSeconds > 0,
      isPaused: false,
      remainingSeconds,
      totalSeconds: total,
    };
  } else if (status === "PAUSED") {
    const remaining = Math.min(val, total);
    return {
      cleanNotes,
      isRunning: false,
      isPaused: true,
      remainingSeconds: Math.max(0, remaining),
      totalSeconds: total,
    };
  } else {
    return {
      cleanNotes,
      isRunning: false,
      isPaused: false,
      remainingSeconds: defaultTotalSeconds,
      totalSeconds: defaultTotalSeconds,
    };
  }
}

export function encodeTimerTag(status: "RUNNING" | "PAUSED" | "STOPPED", value: number, totalSeconds: number): string {
  return `[TIMER:${status}:${value}:${totalSeconds}]`;
}

export function updateNotesWithTimer(notes: string = "", status: "RUNNING" | "PAUSED" | "STOPPED", value: number, totalSeconds: number): string {
  const clean = notes.replace(/\[TIMER:[^\]]+\]/g, "").trim();
  const tag = encodeTimerTag(status, value, totalSeconds);
  return clean ? `${clean} ${tag}` : tag;
}

export function formatRemainingTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return "00:00:00 (Waktu Habis)";
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours} Jam ${minutes} Menit ${pad(seconds)} Detik`;
  }
  return `${minutes} Menit ${pad(seconds)} Detik`;
}

export function formatCompactTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return "00:00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
