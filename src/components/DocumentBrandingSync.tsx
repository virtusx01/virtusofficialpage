"use client";

import { useEffect } from "react";
import {
  getCachedBranding,
  subscribeBrandingUpdate,
  applyDocumentBranding,
  setCachedBranding,
} from "@/lib/brandingCache";

export default function DocumentBrandingSync() {
  useEffect(() => {
    // Sinkronkan judul tab & icon favicon seketika dari cache lokal saat mount
    applyDocumentBranding();

    const unsubscribe = subscribeBrandingUpdate((branding) => {
      applyDocumentBranding(branding);
    });

    // Ambil data terbaru dari server di background dan perbarui cache jika ada perubahan
    const fetchLatest = async () => {
      try {
        const res = await fetch("/api/linktree", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            setCachedBranding({
              siteTitle: data.siteTitle,
              siteSubtitle: data.siteSubtitle,
              footerDesc: data.footerDesc,
              siteLogoUrl: data.siteLogoUrl,
              faviconUrl: data.faviconUrl,
            });
            applyDocumentBranding({
              siteTitle: data.siteTitle,
              siteSubtitle: data.siteSubtitle,
              faviconUrl: data.faviconUrl,
            });
          }
        }
      } catch {
        // Abaikan kegagalan jaringan saat background sync
      }
    };

    fetchLatest();

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}
