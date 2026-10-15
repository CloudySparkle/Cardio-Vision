import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  size: number;
  vx: number;
  vy: number;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      // Spawn multiple particles per move
      for (let i = 0; i < 4; i++) {
        const life = 30 + Math.random() * 30;
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          life,
          maxLife: life,
          size: 1.5 + Math.random() * 3,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6 - 0.4,
        });
      }
      // Keep cap
      if (particles.current.length > 300) {
        particles.current.splice(0, particles.current.length - 300);
      }
    };

    window.addEventListener('mousemove', onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter(p => p.life > 0);

      for (const p of particles.current) {
        const alpha = p.life / p.maxLife;
        const green = Math.floor(160 + 80 * alpha);
        const brightness = alpha > 0.7 ? 1 : alpha;

        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.shadowBlur = 8 * brightness;
        ctx.shadowColor = `rgb(80, ${green}, 100)`;
        ctx.fillStyle = `rgb(60, ${green}, 90)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.life--;
      }

      // Glowing dot at cursor
      if (mouse.current.x > 0) {
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#70f0a0';
        ctx.fillStyle = 'rgba(112,240,160,0.9)';
        ctx.beginPath();
        ctx.arc(mouse.current.x, mouse.current.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    />
  );
}
