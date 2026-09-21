'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface ChromaVideoAdProps {
  videoUrl: string;
  targetUrl?: string;
  chromaEnable?: boolean;
  chromaColor?: string; // hex like #00FF00
  chromaSimilarity?: number; // 0.05 to 0.8
  chromaSmoothness?: number; // 0.0 to 0.3
  width?: number; // in px
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom' | string;
  offsetX?: number;
  offsetY?: number;
  zIndex?: number;
  previewMode?: boolean;
}

// Convert Hex string (#00FF00) to RGB [0-255, 0-255, 0-255]
function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return [0, 255, 0]; // default green
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export const ChromaVideoAd: React.FC<ChromaVideoAdProps> = ({
  videoUrl,
  targetUrl = '',
  chromaEnable = true,
  chromaColor = '#00FF00',
  chromaSimilarity = 0.35,
  chromaSmoothness = 0.1,
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
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({
    width: width,
    height: Math.round((width * 16) / 9),
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Setup Canvas and Video Processing loop
  useEffect(() => {
    if (!videoUrl || isDismissed) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animationFrameId: number;
    const keyRgb = hexToRgb(chromaColor);

    const processFrame = () => {
      if (video.paused || video.ended) {
        animationFrameId = requestAnimationFrame(processFrame);
        return;
      }

      const vW = video.videoWidth || 300;
      const vH = video.videoHeight || 300;
      
      // Calculate aspect ratio height
      const targetHeight = Math.round((width * vH) / vW);
      if (canvas.width !== width || canvas.height !== targetHeight) {
        canvas.width = width;
        canvas.height = targetHeight;
        setVideoDimensions({ width, height: targetHeight });
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, targetHeight);

        if (chromaEnable) {
          const imgData = ctx.getImageData(0, 0, width, targetHeight);
          const data = imgData.data;
          const len = data.length;

          const [keyR, keyG, keyB] = keyRgb;
          // Maximum RGB distance is sqrt(255^2 * 3) ~ 441.673
          const maxDist = 441.673;
          const simDist = chromaSimilarity * maxDist;
          const smoothDist = chromaSmoothness * maxDist;

          for (let i = 0; i < len; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Euclidean distance in RGB color space
            const rDiff = r - keyR;
            const gDiff = g - keyG;
            const bDiff = b - keyB;
            const dist = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);

            if (dist < simDist) {
              data[i + 3] = 0; // Completely transparent
            } else if (dist < simDist + smoothDist && smoothDist > 0) {
              // Smooth edge feathering
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

    const handleError = () => {
      setErrorMsg('Gagal memuat video MP4');
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('error', handleError);

    // Attempt to play video
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
        video.removeEventListener('error', handleError);
      }
    };
  }, [videoUrl, chromaEnable, chromaColor, chromaSimilarity, chromaSmoothness, width, isDismissed]);

  if (!videoUrl || isDismissed) return null;

  // Position Styles calculation
  const getPositionStyle = (): React.CSSProperties => {
    if (previewMode) {
      return {
        position: 'relative',
        width: `${width}px`,
        height: `${videoDimensions.height}px`,
      };
    }

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: zIndex,
      width: `${width}px`,
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
    <div className="relative group select-none pointer-events-auto">
      {/* Canvas Element for 60fps Chroma Key Video Rendering */}
      <canvas
        ref={canvasRef}
        width={width}
        height={videoDimensions.height}
        className="block rounded-lg drop-shadow-2xl transition-transform duration-200 group-hover:scale-105 cursor-pointer"
        style={{
          width: `${width}px`,
          height: `${videoDimensions.height}px`,
        }}
      />

      {/* Hidden Video Source Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* Close button overlay */}
      {!previewMode && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="absolute -top-2 -right-2 bg-black/75 hover:bg-red-600 text-white rounded-full p-1 shadow-lg backdrop-blur-md opacity-80 hover:opacity-100 transition-all z-20"
          title="Tutup Iklan"
        >
          <X size={14} />
        </button>
      )}

      {/* Target Link Icon Indicator */}
      {targetUrl && !previewMode && (
        <div className="absolute bottom-1 right-1 bg-black/60 text-white/90 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm text-[10px] flex items-center gap-1">
          <ExternalLink size={10} />
          <span>Buka</span>
        </div>
      )}

      {errorMsg && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-950/80 text-red-200 text-xs p-2 text-center rounded-lg">
          {errorMsg}
        </div>
      )}
    </div>
  );

  return (
    <div style={getPositionStyle()} className="transition-all duration-300">
      {targetUrl ? (
        <a
          href={targetUrl}
          target={targetUrl.startsWith('http') ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="block"
        >
          {adContent}
        </a>
      ) : (
        adContent
      )}
    </div>
  );
};
