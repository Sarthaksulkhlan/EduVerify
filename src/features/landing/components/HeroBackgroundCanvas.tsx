import React, { useEffect, useRef } from 'react';

interface ColorOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface LedgerNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  phase: number;
  rgb: string;
}

export const HeroBackgroundCanvas: React.FC<{
  className?: string;
  tone?: 'hero' | 'section';
}> = ({ className = '', tone = 'hero' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Multi-color Emerald, Sovereign Gold & Crimson-Garnet live light fields
    const orbs: ColorOrb[] = [
      {
        x: width * 0.16,
        y: height * 0.26,
        vx: 0.28,
        vy: 0.18,
        radius: Math.max(width, height) * 0.38,
        color: tone === 'hero' ? 'rgba(20, 83, 45, 0.20)' : 'rgba(20, 83, 45, 0.13)', // Deep Emerald
      },
      {
        x: width * 0.54,
        y: height * 0.44,
        vx: -0.24,
        vy: 0.2,
        radius: Math.max(width, height) * 0.42,
        color: tone === 'hero' ? 'rgba(184, 137, 56, 0.22)' : 'rgba(184, 137, 56, 0.15)', // Sovereign Gold
      },
      {
        x: width * 0.84,
        y: height * 0.72,
        vx: -0.2,
        vy: -0.18,
        radius: Math.max(width, height) * 0.36,
        color: tone === 'hero' ? 'rgba(153, 27, 27, 0.16)' : 'rgba(153, 27, 27, 0.11)', // Crimson-Garnet
      },
    ];

    const paletteRgb = [
      '21, 128, 61', // Emerald
      '184, 137, 56', // Sovereign Gold
      '153, 27, 27', // Crimson-Garnet
    ];

    const nodeCount = Math.min(38, Math.max(20, Math.floor((width * height) / 36000)));
    const nodes: LedgerNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0.04 : 0.42),
        vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0.04 : 0.42),
        radius: Math.random() * 2.1 + 1.4,
        alpha: Math.random() * 0.45 + 0.3,
        pulseSpeed: Math.random() * 0.0035 + 0.002,
        phase: Math.random() * Math.PI * 2,
        rgb: paletteRgb[i % paletteRgb.length],
      });
    }

    let wavePhase1 = 0;
    let wavePhase2 = 1.9;
    let wavePhase3 = 3.7;
    let packetProgress = 0;
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(time - lastTime, 64);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Drifting Emerald, Gold, and Crimson Aurora Orbs
      for (const orb of orbs) {
        if (!prefersReducedMotion) {
          orb.x += orb.vx * (delta / 16);
          orb.y += orb.vy * (delta / 16);
          if (orb.x < 0 || orb.x > width) orb.vx *= -1;
          if (orb.y < 0 || orb.y > height) orb.vy *= -1;
        }
        const grad = ctx.createRadialGradient(orb.x, orb.y, 12, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(250, 247, 240, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Flowing Multi-Color Graded Ledger Ribbons + Gliding Telemetry Packets
      if (!prefersReducedMotion) {
        wavePhase1 += 0.00095 * delta;
        wavePhase2 -= 0.00075 * delta;
        wavePhase3 += 0.0011 * delta;
        packetProgress = (packetProgress + 0.00035 * delta) % 1;
      }

      const drawGradedRibbon = (
        yRatio: number,
        amp: number,
        wl: number,
        ph: number,
        strokeColor: string,
        packetRgb: string,
        packetOffset: number
      ) => {
        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.6;
        const baseY = height * yRatio;
        for (let x = 0; x <= width; x += 10) {
          const y =
            baseY +
            Math.sin(x / wl + ph) * amp +
            Math.cos(x / (wl * 0.6) - ph * 0.7) * (amp * 0.42);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw gliding telemetry pulse packet along the ribbon
        const px = ((packetProgress + packetOffset) % 1) * width;
        const py =
          baseY +
          Math.sin(px / wl + ph) * amp +
          Math.cos(px / (wl * 0.6) - ph * 0.7) * (amp * 0.42);

        const packetGlow = ctx.createRadialGradient(px, py, 1, px, py, 16);
        packetGlow.addColorStop(0, `rgba(${packetRgb}, 0.65)`);
        packetGlow.addColorStop(1, `rgba(${packetRgb}, 0)`);
        ctx.fillStyle = packetGlow;
        ctx.beginPath();
        ctx.arc(px, py, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${packetRgb}, 0.95)`;
        ctx.fill();
      };

      drawGradedRibbon(0.22, 22, 410, wavePhase1, 'rgba(21, 128, 61, 0.28)', '21, 128, 61', 0.0);
      drawGradedRibbon(0.52, 26, 520, wavePhase2, 'rgba(184, 137, 56, 0.32)', '184, 137, 56', 0.35);
      drawGradedRibbon(0.8, 18, 370, wavePhase3, 'rgba(153, 27, 27, 0.24)', '153, 27, 27', 0.68);

      // 3. Connect nearby nodes with color-graded filaments
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 165) {
            const lineAlpha = (1 - dist / 165) * 0.26;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${nodes[i].rgb}, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.95;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // 4. Shimmering Emerald, Gold & Crimson verification nodes
      for (const n of nodes) {
        if (!prefersReducedMotion) {
          n.x += n.vx * (delta / 16);
          n.y += n.vy * (delta / 16);
          n.phase += n.pulseSpeed * delta;
          if (n.x < -10) n.x = width + 10;
          if (n.x > width + 10) n.x = -10;
          if (n.y < -10) n.y = height + 10;
          if (n.y > height + 10) n.y = -10;
        }
        const currentAlpha = n.alpha + Math.sin(n.phase) * 0.18;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.rgb}, ${Math.max(0.14, currentAlpha).toFixed(3)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [tone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none w-full h-full ${className}`}
    />
  );
};

