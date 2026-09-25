'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

export interface VideoAdItem {
  id?: string;
  title?: string;
  videoUrl: string;
  targetUrl?: string;
  chromaEnable?: boolean;
  chromaColor?: string;
  chromaSimilarity?: number;
  chromaSmoothness?: number;
  isEnabled?: boolean;
  orderIndex?: number;
}

interface ChromaVideoAdProps {
  ads?: VideoAdItem[];
  // Legacy single ad fallbacks
  videoUrl?: string;
  targetUrl?: string;
  chromaEnable?: boolean;
  chromaColor?: string;
  chromaSimilarity?: number;
  chromaSmoothness?: number;
  // Responsive Widths
  widthDesktop?: number;
  widthMobile?: number;
  width?: number; // legacy fallback
  // Position & Layout
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom' | string;
  offsetX?: number;
  offsetY?: number;
  zIndex?: number;
  previewMode?: boolean;
}

// Convert Hex string (#00FF00) to RGB [0-255, 0-255, 0-255]
function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = (hex || '#00FF00').replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return [0, 255, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export const ChromaVideoAd: React.FC<ChromaVideoAdProps> = ({
  ads,
  videoUrl = '',
  targetUrl = '',
  chromaEnable = true,
  chromaColor = '#00FF00',
  chromaSimilarity = 0.35,
  chromaSmoothness = 0.1,
  widthDesktop = 180,
  widthMobile = 120,
  width = 180,
  position = 'bottom-right',
  offsetX = 20,
  offsetY = 20,
  zIndex = 50,
  previewMode = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate active width based on device screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const activeWidth = isMobile ? (widthMobile || 120) : (widthDesktop || width || 180);

  // Normalize active ads array
  const activeAdsList: VideoAdItem[] = React.useMemo(() => {
    if (ads && ads.length > 0) {
      const enabled = ads.filter((a) => (a.isEnabled ?? true) && a.videoUrl);
      if (enabled.length > 0) return enabled;
    }
    if (videoUrl) {
      return [
        {
          videoUrl,
          targetUrl,
          chromaEnable,
          chromaColor,
          chromaSimilarity,
          chromaSmoothness,
          isEnabled: true,
        },
      ];
    }
    return [];
  }, [ads, videoUrl, targetUrl, chromaEnable, chromaColor, chromaSimilarity, chromaSmoothness]);

  // Current active video item in loop
  const currentAd = activeAdsList[currentAdIndex % (activeAdsList.length || 1)];
  const currentVideoUrl = currentAd?.videoUrl || '';
  const currentTargetUrl = currentAd?.targetUrl ?? targetUrl;
  const currentChromaEnable = currentAd?.chromaEnable ?? chromaEnable;
  const currentChromaColor = currentAd?.chromaColor ?? chromaColor;
  const currentChromaSimilarity = currentAd?.chromaSimilarity ?? chromaSimilarity;
  const currentChromaSmoothness = currentAd?.chromaSmoothness ?? chromaSmoothness;

  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({
    width: activeWidth,
    height: Math.round((activeWidth * 16) / 9),
  });

  // Setup Canvas & Frame Rendering Process Loop
  useEffect(() => {
    if (!currentVideoUrl || isDismissed) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animationFrameId: number;
    const keyRgb = hexToRgb(currentChromaColor);

    const processFrame = () => {
      if (video.paused || video.ended) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      const vW = video.videoWidth || 300;
      const vH = video.videoHeight || 300;

      // Calculate aspect ratio height
      const targetHeight = Math.round((activeWidth * vH) / vW);
      if (canvas.width !== activeWidth || canvas.height !== targetHeight) {
        canvas.width = activeWidth;
        canvas.height = targetHeight;
        setVideoDimensions({ width: activeWidth, height: targetHeight });
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, activeWidth, targetHeight);

        if (currentChromaEnable) {
          const imgData = ctx.getImageData(0, 0, activeWidth, targetHeight);
          const data = imgData.data;
          const len = data.length;

          const [keyR, keyG, keyB] = keyRgb;
          const maxDist = 441.673; // sqrt(255^2 * 3)
          const simDist = currentChromaSimilarity * maxDist;
          const smoothDist = currentChromaSmoothness * maxDist;

          for (let i = 0; i < len; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const rDiff = r - keyR;
            const gDiff = g - keyG;
            const bDiff = b - keyB;
            const dist = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);

            if (dist < simDist) {
              data[i + 3] = 0; // Transparent
            } else if (dist < simDist + smoothDist && smoothDist > 0) {
              const alphaRatio = (dist - simDist) / smoothDist;
              data[i + 3] = Math.round(alphaRatio * 255);
            }
          }

          ctx.putImageData(imgData, 0, 0);
        }
      }

      animationFrameId = requestAnimationFrame(processFrame);
    };

    const handlePlay = () => {
      setErrorMsg(null);
      animationFrameId = requestAnimationFrame(processFrame);
    };

    const handleEnded = () => {
      if (activeAdsList.length > 1) {
        setCurrentAdIndex((prev) => (prev + 1) % activeAdsList.length);
      } else {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    const handleError = () => {
      setErrorMsg('Gagal memuat video MP4');
      // If error occurs and multiple ads exist, jump to next ad after 2 seconds
      if (activeAdsList.length > 1) {
        setTimeout(() => {
          setCurrentAdIndex((prev) => (prev + 1) % activeAdsList.length);
        }, 2000);
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    video.muted = true;
    video.play().catch(() => {
      const handleUserInteraction = () => {
        video.play().catch(() => {});
        window.removeEventListener('touchstart', handleUserInteraction);
        window.removeEventListener('click', handleUserInteraction);
      };
      window.addEventListener('touchstart', handleUserInteraction);
      window.addEventListener('click', handleUserInteraction);
    });

    if (!video.paused) {
      handlePlay();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (video) {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('error', handleError);
      }
    };
  }, [
    currentVideoUrl,
    currentChromaEnable,
    currentChromaColor,
    currentChromaSimilarity,
    currentChromaSmoothness,
    activeWidth,
    isDismissed,
    activeAdsList.length,
  ]);

  // Auto Close 1-Hour Frequency Check
  useEffect(() => {
    if (previewMode) return;
    try {
      const dismissedAt = localStorage.getItem('chroma_ad_dismissed_at');
      if (dismissedAt) {
        const lastDismissedTime = parseInt(dismissedAt, 10);
        const ONE_HOUR_MS = 60 * 60 * 1000;
        if (Date.now() - lastDismissedTime < ONE_HOUR_MS) {
          setIsDismissed(true);
        } else {
          localStorage.removeItem('chroma_ad_dismissed_at');
        }
      }
    } catch {
      // Ignore localStorage errors (safari private mode fallback)
    }
  }, [previewMode]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDismissed(true);
    if (!previewMode) {
      try {
        localStorage.setItem('chroma_ad_dismissed_at', Date.now().toString());
      } catch {
        // Ignore localStorage errors
      }
    }
  };

  // Helper to generate WebM fallback URL from MP4 path if available
  const getWebmUrl = (url: string) => {
    if (!url) return '';
    if (url.endsWith('.mp4')) {
      return url.substring(0, url.lastIndexOf('.')) + '.webm';
    }
    return '';
  };

  if (!currentVideoUrl || isDismissed || activeAdsList.length === 0) return null;

  // Position Styles calculation
  const getPositionStyle = (): React.CSSProperties => {
    if (previewMode) {
      return {
        position: 'relative',
        width: `${activeWidth}px`,
        height: `${videoDimensions.height}px`,
      };
    }

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: zIndex,
      width: `${activeWidth}px`,
      height: `${videoDimensions.height}px`,
    };

    switch (position) {
      case 'top-left':
        style.top = `${offsetY}px`;
        style.left = `${offsetX}px`;
        break;
      case 'top-right':
        style.top = `${offsetY}px`;
        style.right = `${offsetX}px`;
        break;
      case 'bottom-left':
        style.bottom = `${offsetY}px`;
        style.left = `${offsetX}px`;
        break;
      case 'bottom-right':
      default:
        style.bottom = `${offsetY}px`;
        style.right = `${offsetX}px`;
        break;
    }

    return style;
  };

  const adContent = (
    <div className="relative group select-none pointer-events-auto w-full h-full">
      {/* Canvas Element for 60fps Chroma Key Video Rendering */}
      <canvas
        ref={canvasRef}
        width={activeWidth}
        height={videoDimensions.height}
        className="block rounded-lg drop-shadow-2xl transition-transform duration-200 group-hover:scale-105 cursor-pointer"
        style={{
          width: `${activeWidth}px`,
          height: `${videoDimensions.height}px`,
        }}
      />

      {/* Hidden Video Source Element */}
      <video
        ref={videoRef}
        key={currentVideoUrl} // Remount video element on URL change for smooth transition
        autoPlay
        muted
        loop={activeAdsList.length <= 1}
        playsInline
        webkit-playsinline="true"
        crossOrigin="anonymous"
        className="hidden"
      >
        {getWebmUrl(currentVideoUrl) && (
          <source src={getWebmUrl(currentVideoUrl)} type="video/webm" />
        )}
        <source src={currentVideoUrl} type={currentVideoUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
      </video>

      {/* Target Link Icon Indicator */}
      {currentTargetUrl && !previewMode && (
        <div className="absolute bottom-1 right-1 bg-black/60 text-white/90 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm text-[10px] flex items-center gap-1 z-10">
          <ExternalLink size={10} />
          <span>Buka</span>
        </div>
      )}

      {/* Error notification */}
      {errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-950/80 text-red-200 text-xs p-2 text-center rounded-lg z-10">
          {errorMsg}
        </div>
      )}
    </div>
  );

  return (
    <div style={getPositionStyle()} className="transition-all duration-300 relative">
      {/* FIXED POSITION CLOSE BUTTON: Positioned consistently at top-right of wrapper */}
      {!previewMode && (
        <button
          onClick={handleDismiss}
          className="absolute -top-2.5 -right-2.5 bg-black/80 hover:bg-red-600 text-white rounded-full p-1.5 shadow-xl border border-white/20 backdrop-blur-md opacity-90 hover:opacity-100 transition-all z-30 cursor-pointer"
          title="Tutup Iklan"
          aria-label="Tutup Iklan"
        >
          <X size={14} />
        </button>
      )}

      {currentTargetUrl ? (
        <a
          href={currentTargetUrl}
          target={currentTargetUrl.startsWith('http') ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          {adContent}
        </a>
      ) : (
        adContent
      )}
    </div>
  );
};
