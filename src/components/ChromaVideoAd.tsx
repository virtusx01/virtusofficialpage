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
  widthDesktop?: number;
  widthMobile?: number;
  position?: string;
  offsetX?: number;
  offsetY?: number;
  zIndex?: number;
  isEnabled?: boolean;
}

interface ChromaVideoAdProps {
  ads?: VideoAdItem[];
  // Backwards compatibility single ad props
  videoUrl?: string;
  targetUrl?: string;
  chromaEnable?: boolean;
  chromaColor?: string;
  chromaSimilarity?: number;
  chromaSmoothness?: number;
  width?: number;
  widthDesktop?: number;
  widthMobile?: number;
  position?: string;
  offsetX?: number;
  offsetY?: number;
  zIndex?: number;
  previewMode?: boolean;
  previewIndex?: number;
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
  ads = [],
  videoUrl = '',
  targetUrl = '',
  chromaEnable = true,
  chromaColor = '#00FF00',
  chromaSimilarity = 0.35,
  chromaSmoothness = 0.1,
  width,
  widthDesktop = 200,
  widthMobile = 130,
  position = 'bottom-right',
  offsetX = 20,
  offsetY = 20,
  zIndex = 50,
  previewMode = false,
  previewIndex,
}) => {
  // Normalize ads list (support playlist array or single fallback prop)
  const normalizedAds: VideoAdItem[] = React.useMemo(() => {
    if (ads && ads.length > 0) {
      return ads.filter((ad) => ad.isEnabled !== false && ad.videoUrl);
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
          widthDesktop: widthDesktop || width || 180,
          widthMobile: widthMobile || 130,
          position,
          offsetX,
          offsetY,
          zIndex,
          isEnabled: true,
        },
      ];
    }
    return [];
  }, [
    ads,
    videoUrl,
    targetUrl,
    chromaEnable,
    chromaColor,
    chromaSimilarity,
    chromaSmoothness,
    width,
    widthDesktop,
    widthMobile,
    position,
    offsetX,
    offsetY,
    zIndex,
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({
    width: 180,
    height: 240,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync preview index if forced in admin
  useEffect(() => {
    if (previewIndex !== undefined && previewIndex >= 0 && previewIndex < normalizedAds.length) {
      setCurrentIndex(previewIndex);
    }
  }, [previewIndex, normalizedAds.length]);

  // Handle responsive viewport detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentAd: VideoAdItem | undefined = normalizedAds[currentIndex];

  // Calculate effective responsive width
  const currentWidth = React.useMemo(() => {
    if (!currentAd) return 180;
    if (isMobile) {
      return currentAd.widthMobile || 130;
    }
    return currentAd.widthDesktop || 200;
  }, [currentAd, isMobile]);

  // Advance to next video in playlist
  const advanceNextAd = React.useCallback(() => {
    if (normalizedAds.length <= 1) {
      // Loop same video
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % normalizedAds.length);
  }, [normalizedAds.length]);

  // Setup Canvas and Video Processing loop per frame
  useEffect(() => {
    if (!currentAd || !currentAd.videoUrl || isDismissed) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animationFrameId: number;
    const keyRgb = hexToRgb(currentAd.chromaColor || '#00FF00');

    const processFrame = () => {
      if (video.paused || video.ended) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      const vW = video.videoWidth || 300;
      const vH = video.videoHeight || 300;

      const targetHeight = Math.round((currentWidth * vH) / vW);
      if (canvas.width !== currentWidth || canvas.height !== targetHeight) {
        canvas.width = currentWidth;
        canvas.height = targetHeight;
        setVideoDimensions({ width: currentWidth, height: targetHeight });
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, currentWidth, targetHeight);

        if (currentAd.chromaEnable ?? true) {
          const imgData = ctx.getImageData(0, 0, currentWidth, targetHeight);
          const data = imgData.data;
          const len = data.length;

          const [keyR, keyG, keyB] = keyRgb;
          const maxDist = 441.673;
          const simDist = (currentAd.chromaSimilarity ?? 0.35) * maxDist;
          const smoothDist = (currentAd.chromaSmoothness ?? 0.1) * maxDist;

          for (let i = 0; i < len; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const rDiff = r - keyR;
            const gDiff = g - keyG;
            const bDiff = b - keyB;
            const dist = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);

            if (dist < simDist) {
              data[i + 3] = 0; // Fully transparent
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
      advanceNextAd();
    };

    const handleError = () => {
      setErrorMsg('Gagal memuat video MP4');
      // If error, try next video after 3s delay
      const timer = setTimeout(() => {
        advanceNextAd();
      }, 3000);
      return () => clearTimeout(timer);
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
    currentAd,
    currentWidth,
    isDismissed,
    advanceNextAd,
  ]);

  if (!currentAd || !currentAd.videoUrl || isDismissed) return null;

  // Calculate position styles
  const getPositionStyle = (): React.CSSProperties => {
    if (previewMode) {
      return {
        position: 'relative',
        width: `${currentWidth}px`,
        height: `${videoDimensions.height}px`,
      };
    }

    const pos = currentAd.position || position || 'bottom-right';
    const offX = currentAd.offsetX ?? offsetX ?? 20;
    const offY = currentAd.offsetY ?? offsetY ?? 20;
    const zInd = currentAd.zIndex ?? zIndex ?? 50;

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: zInd,
      width: `${currentWidth}px`,
      height: `${videoDimensions.height}px`,
    };

    switch (pos) {
      case 'top-left':
        style.top = `${offY}px`;
        style.left = `${offX}px`;
        break;
      case 'top-right':
        style.top = `${offY}px`;
        style.right = `${offX}px`;
        break;
      case 'bottom-left':
        style.bottom = `${offY}px`;
        style.left = `${offX}px`;
        break;
      case 'bottom-right':
      default:
        style.bottom = `${offY}px`;
        style.right = `${offX}px`;
        break;
    }

    return style;
  };

  return (
    <div
      style={getPositionStyle()}
      className="transition-all duration-300 pointer-events-auto select-none group"
    >
      {/* Outer Wrapper Container */}
      <div className="relative w-full h-full">
        {/* Fixed Close Button (X) - Position is LOCKED on top-right of wrapper */}
        {!previewMode && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-2xl backdrop-blur-md opacity-90 hover:opacity-100 transition-all z-50 cursor-pointer border-2 border-slate-900"
            title="Tutup Iklan Video"
          >
            <X size={14} className="stroke-[3]" />
          </button>
        )}

        {/* Video Canvas & Link Content */}
        {currentAd.targetUrl ? (
          <a
            href={currentAd.targetUrl}
            target={currentAd.targetUrl.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="block w-full h-full"
          >
            <div className="relative w-full h-full">
              <canvas
                ref={canvasRef}
                width={currentWidth}
                height={videoDimensions.height}
                className="block rounded-lg drop-shadow-2xl transition-transform duration-200 group-hover:scale-105 cursor-pointer"
                style={{
                  width: `${currentWidth}px`,
                  height: `${videoDimensions.height}px`,
                }}
              />
              <div className="absolute bottom-1 right-1 bg-black/60 text-white/90 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm text-[10px] flex items-center gap-1 z-10">
                <ExternalLink size={10} />
                <span>Buka</span>
              </div>
            </div>
          </a>
        ) : (
          <div className="relative w-full h-full">
            <canvas
              ref={canvasRef}
              width={currentWidth}
              height={videoDimensions.height}
              className="block rounded-lg drop-shadow-2xl"
              style={{
                width: `${currentWidth}px`,
                height: `${videoDimensions.height}px`,
              }}
            />
          </div>
        )}

        {/* Hidden Video Source */}
        <video
          key={currentAd.videoUrl + currentIndex}
          ref={videoRef}
          src={currentAd.videoUrl}
          autoPlay
          muted
          playsInline
          crossOrigin="anonymous"
          className="hidden"
        />

        {errorMsg && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-950/90 text-red-200 text-xs p-2 text-center rounded-lg border border-red-500/30">
            {errorMsg}
          </div>
        )}

        {/* Playlist Indicator Dots (If multiple ads) */}
        {normalizedAds.length > 1 && !previewMode && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800 backdrop-blur-md z-30">
            {normalizedAds.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-3 bg-purple-400' : 'w-1.5 bg-slate-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
