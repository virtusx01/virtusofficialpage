export interface SiteBranding {
  siteTitle: string;
  siteSubtitle: string;
  footerDesc?: string;
}

const STORAGE_KEY = "virtus_site_branding";
const UPDATE_EVENT = "virtus_branding_updated";

export function getCachedBranding(): SiteBranding | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.siteTitle === "string") {
      return parsed;
    }
  } catch {
    // Ignore JSON parse errors
  }
  return null;
}

export function setCachedBranding(branding: Partial<SiteBranding>) {
  if (typeof window === "undefined") return;
  try {
    const existing = getCachedBranding() || { siteTitle: "", siteSubtitle: "" };
    const merged: SiteBranding = {
      siteTitle: branding.siteTitle !== undefined ? branding.siteTitle : existing.siteTitle,
      siteSubtitle: branding.siteSubtitle !== undefined ? branding.siteSubtitle : existing.siteSubtitle,
      footerDesc: branding.footerDesc !== undefined ? branding.footerDesc : existing.footerDesc,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: merged }));
  } catch {
    // Ignore localStorage errors
  }
}

export function subscribeBrandingUpdate(callback: (branding: SiteBranding) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<SiteBranding>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };
  window.addEventListener(UPDATE_EVENT, handler);
  return () => {
    window.removeEventListener(UPDATE_EVENT, handler);
  };
}
