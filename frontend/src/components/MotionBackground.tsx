import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface SilkRibbon {
  baseYRatio: number;
  shearAngle: number;
  thickness: number;
  amplitude1: number;
  amplitude2: number;
  amplitude3: number;
  freq1: number;
  freq2: number;
  freq3: number;
  speed1: number;
  speed2: number;
  speed3: number;
  phase1: number;
  phase2: number;
  phase3: number;
  crestColor: string;
  crestGlow: string;
  crestWidth: number;
  gradColorStart: string;
  gradColorMid: string;
  gradColorEnd: string;
}

interface SilkMote {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  glowColor: string;
  phase: number;
  phaseSpeed: number;
  baseAlpha: number;
}

const MotionBackgroundContent: React.FC = () => {
  const { theme } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePos = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const isDark = theme === 'dark';
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
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

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.targetX = e.clientX;
      mousePos.current.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mousePos.current.targetX = -1000;
      mousePos.current.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // 6 Layered Silk Ribbons in Codeticz Theme
    const darkRibbons: SilkRibbon[] = [
      {
        baseYRatio: 0.78,
        shearAngle: 0.07,
        thickness: 280,
        amplitude1: 85,
        amplitude2: 40,
        amplitude3: 16,
        freq1: 0.0009,
        freq2: 0.0018,
        freq3: 0.0036,
        speed1: 0.0004,
        speed2: -0.0003,
        speed3: 0.0005,
        phase1: 0,
        phase2: 1.2,
        phase3: 2.5,
        crestColor: 'rgba(255, 90, 31, 0.35)',
        crestGlow: 'rgba(255, 90, 31, 0.2)',
        crestWidth: 1.0,
        gradColorStart: 'rgba(26, 32, 44, 0.45)',
        gradColorMid: 'rgba(18, 22, 32, 0.35)',
        gradColorEnd: 'rgba(8, 10, 15, 0)',
      },
      {
        baseYRatio: 0.58,
        shearAngle: -0.06,
        thickness: 190,
        amplitude1: 76,
        amplitude2: 36,
        amplitude3: 14,
        freq1: 0.0013,
        freq2: 0.0026,
        freq3: 0.0042,
        speed1: 0.0005,
        speed2: -0.0004,
        speed3: 0.0007,
        phase1: 1.8,
        phase2: 0.5,
        phase3: 3.1,
        crestColor: 'rgba(255, 90, 31, 0.8)',
        crestGlow: 'rgba(255, 90, 31, 0.5)',
        crestWidth: 1.3,
        gradColorStart: 'rgba(255, 90, 31, 0.32)',
        gradColorMid: 'rgba(255, 48, 79, 0.16)',
        gradColorEnd: 'rgba(8, 10, 15, 0)',
      },
      {
        baseYRatio: 0.44,
        shearAngle: 0.04,
        thickness: 240,
        amplitude1: 95,
        amplitude2: 45,
        amplitude3: 18,
        freq1: 0.0008,
        freq2: 0.0016,
        freq3: 0.0032,
        speed1: -0.0003,
        speed2: 0.0004,
        speed3: -0.0006,
        phase1: 3.4,
        phase2: 2.1,
        phase3: 0.8,
        crestColor: 'rgba(244, 247, 251, 0.65)',
        crestGlow: 'rgba(244, 247, 251, 0.35)',
        crestWidth: 1.1,
        gradColorStart: 'rgba(244, 247, 251, 0.16)',
        gradColorMid: 'rgba(244, 247, 251, 0.06)',
        gradColorEnd: 'rgba(8, 10, 15, 0)',
      },
      {
        baseYRatio: 0.32,
        shearAngle: -0.08,
        thickness: 160,
        amplitude1: 65,
        amplitude2: 30,
        amplitude3: 12,
        freq1: 0.0015,
        freq2: 0.003,
        freq3: 0.005,
        speed1: 0.0006,
        speed2: -0.0005,
        speed3: 0.0008,
        phase1: 0.9,
        phase2: 3.7,
        phase3: 1.4,
        crestColor: 'rgba(255, 48, 79, 0.75)',
        crestGlow: 'rgba(255, 48, 79, 0.45)',
        crestWidth: 1.2,
        gradColorStart: 'rgba(255, 48, 79, 0.28)',
        gradColorMid: 'rgba(255, 90, 31, 0.14)',
        gradColorEnd: 'rgba(8, 10, 15, 0)',
      },
      {
        baseYRatio: 0.22,
        shearAngle: 0.05,
        thickness: 130,
        amplitude1: 55,
        amplitude2: 26,
        amplitude3: 10,
        freq1: 0.0018,
        freq2: 0.0035,
        freq3: 0.006,
        speed1: -0.0005,
        speed2: 0.0006,
        speed3: -0.0007,
        phase1: 2.3,
        phase2: 1.1,
        phase3: 4.2,
        crestColor: 'rgba(255, 90, 31, 0.85)',
        crestGlow: 'rgba(255, 90, 31, 0.55)',
        crestWidth: 1.4,
        gradColorStart: 'rgba(255, 90, 31, 0.3)',
        gradColorMid: 'rgba(244, 247, 251, 0.1)',
        gradColorEnd: 'rgba(8, 10, 15, 0)',
      },
      {
        baseYRatio: 0.88,
        shearAngle: -0.04,
        thickness: 320,
        amplitude1: 100,
        amplitude2: 50,
        amplitude3: 20,
        freq1: 0.0007,
        freq2: 0.0014,
        freq3: 0.0028,
        speed1: 0.0003,
        speed2: -0.0002,
        speed3: 0.0004,
        phase1: 4.1,
        phase2: 0.8,
        phase3: 2.9,
        crestColor: 'rgba(255, 48, 79, 0.3)',
        crestGlow: 'rgba(255, 48, 79, 0.18)',
        crestWidth: 0.9,
        gradColorStart: 'rgba(18, 22, 32, 0.5)',
        gradColorMid: 'rgba(26, 32, 44, 0.25)',
        gradColorEnd: 'rgba(8, 10, 15, 0)',
      },
    ];

    const lightRibbons: SilkRibbon[] = [
      {
        baseYRatio: 0.78,
        shearAngle: 0.07,
        thickness: 280,
        amplitude1: 85,
        amplitude2: 40,
        amplitude3: 16,
        freq1: 0.0009,
        freq2: 0.0018,
        freq3: 0.0036,
        speed1: 0.0004,
        speed2: -0.0003,
        speed3: 0.0005,
        phase1: 0,
        phase2: 1.2,
        phase3: 2.5,
        crestColor: 'rgba(255, 90, 31, 0.25)',
        crestGlow: 'rgba(255, 90, 31, 0.15)',
        crestWidth: 1.0,
        gradColorStart: 'rgba(255, 90, 31, 0.05)',
        gradColorMid: 'rgba(255, 90, 31, 0.02)',
        gradColorEnd: 'rgba(248, 250, 252, 0)',
      },
      {
        baseYRatio: 0.58,
        shearAngle: -0.06,
        thickness: 190,
        amplitude1: 76,
        amplitude2: 36,
        amplitude3: 14,
        freq1: 0.0013,
        freq2: 0.0026,
        freq3: 0.0042,
        speed1: 0.0005,
        speed2: -0.0004,
        speed3: 0.0007,
        phase1: 1.8,
        phase2: 0.5,
        phase3: 3.1,
        crestColor: 'rgba(255, 90, 31, 0.4)',
        crestGlow: 'rgba(255, 90, 31, 0.2)',
        crestWidth: 1.2,
        gradColorStart: 'rgba(255, 90, 31, 0.08)',
        gradColorMid: 'rgba(255, 48, 79, 0.04)',
        gradColorEnd: 'rgba(248, 250, 252, 0)',
      },
      {
        baseYRatio: 0.44,
        shearAngle: 0.04,
        thickness: 240,
        amplitude1: 95,
        amplitude2: 45,
        amplitude3: 18,
        freq1: 0.0008,
        freq2: 0.0016,
        freq3: 0.0032,
        speed1: -0.0003,
        speed2: 0.0004,
        speed3: -0.0006,
        phase1: 3.4,
        phase2: 2.1,
        phase3: 0.8,
        crestColor: 'rgba(255, 120, 60, 0.3)',
        crestGlow: 'rgba(255, 120, 60, 0.15)',
        crestWidth: 1.0,
        gradColorStart: 'rgba(255, 120, 60, 0.06)',
        gradColorMid: 'rgba(255, 120, 60, 0.02)',
        gradColorEnd: 'rgba(248, 250, 252, 0)',
      },
      {
        baseYRatio: 0.32,
        shearAngle: -0.08,
        thickness: 160,
        amplitude1: 65,
        amplitude2: 30,
        amplitude3: 12,
        freq1: 0.0015,
        freq2: 0.003,
        freq3: 0.005,
        speed1: 0.0006,
        speed2: -0.0005,
        speed3: 0.0008,
        phase1: 0.9,
        phase2: 3.7,
        phase3: 1.4,
        crestColor: 'rgba(255, 48, 79, 0.3)',
        crestGlow: 'rgba(255, 48, 79, 0.15)',
        crestWidth: 1.0,
        gradColorStart: 'rgba(255, 48, 79, 0.05)',
        gradColorMid: 'rgba(255, 48, 79, 0.02)',
        gradColorEnd: 'rgba(248, 250, 252, 0)',
      },
      {
        baseYRatio: 0.22,
        shearAngle: 0.05,
        thickness: 130,
        amplitude1: 55,
        amplitude2: 26,
        amplitude3: 10,
        freq1: 0.0018,
        freq2: 0.0035,
        freq3: 0.006,
        speed1: -0.0005,
        speed2: 0.0006,
        speed3: -0.0007,
        phase1: 2.3,
        phase2: 1.1,
        phase3: 4.2,
        crestColor: 'rgba(255, 90, 31, 0.35)',
        crestGlow: 'rgba(255, 90, 31, 0.15)',
        crestWidth: 1.1,
        gradColorStart: 'rgba(255, 90, 31, 0.06)',
        gradColorMid: 'rgba(255, 90, 31, 0.02)',
        gradColorEnd: 'rgba(248, 250, 252, 0)',
      },
      {
        baseYRatio: 0.88,
        shearAngle: -0.04,
        thickness: 320,
        amplitude1: 100,
        amplitude2: 50,
        amplitude3: 20,
        freq1: 0.0007,
        freq2: 0.0014,
        freq3: 0.0028,
        speed1: 0.0003,
        speed2: -0.0002,
        speed3: 0.0004,
        phase1: 4.1,
        phase2: 0.8,
        phase3: 2.9,
        crestColor: 'rgba(255, 90, 31, 0.2)',
        crestGlow: 'rgba(255, 90, 31, 0.1)',
        crestWidth: 0.8,
        gradColorStart: 'rgba(255, 90, 31, 0.04)',
        gradColorMid: 'rgba(241, 245, 249, 0.02)',
        gradColorEnd: 'rgba(248, 250, 252, 0)',
      }
    ];

    const ribbons = isDark ? darkRibbons : lightRibbons;

    // Ambient Luminous Silk Motes
    const motes: SilkMote[] = [];
    const moteCount = isDark ? 26 : 18;
    for (let i = 0; i < moteCount; i++) {
      const isWhite = Math.random() > 0.4;
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.0 + 1.2,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.25,
        color: isDark ? (isWhite ? '#F4F7FB' : '#FF5A1F') : '#FF5A1F',
        glowColor: isDark
          ? (isWhite ? 'rgba(244, 247, 251, 0.6)' : 'rgba(255, 90, 31, 0.55)')
          : 'rgba(255, 90, 31, 0.35)',
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: Math.random() * 0.02 + 0.01,
        baseAlpha: isDark ? (Math.random() * 0.35 + 0.18) : (Math.random() * 0.2 + 0.1),
      });
    }

    let time = 0;

    const render = () => {
      time += 1;

      // Mouse lerping for smooth silk interaction
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.04;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.04;

      // 1. Radial Background Gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        20,
        width * 0.5,
        height * 0.35,
        Math.max(width, height) * 0.88
      );
      if (isDark) {
        bgGrad.addColorStop(0, '#10141E');
        bgGrad.addColorStop(0.5, '#080A0F');
        bgGrad.addColorStop(1, '#05060A');
      } else {
        bgGrad.addColorStop(0, '#FFFFFF');
        bgGrad.addColorStop(0.6, '#F8FAFC');
        bgGrad.addColorStop(1, '#EDF2F7');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render Layered Silk Ribbons
      for (let r = 0; r < ribbons.length; r++) {
        const ribbon = ribbons[r];
        const step = 10;
        const pointsTop: { x: number; y: number }[] = [];
        const pointsBottom: { x: number; y: number }[] = [];

        for (let x = -20; x <= width + 20; x += step) {
          const baseY = height * ribbon.baseYRatio + (x - width * 0.5) * ribbon.shearAngle;

          const h1 = Math.sin(x * ribbon.freq1 + time * ribbon.speed1 + ribbon.phase1) * ribbon.amplitude1;
          const h2 = Math.cos(x * ribbon.freq2 + time * ribbon.speed2 + ribbon.phase2) * ribbon.amplitude2;
          const h3 = Math.sin(x * ribbon.freq3 + time * ribbon.speed3 + ribbon.phase3) * ribbon.amplitude3;

          // Tactile mouse billowing
          const dx = x - mousePos.current.x;
          const dy = baseY - mousePos.current.y;
          const distSq = dx * dx;
          let mouseDisp = 0;
          if (distSq < 150000) {
            const influence = Math.exp(-distSq / (2 * 130 * 130));
            mouseDisp = -dy * 0.22 * influence;
          }

          const yTop = baseY + h1 + h2 + h3 + mouseDisp;
          const thickness =
            ribbon.thickness +
            Math.sin(x * ribbon.freq2 * 0.7 + time * ribbon.speed1 * 0.8) * (ribbon.thickness * 0.28);
          const yBottom = yTop + thickness;

          pointsTop.push({ x, y: yTop });
          pointsBottom.push({ x, y: yBottom });
        }

        // Draw Silk Ribbon Body
        ctx.beginPath();
        ctx.moveTo(pointsTop[0].x, pointsTop[0].y);
        for (let i = 1; i < pointsTop.length; i++) {
          ctx.lineTo(pointsTop[i].x, pointsTop[i].y);
        }
        for (let i = pointsBottom.length - 1; i >= 0; i--) {
          ctx.lineTo(pointsBottom[i].x, pointsBottom[i].y);
        }
        ctx.closePath();

        const avgY = height * ribbon.baseYRatio;
        const ribbonGrad = ctx.createLinearGradient(
          0,
          avgY - ribbon.amplitude1,
          0,
          avgY + ribbon.thickness + ribbon.amplitude1
        );
        ribbonGrad.addColorStop(0, ribbon.gradColorStart);
        ribbonGrad.addColorStop(0.35, ribbon.gradColorMid);
        ribbonGrad.addColorStop(1, ribbon.gradColorEnd);

        ctx.fillStyle = ribbonGrad;
        ctx.fill();

        // Stroke Lit Silk Crest (High-Tech Luminous Folds)
        ctx.beginPath();
        ctx.moveTo(pointsTop[0].x, pointsTop[0].y);
        for (let i = 1; i < pointsTop.length; i++) {
          ctx.lineTo(pointsTop[i].x, pointsTop[i].y);
        }
        ctx.strokeStyle = ribbon.crestColor;
        ctx.lineWidth = ribbon.crestWidth;
        ctx.shadowColor = ribbon.crestGlow;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 3. Render Ambient Floating Silk Light Motes
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.phase += m.phaseSpeed;
        m.x += m.vx;
        m.y += m.vy + Math.sin(m.phase) * 0.3;

        if (m.x < -20) m.x = width + 20;
        if (m.x > width + 20) m.x = -20;
        if (m.y < -20) m.y = height + 20;
        if (m.y > height + 20) m.y = -20;

        const pulse = Math.sin(m.phase) * 0.2;
        const alpha = Math.max(0.1, Math.min(0.8, m.baseAlpha + pulse));

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = m.glowColor;
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [theme]);

  return (
    <div id="motion-bg">
      {/* 1. Smooth Silky Wave Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* 2. Atmospheric Nebula Blobs (Subtle Orange & Ember Accents) */}
      <div className="blob" id="blob-1" style={{ top: '-10%', left: '-8%' }} />
      <div className="blob blob-cream" id="blob-2" style={{ bottom: '-15%', right: '-8%' }} />
      <div className="blob blob-crimson-deep" style={{ top: '40%', left: '30%' }} />
    </div>
  );
};

export const MotionBackground: React.FC = () => {
  const { theme } = useAppStore();
  const location = useLocation();
  const isEditorPage = location.pathname.startsWith('/editor');

  // Pause canvas and save GPU cycles on the code editor page
  if (isEditorPage) {
    return <div id="motion-bg" className={theme === 'dark' ? 'bg-[#080A0F]' : 'bg-[#F8FAFC]'} />;
  }

  return <MotionBackgroundContent key={theme} />;
};

export default MotionBackground;
