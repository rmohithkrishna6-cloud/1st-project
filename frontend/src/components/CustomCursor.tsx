import React, { useEffect, useRef, useState } from 'react';

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  life: number;
  maxLife: number;
}

interface ClickBurst {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

const COSMIC_COLORS = ['#B4FF00', '#00F2FE', '#FFFFFF', '#80FF72', '#70E000'];

export const CustomCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const mousePos = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });
  const prevMousePos = useRef({ x: -100, y: -100 });
  const followerPos = useRef({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isOverTextEditor, setIsOverTextEditor] = useState(false);

  useEffect(() => {
    // Check if device supports fine hover pointer (disable on touch screens)
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: TrailParticle[] = [];
    const bursts: ClickBurst[] = [];

    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mousePos.current.targetX = e.clientX;
      mousePos.current.targetY = e.clientY;

      // Detect interactive element hover
      const target = e.target as HTMLElement | null;
      if (target) {
        // Check if user is typing in Monaco editor or input
        const isEditor =
          target.closest('.monaco-editor') !== null ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA';
        setIsOverTextEditor(isEditor);

        const isInteractive =
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') !== null ||
          target.closest('a') !== null ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('cursor-pointer') ||
          target.classList.contains('neo-button') ||
          target.classList.contains('neo-flat');
        setIsHovered(isInteractive && !isEditor);
      }

      // Calculate velocity
      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;
      const dist = Math.hypot(dx, dy);

      // Spawn stardust comet trail when moving
      if (dist > 3 && particles.length < 90) {
        const count = Math.min(4, Math.max(1, Math.floor(dist / 8)));
        for (let i = 0; i < count; i++) {
          const spread = (Math.random() - 0.5) * 10;
          const color = COSMIC_COLORS[Math.floor(Math.random() * COSMIC_COLORS.length)];
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 1.5 + 0.5;

          particles.push({
            x: e.clientX + spread,
            y: e.clientY + spread,
            vx: -dx * 0.15 + Math.cos(angle) * speed,
            vy: -dy * 0.15 + Math.sin(angle) * speed,
            size: Math.random() * 2.2 + 1.2,
            color,
            alpha: 0.9,
            decay: Math.random() * 0.035 + 0.025,
            life: 0,
            maxLife: Math.floor(Math.random() * 25 + 20),
          });
        }
      }

      prevMousePos.current.x = e.clientX;
      prevMousePos.current.y = e.clientY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      // Spawn cosmic shockwave ripple burst on click
      bursts.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        maxRadius: 36,
        alpha: 0.8,
        color: '#B4FF00',
      });

      // Extra stardust sparkles on click
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 3 + 2;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.5 + 1.5,
          color: i % 2 === 0 ? '#B4FF00' : '#00F2FE',
          alpha: 1,
          decay: 0.04,
          life: 0,
          maxLife: 30,
        });
      }
    };

    const handleMouseUp = () => setIsClicked(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => {
      setIsVisible(false);
      particles.length = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth cursor lerping
      const targetX = mousePos.current.targetX;
      const targetY = mousePos.current.targetY;

      mousePos.current.x = targetX;
      mousePos.current.y = targetY;

      followerPos.current.x += (targetX - followerPos.current.x) * 0.22;
      followerPos.current.y += (targetY - followerPos.current.y) * 0.22;

      // Update DOM cursor elements directly (zero React re-render lag)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      if (ringRef.current) {
        // Calculate velocity stretch & tilt
        const vx = targetX - followerPos.current.x;
        const vy = targetY - followerPos.current.y;
        const velocity = Math.hypot(vx, vy);
        const angle = Math.atan2(vy, vx) * (180 / Math.PI);
        const stretch = Math.min(1.4, 1 + velocity * 0.015);
        const squash = Math.max(0.75, 1 - velocity * 0.008);

        ringRef.current.style.transform = `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0) rotate(${angle}deg) scale(${stretch}, ${squash})`;
      }

      // Render cosmic click ripples
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.radius += (b.maxRadius - b.radius) * 0.18 + 0.8;
        b.alpha *= 0.88;

        if (b.alpha < 0.02 || b.radius >= b.maxRadius) {
          bursts.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = b.alpha;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
      }

      // Render stardust particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size * (p.alpha / 0.9)), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300 ${
        isVisible && !isOverTextEditor ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 1. Stardust Particle Trail & Shockwave Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* 2. Outer Cosmic Follower Ring / Targeting Reticle */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none -mt-4 -ml-4 will-change-transform"
        style={{
          width: '32px',
          height: '32px',
        }}
      >
        <div
          className={`w-full h-full rounded-full transition-all duration-200 flex items-center justify-center ${
            isHovered
              ? 'scale-150 border-2 border-[#00F2FE] bg-[#00F2FE]/10 shadow-[0_0_20px_rgba(0,242,254,0.6)]'
              : isClicked
              ? 'scale-75 border-2 border-[#B4FF00] bg-[#B4FF00]/30 shadow-[0_0_16px_rgba(180,255,0,0.8)]'
              : 'scale-100 border border-[#B4FF00]/60 bg-[#B4FF00]/5 shadow-[0_0_12px_rgba(180,255,0,0.35)]'
          }`}
        >
          {/* Subtle Cyber Reticle Corner Ticks when hovered */}
          {isHovered && (
            <div className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-ping" />
          )}
        </div>
      </div>

      {/* 3. Center Precision Laser Tip */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none -mt-1 -ml-1 will-change-transform"
        style={{
          width: '8px',
          height: '8px',
        }}
      >
        <div
          className={`w-full h-full rounded-full transition-all duration-150 ${
            isHovered
              ? 'bg-[#00F2FE] shadow-[0_0_10px_#00F2FE] scale-125'
              : isClicked
              ? 'bg-white shadow-[0_0_12px_#ffffff] scale-75'
              : 'bg-[#B4FF00] shadow-[0_0_8px_#B4FF00]'
          }`}
        />
      </div>
    </div>
  );
};
