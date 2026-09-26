export interface SiteBranding {
  siteTitle: string;
  siteSubtitle: string;
  footerDesc?: string;
  siteLogoUrl?: string;
  faviconUrl?: string;
}

const STORAGE_KEY = "virtus_site_branding";
const UPDATE_EVENT = "virtus_branding_updated";

export function getCachedBranding(): SiteBranding | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
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
      siteLogoUrl: branding.siteLogoUrl !== undefined ? branding.siteLogoUrl : existing.siteLogoUrl,
      faviconUrl: branding.faviconUrl !== undefined ? branding.faviconUrl : existing.faviconUrl,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: merged }));
    applyDocumentBranding(merged);
  } catch {
    // Ignore localStorage errors
  }
}

export function applyDocumentBranding(branding?: Partial<SiteBranding> | null) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const current = branding || getCachedBranding();
  if (!current) return;

  // Update browser tab document title immediately
  if (current.siteTitle) {
    const subtitle = current.siteSubtitle ? ` - ${current.siteSubtitle}` : "";
    const fullTitle = `${current.siteTitle}${subtitle}`;
    if (document.title !== fullTitle) {
      document.title = fullTitle;
    }
  }

  // Update favicon icon links immediately across all existing rel tags
  if (current.faviconUrl) {
    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    if (existingIcons.length > 0) {
      existingIcons.forEach((el) => {
        const link = el as HTMLLinkElement;
        if (link.href !== current.faviconUrl) {
          link.href = current.faviconUrl!;
        }
      });
    } else {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = current.faviconUrl;
      document.head.appendChild(link);
    }
  }
}

export function subscribeBrandingUpdate(callback: (branding: SiteBranding) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<SiteBranding>;
    if (customEvent.detail) {
      callback(customEvent.detail);
      applyDocumentBranding(customEvent.detail);
    }
  };
  window.addEventListener(UPDATE_EVENT, handler);
  return () => {
    window.removeEventListener(UPDATE_EVENT, handler);
  };
}
