import { useEffect, useRef } from 'react';

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Medical/cardiac symbols + digits
    const chars = '0123456789ABCDEFHKLMNOPRSTUVWXYZ♥⚡∑∫∂≥≤→←↑↓αβγδεζηθλμπρστφω';
    const fontSize = 13;
    const cols = Math.floor(window.innerWidth / fontSize);
    const drops: number[] = Array(cols).fill(1).map(() => Math.random() * -100);
    const speeds: number[] = Array(cols).fill(0).map(() => 0.4 + Math.random() * 0.9);
    const opacities: number[] = Array(cols).fill(0).map(() => 0.4 + Math.random() * 0.5);

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 9, 6, 0.055)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const y = drops[i] * fontSize;

        // Bright head
        const brightness = Math.random();
        if (brightness > 0.93) {
          ctx.fillStyle = `rgba(220, 255, 230, ${opacities[i]})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#70f0a0';
        } else if (brightness > 0.7) {
          ctx.fillStyle = `rgba(112, 240, 160, ${opacities[i] * 0.9})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#70f0a0';
        } else {
          ctx.fillStyle = `rgba(28, 130, 70, ${opacities[i] * 0.65})`;
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        }

        ctx.font = `${fontSize}px 'Courier New', monospace`;
        ctx.fillText(char, i * fontSize, y);
        ctx.shadowBlur = 0;

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speeds[i];
      }
    };

    const loop = () => {
      draw();
      animFrame = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
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
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.85,
      }}
    />
  );
}
