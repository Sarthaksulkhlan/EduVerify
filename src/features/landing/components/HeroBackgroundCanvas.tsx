import React, { useEffect, useRef } from 'react';

interface GoldenOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface ChampagneNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  phase: number;
}

export const HeroBackgroundCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
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

    // Warm golden & champagne ambient light orbs
    const orbs: GoldenOrb[] = [
      {
        x: width * 0.2,
        y: height * 0.3,
        vx: 0.22,
        vy: 0.14,
        radius: Math.max(width, height) * 0.34,
        color: 'rgba(212, 175, 55, 0.14)', // Warm royal gold
      },
      {
        x: width * 0.76,
        y: height * 0.42,
        vx: -0.18,
        vy: 0.16,
        radius: Math.max(width, height) * 0.38,
        color: 'rgba(197, 160, 89, 0.16)', // Champagne gold
      },
      {
        x: width * 0.48,
        y: height * 0.78,
        vx: 0.15,
        vy: -0.15,
        radius: Math.max(width, height) * 0.3,
        color: 'rgba(229, 203, 144, 0.18)', // Soft sunlit champagne
      },
    ];

    // Luminous champagne & gold constellation nodes
    const nodeCount = Math.min(34, Math.max(18, Math.floor((width * height) / 42000)));
    const nodes: ChampagneNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (prefersReducedMotion ? 0.03 : 0.32),
        vy: (Math.random() - 0.5) * (prefersReducedMotion ? 0.03 : 0.32),
        radius: Math.random() * 1.8 + 1.2,
        alpha: Math.random() * 0.45 + 0.25,
        pulseSpeed: Math.random() * 0.003 + 0.0015,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let wavePhase1 = 0;
    let wavePhase2 = 1.8;
    let wavePhase3 = 3.5;
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(time - lastTime, 64);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // 1. Drifting Golden & Champagne Ambient Orbs
      for (const orb of orbs) {
        if (!prefersReducedMotion) {
          orb.x += orb.vx * (delta / 16);
          orb.y += orb.vy * (delta / 16);
          if (orb.x < 0 || orb.x > width) orb.vx *= -1;
          if (orb.y < 0 || orb.y > height) orb.vy *= -1;
        }
        const grad = ctx.createRadialGradient(orb.x, orb.y, 10, orb.x, orb.y, orb.radius);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(250, 247, 240, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Flowing Golden & Champagne Silk Ribbons
      if (!prefersReducedMotion) {
        wavePhase1 += 0.0007 * delta;
        wavePhase2 -= 0.00055 * delta;
        wavePhase3 += 0.00085 * delta;
      }

      const drawRibbon = (yRatio: number, amp: number, wl: number, ph: number, stroke: string) => {
        ctx.beginPath();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.25;
        const baseY = height * yRatio;
        for (let x = 0; x <= width; x += 10) {
          const y =
            baseY +
            Math.sin(x / wl + ph) * amp +
            Math.cos(x / (wl * 0.6) - ph * 0.7) * (amp * 0.4);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      drawRibbon(0.24, 18, 420, wavePhase1, 'rgba(184, 137, 56, 0.24)');
      drawRibbon(0.52, 22, 540, wavePhase2, 'rgba(197, 160, 89, 0.28)');
      drawRibbon(0.79, 15, 380, wavePhase3, 'rgba(160, 124, 60, 0.20)');

      // 3. Connect nearby nodes with delicate champagne filaments
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 155) {
            const lineAlpha = (1 - dist / 155) * 0.22;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(184, 137, 56, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // 4. Shimmering golden particles
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
        const currentAlpha = n.alpha + Math.sin(n.phase) * 0.15;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184, 137, 56, ${Math.max(0.1, currentAlpha)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none w-full h-full ${className}`}
    />
  );
};
