import React, { useState, useEffect, useRef, forwardRef } from 'react';

/* ─────────────────────────────────────────────────────
   Emotion config
───────────────────────────────────────────────────── */
const EMOTIONS = {
  idle: {
    label:  'Ready',
    colors: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'],
    glow:   'rgba(99,102,241,0.35)',
    speed:  12,
  },
  thinking: {
    label:  'Thinking…',
    colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#f97316'],
    glow:   'rgba(245,158,11,0.4)',
    speed:  6,
  },
  speaking: {
    label:  'Speaking',
    colors: ['#10b981', '#34d399', '#6ee7b7', '#059669'],
    glow:   'rgba(16,185,129,0.4)',
    speed:  4,
  },
  happy: {
    label:  'Happy',
    colors: ['#ec4899', '#f472b6', '#fb7185', '#a855f7'],
    glow:   'rgba(236,72,153,0.4)',
    speed:  8,
  },
  confirming: {
    label:  'Confirmed!',
    colors: ['#10b981', '#06b6d4', '#6366f1', '#34d399'],
    glow:   'rgba(16,185,129,0.5)',
    speed:  5,
  },
};

/* ─────────────────────────────────────────────────────
   Animated orb canvas
───────────────────────────────────────────────────── */
function OrbCanvas({ emotion, isSpeaking, isThinking, size = 220 }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const tRef      = useRef(0);
  const emo = EMOTIONS[emotion] || EMOTIONS.idle;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = size, H = size, R = size / 2;

    // Parse hex to rgb
    const hexToRgb = hex => {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      return { r, g, b };
    };

    // Interpolate two colors
    const lerpColor = (c1, c2, t) => {
      const a = hexToRgb(c1), b2 = hexToRgb(c2);
      return `rgb(${Math.round(a.r+(b2.r-a.r)*t)},${Math.round(a.g+(b2.g-a.g)*t)},${Math.round(a.b+(b2.b-a.b)*t)})`;
    };

    const draw = () => {
      tRef.current += 0.008 * (19 / emo.speed);
      const t = tRef.current;
      const colors = emo.colors;

      ctx.clearRect(0, 0, W, H);

      // Clip to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(R, R, R, 0, Math.PI * 2);
      ctx.clip();

      // Background base
      const bgGrad = ctx.createRadialGradient(R, R, 0, R, R, R);
      bgGrad.addColorStop(0, lerpColor(colors[0], colors[1], (Math.sin(t * 0.7) * 0.5 + 0.5)));
      bgGrad.addColorStop(0.5, lerpColor(colors[1], colors[2], (Math.sin(t * 0.5 + 1) * 0.5 + 0.5)));
      bgGrad.addColorStop(1, lerpColor(colors[2], colors[3], (Math.sin(t * 0.4 + 2) * 0.5 + 0.5)));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Fluid blobs (3 large blobs moving)
      const blobs = [
        { x: R + Math.sin(t * 1.1) * R * 0.45, y: R + Math.cos(t * 0.9) * R * 0.40, r: R * 0.65, ci: 0 },
        { x: R + Math.sin(t * 0.8 + 2) * R * 0.50, y: R + Math.cos(t * 1.2 + 1) * R * 0.45, r: R * 0.58, ci: 1 },
        { x: R + Math.sin(t * 1.3 + 4) * R * 0.40, y: R + Math.cos(t * 0.7 + 3) * R * 0.50, r: R * 0.52, ci: 2 },
      ];

      blobs.forEach(blob => {
        const g = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
        const c = hexToRgb(colors[blob.ci]);
        g.addColorStop(0,   `rgba(${c.r},${c.g},${c.b},0.55)`);
        g.addColorStop(0.5, `rgba(${c.r},${c.g},${c.b},0.25)`);
        g.addColorStop(1,   `rgba(${c.r},${c.g},${c.b},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // Voice wave ring overlay when speaking
      if (isSpeaking) {
        const waveRings = 4;
        for (let ring = 0; ring < waveRings; ring++) {
          const phase = t * 6 + ring * 0.8;
          const amp   = Math.sin(phase) * 0.04 * R;
          ctx.beginPath();
          ctx.arc(R, R, R * (0.55 + ring * 0.12) + amp, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${0.25 - ring * 0.04})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Thinking spiral overlay
      if (isThinking) {
        ctx.save();
        ctx.translate(R, R);
        ctx.rotate(t * 1.5);
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(0, 0, R * (0.4 + i * 0.12), 0, Math.PI * 1.3);
          ctx.strokeStyle = `rgba(255,255,255,${0.35 - i * 0.08})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Sheen (glass reflection at top-left)
      const sheenGrad = ctx.createRadialGradient(R * 0.5, R * 0.35, 0, R * 0.5, R * 0.35, R * 0.8);
      sheenGrad.addColorStop(0, 'rgba(255,255,255,0.28)');
      sheenGrad.addColorStop(0.4,'rgba(255,255,255,0.08)');
      sheenGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(0, 0, W, H);

      // Bottom glow (for depth)
      const bottomGrad = ctx.createRadialGradient(R, H * 1.1, 0, R, H * 1.1, R * 0.7);
      const bc = hexToRgb(colors[3]);
      bottomGrad.addColorStop(0, `rgba(${bc.r},${bc.g},${bc.b},0.3)`);
      bottomGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [emotion, isSpeaking, isThinking, size]);

  return (
    <canvas ref={canvasRef} width={size} height={size}
      style={{ borderRadius: '50%', display: 'block' }} />
  );
}

/* ─────────────────────────────────────────────────────
   Sound wave bars
───────────────────────────────────────────────────── */
export function SoundWave({ active, color = '#6366f1' }) {
  const bars = [3, 7, 13, 19, 24, 19, 13, 8, 14, 21, 15, 9, 17, 11, 4];
  return (
    <div className="flex items-center gap-[3px] h-8">
      {bars.map((h, i) => (
        <div key={i} className="rounded-full"
          style={{
            width: 3,
            height: active ? h : 3,
            background: color,
            opacity: active ? 0.75 : 0.18,
            transition: `height .1s, opacity .2s`,
            animation: active ? `soundWave ${0.35 + i * 0.06}s ease-in-out ${i * 0.04}s infinite alternate` : 'none',
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Main AvatarEngine export
───────────────────────────────────────────────────── */
const AvatarEngine = forwardRef(function AvatarEngine(
  { emotion = 'idle', isThinking = false, isSpeaking = false, caption = '' },
  ref
) {
  const emo = EMOTIONS[emotion] || EMOTIONS.idle;
  const primaryColor = emo.colors[0];

  return (
    <div className="flex flex-col items-center gap-4 select-none">

      {/* Orb wrapper with glow rings */}
      <div className="relative flex items-center justify-center">

        {/* Outer pulsing glow ring */}
        <div className="absolute rounded-full"
          style={{
            width: 260, height: 260,
            background: `radial-gradient(circle, ${emo.glow} 0%, transparent 68%)`,
            transition: 'background 0.7s ease',
            animation: 'glowPulse 2.5s ease-in-out infinite',
          }}
        />

        {/* Ripple rings when active */}
        {(isSpeaking || isThinking) && (
          <>
            {[0, 0.9, 1.8].map(delay => (
              <div key={delay} className="absolute rounded-full border"
                style={{
                  width: 270, height: 270,
                  borderColor: `${primaryColor}30`,
                  animation: `ripplePop 2.4s ease-out ${delay}s infinite`,
                }}
              />
            ))}
          </>
        )}

        {/* White border ring */}
        <div className="absolute rounded-full"
          style={{
            width: 228, height: 228,
            background: `conic-gradient(from ${Date.now() / 100}deg, ${emo.colors.join(', ')}, ${emo.colors[0]})`,
            animation: 'rotateBorder 8s linear infinite',
            opacity: 0.5,
          }}
        />
        <div className="absolute rounded-full bg-white" style={{ width: 222, height: 222 }} />

        {/* Canvas orb */}
        <div className="relative z-10 rounded-full overflow-hidden shadow-2xl"
          style={{
            boxShadow: `0 0 0 3px white, 0 8px 40px ${emo.glow}, 0 2px 10px rgba(0,0,0,0.1)`,
            transition: 'box-shadow 0.6s ease',
          }}>
          <OrbCanvas emotion={emotion} isSpeaking={isSpeaking} isThinking={isThinking} size={218} />
        </div>

        {/* Status pill */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-100 shadow-md"
          style={{ whiteSpace: 'nowrap' }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: primaryColor }} />
          <span className="text-[9px] font-bold uppercase tracking-wider"
            style={{ color: primaryColor }}>
            {emo.label}
          </span>
        </div>
      </div>

      {/* Sound wave */}
      <SoundWave active={isSpeaking} color={primaryColor} />

      {/* Caption bubble */}
      {caption && (
        <div className="max-w-[240px] text-center px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed"
          style={{
            background: `${primaryColor}08`,
            border: `1px solid ${primaryColor}18`,
            color: '#374151',
            animation: 'fadeSlideIn .3s ease forwards',
          }}>
          "{caption}"
        </div>
      )}

      <style>{`
        @keyframes glowPulse   { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes ripplePop   { 0%{transform:scale(.88);opacity:.7} 100%{transform:scale(1.25);opacity:0} }
        @keyframes rotateBorder{ from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes soundWave   { from{transform:scaleY(.35)} to{transform:scaleY(1)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanLine    { 0%{top:-5%} 100%{top:105%} }
      `}</style>
    </div>
  );
});

export default AvatarEngine;
export { EMOTIONS };
