import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  prevZ: number;
  size: number;
  color: string;
  glowColor: string;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FloatingGlyph {
  x: number;
  y: number;
  z: number;
  text: string;
  color: string;
  rotation: number;
  rotSpeed: number;
}

const GLYPHS = ['< />', '{ }', '0101', 'λ', '⚡', 'fn()', 'async', '=>', '::', '◈', '&&', 'git'];

export const MotionBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let cx = width / 2;
    let cy = height / 2;
    let targetCx = cx;
    let targetCy = cy;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cx = width / 2;
      cy = height / 2;
      targetCx = cx;
      targetCy = cy;
    };

    window.addEventListener('resize', handleResize);

    // Subtle parallax mouse steering (tilts the cosmic camera gently)
    const handleMouseMove = (e: MouseEvent) => {
      targetCx = width / 2 + (e.clientX - width / 2) * 0.1;
      targetCy = height / 2 + (e.clientY - height / 2) * 0.1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Constant, steady cosmic cruise speed (never accelerates on scroll or wheel)
    const speed = 2.0;

    // Initialize 3D Space Starfield
    const maxZ = 1500;
    const fov = 340;
    const starCount = Math.min(650, Math.floor((width * height) / 2200) + 180);
    const stars: Star[] = [];

    const starTypes = [
      { color: '#FFFFFF', glow: 'rgba(255,255,255,0.45)', weight: 5 },
      { color: '#EAFBFF', glow: 'rgba(234,251,255,0.45)', weight: 3 },
      { color: '#B4FF00', glow: 'rgba(180,255,0,0.5)', weight: 3 },
      { color: '#00F2FE', glow: 'rgba(0,242,254,0.5)', weight: 2 },
      { color: '#FFD966', glow: 'rgba(255,217,102,0.45)', weight: 1 },
    ];

    const pickStarType = () => {
      const total = starTypes.reduce((acc, t) => acc + t.weight, 0);
      let rand = Math.random() * total;
      for (const t of starTypes) {
        if (rand < t.weight) return t;
        rand -= t.weight;
      }
      return starTypes[0];
    };

    for (let i = 0; i < starCount; i++) {
      const z = Math.random() * maxZ;
      const type = pickStarType();
      stars.push({
        x: (Math.random() - 0.5) * width * 3.4,
        y: (Math.random() - 0.5) * height * 3.4,
        z,
        prevZ: z,
        size: Math.random() * 1.7 + 0.8,
        color: type.color,
        glowColor: type.glow,
        twinkleSpeed: Math.random() * 0.05 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // Initialize Floating Cosmic Code Glyphs
    const glyphs: FloatingGlyph[] = [];
    const glyphCount = 14;
    for (let i = 0; i < glyphCount; i++) {
      glyphs.push({
        x: (Math.random() - 0.5) * width * 2.6,
        y: (Math.random() - 0.5) * height * 2.6,
        z: Math.random() * maxZ + 200,
        text: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        color: Math.random() > 0.45 ? '#B4FF00' : '#00F2FE',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.012,
      });
    }

    // Cosmic Shooting Stars / Comets System
    const comets: Comet[] = [];
    let cometTimer = 100;

    const spawnComet = () => {
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.35; // diagonal fall
      const cometSpeed = Math.random() * 8 + 14;
      const fromTop = Math.random() > 0.4;
      const startX = fromTop ? Math.random() * width * 0.9 : -40;
      const startY = fromTop ? -30 : Math.random() * (height * 0.5);

      comets.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * cometSpeed,
        vy: Math.sin(angle) * cometSpeed,
        length: Math.random() * 120 + 90,
        size: Math.random() * 2 + 1.6,
        color: Math.random() > 0.4 ? '#B4FF00' : '#00F2FE',
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 55 + 45,
      });
    };

    // Main Space Animation Render Loop (Constant Steady Motion)
    const render = () => {
      // Camera focal point smoothing
      cx += (targetCx - cx) * 0.05;
      cy += (targetCy - cy) * 0.05;

      // Deep space background gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(width, height) * 0.85);
      bgGrad.addColorStop(0, '#0d281a');
      bgGrad.addColorStop(0.5, '#071810');
      bgGrad.addColorStop(1, '#040e09');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. RENDER 3D STARS (Radiant, steady glowing stars in motion)
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        star.prevZ = star.z;
        star.z -= speed;
        star.twinklePhase += star.twinkleSpeed;

        // Recycle star when it flies past camera
        if (star.z <= 12) {
          star.z = maxZ;
          star.prevZ = maxZ;
          star.x = (Math.random() - 0.5) * width * 3.4;
          star.y = (Math.random() - 0.5) * height * 3.4;
        }

        // 3D Perspective Projection
        const k = fov / star.z;
        const sx = cx + star.x * k;
        const sy = cy + star.y * k;

        // Screen boundary check
        if (sx < -60 || sx > width + 60 || sy < -60 || sy > height + 60) {
          star.z = maxZ;
          star.prevZ = maxZ;
          continue;
        }

        const depthRatio = 1 - star.z / maxZ; // 0 (far) to 1 (near)
        const twinkle = Math.sin(star.twinklePhase) * 0.25;
        const alpha = Math.min(1, Math.max(0.15, depthRatio * 1.2 + twinkle));
        const radius = Math.max(0.7, depthRatio * star.size * 1.6);

        // Soft atmospheric starlight glow for closer stars
        if (depthRatio > 0.45) {
          ctx.beginPath();
          ctx.arc(sx, sy, radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = star.glowColor;
          ctx.globalAlpha = alpha * 0.35;
          ctx.fill();
        }

        // Crisp brilliant star core
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      // 2. RENDER FLOATING CODE GLYPHS
      for (let i = 0; i < glyphs.length; i++) {
        const g = glyphs[i];
        g.z -= speed * 0.7;
        g.rotation += g.rotSpeed;

        if (g.z <= 25) {
          g.z = maxZ;
          g.x = (Math.random() - 0.5) * width * 2.6;
          g.y = (Math.random() - 0.5) * height * 2.6;
        }

        const k = fov / g.z;
        const gx = cx + g.x * k;
        const gy = cy + g.y * k;

        if (gx > 0 && gx < width && gy > 0 && gy < height) {
          const depthRatio = 1 - g.z / maxZ;
          const alpha = Math.min(0.65, depthRatio * 0.8);

          ctx.save();
          ctx.translate(gx, gy);
          ctx.rotate(g.rotation);
          ctx.font = `600 ${Math.floor(Math.max(9, depthRatio * 17))}px 'Fira Code', monospace`;
          ctx.fillStyle = g.color;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = g.color;
          ctx.shadowBlur = depthRatio * 10;
          ctx.fillText(g.text, 0, 0);
          ctx.restore();
        }
      }

      // 3. RENDER SHOOTING COMETS
      cometTimer--;
      if (cometTimer <= 0) {
        spawnComet();
        cometTimer = Math.floor(Math.random() * 180 + 120);
      }

      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.life++;
        c.x += c.vx;
        c.y += c.vy;

        const progress = c.life / c.maxLife;
        c.alpha = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;

        if (c.life >= c.maxLife || c.x > width + 100 || c.y > height + 100) {
          comets.splice(i, 1);
          continue;
        }

        // Comet radiant tail
        const tailX = c.x - (c.vx / 14) * c.length;
        const tailY = c.y - (c.vy / 14) * c.length;

        const grad = ctx.createLinearGradient(tailX, tailY, c.x, c.y);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.65, c.color === '#B4FF00' ? 'rgba(180, 255, 0, 0.45)' : 'rgba(0, 242, 254, 0.45)');
        grad.addColorStop(1, '#FFFFFF');

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = c.size;
        ctx.globalAlpha = Math.max(0, c.alpha * 0.9);
        ctx.stroke();

        // Glowing nucleus head
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 14;
        ctx.globalAlpha = Math.max(0, c.alpha);
        ctx.fill();
      }

      // Reset alpha
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div id="motion-bg">
      {/* 3D Deep Space Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Cosmic Nebula Clouds (Atmospheric glow) */}
      <div className="blob" id="blob-1" style={{ top: '-10%', left: '-8%', opacity: 0.14 }} />
      <div className="blob blob-cyan" id="blob-2" style={{ bottom: '-15%', right: '-8%', opacity: 0.12 }} />
      <div className="blob blob-violet" style={{ top: '40%', left: '30%', opacity: 0.08 }} />
    </div>
  );
};
