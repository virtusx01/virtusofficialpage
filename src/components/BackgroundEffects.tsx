'use client';

import React, { useEffect, useRef } from 'react';

interface BackgroundEffectsProps {
  bgImageUrl?: string;
  bgDarkness?: number; // 0 to 90 %
  bgBlur?: number; // 0 to 20 px
  bgEffect?: 'none' | 'particles' | 'ambient-glow' | 'cyber-rain' | 'aurora' | 'cyber-grid' | string;
  bgEffectSpeed?: 'slow' | 'normal' | 'fast' | string;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({
  bgImageUrl = '',
  bgDarkness = 40,
  bgBlur = 0,
  bgEffect = 'none',
  bgEffectSpeed = 'normal',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Speed multiplier
  const speedMult = bgEffectSpeed === 'slow' ? 0.5 : bgEffectSpeed === 'fast' ? 2 : 1;

  // Lightweight HTML5 Canvas for Particles or Cyber Rain
  useEffect(() => {
    if (bgEffect !== 'particles' && bgEffect !== 'cyber-rain') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles Setup
    const numParticles = Math.min(Math.floor(width / 25), 45); // Lightweight particle density based on screen size
    const particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; alpha: number }> = [];

    if (bgEffect === 'particles') {
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4 * speedMult,
          vy: (Math.random() - 0.5) * 0.4 * speedMult,
          radius: Math.random() * 1.8 + 0.6,
          alpha: Math.random() * 0.6 + 0.2,
        });
      }
    }

    // Cyber Rain Drops Setup
    const columns = Math.floor(width / 30);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (bgEffect === 'particles') {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`; // Cyan/Violet floating glow
          ctx.fill();
        }
      } else if (bgEffect === 'cyber-rain') {
        ctx.fillStyle = 'rgba(14, 165, 233, 0.4)'; // Cyan digital drops
        ctx.font = '12px monospace';

        for (let i = 0; i < drops.length; i++) {
          const text = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));
          const x = i * 30;
          const y = drops[i] * 20;

          ctx.fillText(text, x, y);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i] += 0.5 * speedMult;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [bgEffect, speedMult]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Custom Image Layer */}
      {bgImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url('${bgImageUrl}')`,
            filter: bgBlur > 0 ? `blur(${bgBlur}px)` : 'none',
            transform: bgBlur > 0 ? 'scale(1.05)' : 'none', // Prevent blurred white edges
          }}
        />
      )}

      {/* 2. Darkness Dimmer Overlay */}
      {bgDarkness > 0 && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundColor: 'black',
            opacity: bgDarkness / 100,
          }}
        />
      )}

      {/* 3. Ambient Glow Pulse Effect */}
      {bgEffect === 'ambient-glow' && (
        <div className="absolute inset-0 opacity-40">
          <div
            className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/40 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: bgEffectSpeed === 'fast' ? '3s' : '6s' }}
          />
          <div
            className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/40 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: bgEffectSpeed === 'fast' ? '4s' : '8s', animationDelay: '1s' }}
          />
        </div>
      )}

      {/* 4. Aurora Motion Glow */}
      {bgEffect === 'aurora' && (
        <div
          className="absolute inset-0 opacity-35 mix-blend-screen bg-gradient-to-tr from-fuchsia-600/30 via-indigo-600/20 to-cyan-500/30 animate-pulse"
          style={{ animationDuration: bgEffectSpeed === 'fast' ? '4s' : '8s' }}
        />
      )}

      {/* 5. Cyber Retro Grid Overlay */}
      {bgEffect === 'cyber-grid' && (
        <div
          className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]"
        />
      )}

      {/* 6. Canvas for Floating Particles / Cyber Rain */}
      {(bgEffect === 'particles' || bgEffect === 'cyber-rain') && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
      )}
    </div>
  );
};
