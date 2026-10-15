import { useEffect, useRef } from 'react';

export function InsightAtmosphere() {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorCanvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const cursorCanvas = cursorCanvasRef.current;
    const glow = glowRef.current;
    if (!bgCanvas || !cursorCanvas) return;

    const bgCtx = bgCanvas.getContext('2d');
    const cursorCtx = cursorCanvas.getContext('2d');
    if (!bgCtx || !cursorCtx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1;
    let particles: Array<{
      x: number; y: number; r: number; vy: number; vx: number;
      a: number; phase: number; color: string; streak: boolean;
    }> = [];
    let trail: Array<{ x: number; y: number; life: number; r: number; color: string }> = [];
    let sparks: Array<{ x: number; y: number; vx: number; vy: number; life: number; r: number; color: string }> = [];
    let raf = 0;
    let lastMove = 0;
    let lastPoint: { x: number; y: number } | null = null;
    const pointer = { x: -1000, y: -1000 };

    // Emerald & cyan palette tuned for CardioVision
    const palette = ['#70f0a0', '#43e58d', '#35d8f2', '#a6ffc4', '#83d9e8', '#528bff'];

    function resize() {
      if (!bgCanvas || !cursorCanvas || !bgCtx || !cursorCtx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = window.innerWidth;
      h = window.innerHeight;

      bgCanvas.width = Math.round(w * dpr);
      bgCanvas.height = Math.round(h * dpr);
      bgCanvas.style.width = w + 'px';
      bgCanvas.style.height = h + 'px';
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cursorCanvas.width = Math.round(w * dpr);
      cursorCanvas.height = Math.round(h * dpr);
      cursorCanvas.style.width = w + 'px';
      cursorCanvas.style.height = h + 'px';
      cursorCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(150, Math.max(70, Math.floor((w * h) / 9500)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.4 + 0.8,
        vy: Math.random() * 0.85 + 0.3,
        vx: (Math.random() - 0.5) * 0.35,
        a: Math.random() * 0.55 + 0.25,
        phase: Math.random() * 6.28,
        color: palette[Math.floor(Math.random() * palette.length)],
        streak: Math.random() > 0.55,
      }));
    }

    function move(e: MouseEvent | PointerEvent) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      lastMove = performance.now();

      if (lastPoint) {
        const dx = pointer.x - lastPoint.x;
        const dy = pointer.y - lastPoint.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1) {
          const n = Math.min(7, Math.ceil(dist / 10));
          for (let i = 0; i < n; i++) {
            const f = (i + 1) / n;
            trail.push({
              x: lastPoint.x + dx * f,
              y: lastPoint.y + dy * f,
              life: 1,
              r: Math.random() * 3.5 + 1.5,
              color: palette[Math.floor(Math.random() * palette.length)],
            });
          }
        }
      }

      trail.push({
        x: pointer.x,
        y: pointer.y,
        life: 1,
        r: Math.random() * 3.2 + 2.2,
        color: '#e6fffa',
      });

      if (trail.length > 110) {
        trail.splice(0, trail.length - 110);
      }

      if (Math.random() > 0.35) {
        sparks.push({
          x: pointer.x,
          y: pointer.y,
          vx: (Math.random() - 0.5) * 3.2,
          vy: (Math.random() - 0.5) * 3.2,
          life: 1,
          r: Math.random() * 2.2 + 1.2,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }

      lastPoint = { x: pointer.x, y: pointer.y };

      if (glow) {
        glow.style.setProperty('--mx', pointer.x + 'px');
        glow.style.setProperty('--my', pointer.y + 'px');
        glow.classList.add('visible');
      }
    }

    function leave() {
      lastPoint = null;
      if (glow) glow.classList.remove('visible');
    }

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerleave', leave, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    resize();

    function draw(t: number) {
      if (!bgCtx || !cursorCtx) return;

      // ── 1. Clear both canvases
      bgCtx.clearRect(0, 0, w, h);
      cursorCtx.clearRect(0, 0, w, h);

      if (!reduced) {
        // ── 2. BACKGROUND LAYER: Aurora ribbons & Falling particles
        bgCtx.save();
        bgCtx.globalCompositeOperation = 'screen';
        for (let j = 0; j < 3; j++) {
          const x = w * (0.18 + j * 0.31) + Math.sin(t * 0.00022 + j * 2) * w * 0.12;
          const y = h * (0.23 + j * 0.24) + Math.cos(t * 0.00018 + j) * h * 0.08;
          const g = bgCtx.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * 0.34);
          g.addColorStop(
            0,
            ['rgba(112, 240, 160, 0.12)', 'rgba(67, 229, 141, 0.09)', 'rgba(53, 216, 242, 0.1)'][j]
          );
          g.addColorStop(1, 'rgba(0,0,0,0)');
          bgCtx.fillStyle = g;
          bgCtx.fillRect(0, 0, w, h);
        }
        bgCtx.restore();

        // Falling particles with comet streaks in background
        particles.forEach((p) => {
          p.y += p.vy;
          p.x += p.vx + Math.sin(t * 0.0007 + p.phase) * 0.28;
          if (p.y > h + 20) {
            p.y = -20;
            p.x = Math.random() * w;
          }
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;

          bgCtx.save();
          bgCtx.globalAlpha = p.a;
          bgCtx.fillStyle = p.color;
          bgCtx.shadowBlur = 12;
          bgCtx.shadowColor = p.color;
          bgCtx.beginPath();
          bgCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          bgCtx.fill();

          if (p.streak) {
            bgCtx.globalAlpha = p.a * 0.55;
            bgCtx.strokeStyle = p.color;
            bgCtx.lineWidth = 1.1;
            bgCtx.beginPath();
            bgCtx.moveTo(p.x, p.y + 4);
            bgCtx.lineTo(p.x - p.vx * 3.5, p.y + 18 + p.vy * 4);
            bgCtx.stroke();
          }
          bgCtx.restore();
        });

        // ── 3. FOREGROUND LAYER: Glowing Connected Line Trail & Sparks (OVER ENTIRE UI)
        cursorCtx.save();
        trail = trail.filter((p) => p.life > 0.04);
        for (let i = 0; i < trail.length; i++) {
          const p = trail[i];
          p.life *= 0.91;
          cursorCtx.save();
          cursorCtx.globalAlpha = p.life * 0.85;
          cursorCtx.fillStyle = p.color;
          cursorCtx.shadowBlur = 16;
          cursorCtx.shadowColor = p.color;
          cursorCtx.beginPath();
          cursorCtx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
          cursorCtx.fill();
          cursorCtx.restore();

          if (i > 0) {
            const prev = trail[i - 1];
            cursorCtx.save();
            cursorCtx.globalAlpha = Math.min(p.life, prev.life) * 0.35;
            cursorCtx.strokeStyle = p.color;
            cursorCtx.lineWidth = 1.8;
            cursorCtx.shadowBlur = 10;
            cursorCtx.shadowColor = p.color;
            cursorCtx.beginPath();
            cursorCtx.moveTo(prev.x, prev.y);
            cursorCtx.lineTo(p.x, p.y);
            cursorCtx.stroke();
            cursorCtx.restore();
          }
        }

        // Sparks scattering
        sparks = sparks.filter((p) => p.life > 0.05);
        sparks.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.life *= 0.93;
          cursorCtx.save();
          cursorCtx.globalAlpha = p.life;
          cursorCtx.fillStyle = p.color;
          cursorCtx.shadowBlur = 14;
          cursorCtx.shadowColor = p.color;
          cursorCtx.beginPath();
          cursorCtx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
          cursorCtx.fill();
          cursorCtx.restore();
        });
        cursorCtx.restore();
      }

      if (glow && performance.now() - lastMove > 2200) {
        glow.classList.remove('visible');
      }

      raf = requestAnimationFrame(draw);
    }

    if (!reduced) raf = requestAnimationFrame(draw);
    else {
      bgCanvas.style.display = 'none';
      cursorCanvas.style.display = 'none';
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      {/* Background ambient spotlight */}
      <div ref={glowRef} className="cursor-glow" />

      {/* Background canvas: Aurora ribbons + falling particles (behind content) */}
      <canvas
        ref={bgCanvasRef}
        id="ambient-canvas"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.95,
        }}
      />

      {/* Foreground canvas: Connected luminous line cursor trail & sparks (ON TOP of everything) */}
      <canvas
        ref={cursorCanvasRef}
        id="cursor-canvas"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 99999,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
