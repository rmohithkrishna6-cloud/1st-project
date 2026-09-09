import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface TrailPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  time: number;
  speed: number;
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  color: string;
  glowColor: string;
  alpha: number;
  decay: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotSpeed: number;
  type: 'star' | 'ember' | 'ring' | 'confetti';
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  width: number;
}

const DARK_SPARKLE_PALETTE = ['#FF5A1F', '#FF304F', '#FFB800', '#F4F7FB', '#00F0FF', '#FF8C38'];
const LIGHT_SPARKLE_PALETTE = ['#FF5A1F', '#E11D48', '#D97706', '#2563EB', '#7C3AED', '#EA580C'];

const CustomCursorContent: React.FC = () => {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  const mousePos = useRef({ x: -200, y: -200, targetX: -200, targetY: -200 });
  const prevMousePos = useRef({ x: -200, y: -200 });
  const followerPos = useRef({ x: -200, y: -200 });

  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isMouseDownRef = useRef(false);
  const lastMoveTimeRef = useRef(performance.now());
  const activityFactorRef = useRef(1.0);

  useEffect(() => {
    // Disable on touch devices
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

    const ribbonTrail: TrailPoint[] = [];
    const particles: SparkleParticle[] = [];
    const shockwaves: Shockwave[] = [];

    let orbitAngle1 = 0;
    let orbitAngle2 = Math.PI;
    let orbitAngle3 = Math.PI * 0.5;

    let animationId: number;

    const palette = isDark ? DARK_SPARKLE_PALETTE : LIGHT_SPARKLE_PALETTE;

    const spawnSparkle = (
      x: number,
      y: number,
      vx: number,
      vy: number,
      type: 'star' | 'ember' | 'ring' | 'confetti' = 'star',
      sizeScale = 1.0
    ) => {
      const color = palette[Math.floor(Math.random() * palette.length)];
      particles.push({
        x,
        y,
        vx,
        vy,
        size: (Math.random() * 3.5 + 2.0) * sizeScale,
        maxSize: (Math.random() * 4.5 + 2.5) * sizeScale,
        color,
        glowColor: color,
        alpha: 1.0,
        decay: Math.random() * 0.025 + 0.02,
        life: 0,
        maxLife: Math.floor(Math.random() * 28 + 22),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.18,
        type,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      lastMoveTimeRef.current = performance.now();
      if (!isVisible) setIsVisible(true);
      mousePos.current.targetX = e.clientX;
      mousePos.current.targetY = e.clientY;

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive =
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.closest('button') !== null ||
          target.closest('a') !== null ||
          target.getAttribute('role') === 'button' ||
          target.classList.contains('cursor-pointer') ||
          target.classList.contains('neo-button') ||
          target.classList.contains('btn-primary') ||
          target.classList.contains('btn-secondary');
        setIsHovered(isInteractive);
      }

      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;
      const speed = Math.hypot(dx, dy);

      // Record ribbon trail history
      ribbonTrail.push({
        x: e.clientX,
        y: e.clientY,
        vx: dx,
        vy: dy,
        time: performance.now(),
        speed,
      });

      // Keep ribbon trail capped for crisp performance
      if (ribbonTrail.length > 20) {
        ribbonTrail.shift();
      }

      // 1. Playful trailing star sparkles based on movement velocity
      if (speed > 2 && particles.length < 140) {
        const count = Math.min(4, Math.max(1, Math.floor(speed / 9)));
        for (let i = 0; i < count; i++) {
          const spread = (Math.random() - 0.5) * 12;
          const angle = Math.random() * Math.PI * 2;
          const ejectSpeed = Math.random() * 1.5 + 0.5;
          const vx = -dx * 0.15 + Math.cos(angle) * ejectSpeed;
          const vy = -dy * 0.15 + Math.sin(angle) * ejectSpeed;

          spawnSparkle(
            e.clientX + spread,
            e.clientY + spread,
            vx,
            vy,
            Math.random() > 0.4 ? 'star' : 'ember'
          );
        }
      }

      // 2. High-speed Whip Effect: Supernova ember burst when moving vigorously
      if (speed > 35 && particles.length < 140) {
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const blastSpeed = Math.random() * 3.0 + 1.0;
          spawnSparkle(
            e.clientX,
            e.clientY,
            Math.cos(angle) * blastSpeed,
            Math.sin(angle) * blastSpeed,
            'star',
            1.4
          );
        }
      }

      prevMousePos.current.x = e.clientX;
      prevMousePos.current.y = e.clientY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      lastMoveTimeRef.current = performance.now();
      isMouseDownRef.current = true;
      setIsClicked(true);

      // 1. Dual Shockwave Rings
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 6,
        maxRadius: 48,
        alpha: 0.9,
        color: '#FF5A1F',
        width: 2.5,
      });

      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 3,
        maxRadius: 72,
        alpha: 0.65,
        color: '#FF304F',
        width: 1.5,
      });

      // 2. 360-Degree Fireworks Star Burst!
      const burstCount = 18;
      for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.35;
        const velocity = Math.random() * 4.2 + 2.0;
        spawnSparkle(
          e.clientX,
          e.clientY,
          Math.cos(angle) * velocity,
          Math.sin(angle) * velocity,
          i % 3 === 0 ? 'star' : i % 3 === 1 ? 'confetti' : 'ember',
          1.5
        );
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      setIsClicked(false);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => {
      setIsVisible(false);
      ribbonTrail.length = 0;
      particles.length = 0;
      shockwaves.length = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Star Drawing Helper (crisp 4-point diamond star)
    const drawStar = (
      pX: number,
      pY: number,
      outerR: number,
      innerR: number,
      rotation: number,
      color: string,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(pX, pY);
      ctx.rotate(rotation);
      ctx.beginPath();
      const spikes = 4;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      ctx.moveTo(0, -outerR);
      for (let i = 0; i < spikes; i++) {
        let sx = Math.cos(rot) * outerR;
        let sy = Math.sin(rot) * outerR;
        ctx.lineTo(sx, sy);
        rot += step;
        sx = Math.cos(rot) * innerR;
        sy = Math.sin(rot) * innerR;
        ctx.lineTo(sx, sy);
        rot += step;
      }
      ctx.lineTo(0, -outerR);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.shadowColor = color;
      ctx.shadowBlur = isDark ? 8 : 4;
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const targetX = mousePos.current.targetX;
      const targetY = mousePos.current.targetY;

      mousePos.current.x = targetX;
      mousePos.current.y = targetY;

      const now = performance.now();
      const timeSinceMove = now - lastMoveTimeRef.current;

      // 1. Smoothly expire ribbon trail points so the tail retracts when stopped
      while (ribbonTrail.length > 0 && (now - ribbonTrail[0].time > 180)) {
        ribbonTrail.shift();
      }
      if (timeSinceMove > 40 && ribbonTrail.length > 0) {
        ribbonTrail.shift();
      }

      // 2. Smooth idle fade factor:
      // When stationary on a point for > 200ms, start gently fading out over the next 300ms
      let targetIdle = 1.0;
      if (timeSinceMove > 200) {
        const elapsed = Math.min(1, (timeSinceMove - 200) / 300);
        // If hovering over an interactive button, maintain a subtle 35% focus halo
        // Otherwise fade all the way to 0 (effects slightly disappear!)
        targetIdle = isHovered ? (1 - elapsed * 0.65) : (1 - elapsed);
      }
      activityFactorRef.current += (targetIdle - activityFactorRef.current) * 0.16;
      const idleOpacity = Math.max(0, Math.min(1, activityFactorRef.current));

      // Smooth follower interpolation
      followerPos.current.x += (targetX - followerPos.current.x) * 0.24;
      followerPos.current.y += (targetY - followerPos.current.y) * 0.24;

      const deltaX = targetX - followerPos.current.x;
      const deltaY = targetY - followerPos.current.y;
      const currentSpeed = Math.hypot(deltaX, deltaY);

      // Update Satellites Rotation speed (spins faster with movement!)
      const speedBoost = Math.min(0.2, currentSpeed * 0.008);
      orbitAngle1 += 0.045 + speedBoost;
      orbitAngle2 -= 0.06 + speedBoost;
      orbitAngle3 += 0.035 + speedBoost;

      // Update Direct Pinpoint Laser Dot (gently softens when stopped)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
        dotRef.current.style.opacity = Math.max(0.25, idleOpacity).toFixed(3);
      }

      // Update Interactive Follower Ring with Squash & Stretch (fades out when stopped)
      if (ringRef.current) {
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        const stretch = Math.min(1.4, 1 + currentSpeed * 0.014);
        const squash = Math.max(0.72, 1 - currentSpeed * 0.008);

        ringRef.current.style.transform = `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0) rotate(${angle}deg) scale(${stretch}, ${squash})`;
        ringRef.current.style.opacity = idleOpacity.toFixed(3);
      }

      // If mouse is being held down (plasma charging mode)
      if (isMouseDownRef.current && particles.length < 140) {
        for (let i = 0; i < 2; i++) {
          const orbitR = Math.random() * 26 + 12;
          const theta = Math.random() * Math.PI * 2;
          const sx = targetX + Math.cos(theta) * orbitR;
          const sy = targetY + Math.sin(theta) * orbitR;
          const pullSpeed = 1.8;
          spawnSparkle(
            sx,
            sy,
            -Math.cos(theta) * pullSpeed,
            -Math.sin(theta) * pullSpeed,
            'ember',
            0.9
          );
        }
      }

      // 1. Render Silky Liquid Comet Ribbon Trail (fades out gracefully when stopped)
      if (ribbonTrail.length > 2 && idleOpacity > 0.02) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 0; i < ribbonTrail.length - 1; i++) {
          const p1 = ribbonTrail[i];
          const p2 = ribbonTrail[i + 1];

          const progress = i / (ribbonTrail.length - 1); // 0 at tail, 1 at head
          const strokeWidth = progress * 6.5 + 0.8;
          const alpha = progress * (isDark ? 0.65 : 0.45) * idleOpacity;

          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          grad.addColorStop(0, '#FF5A1F');
          grad.addColorStop(1, '#FF304F');

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          ctx.strokeStyle = grad;
          ctx.lineWidth = strokeWidth;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = '#FF5A1F';
          ctx.shadowBlur = isDark ? 8 : 3;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Render Orbiting Gyroscope Satellites (fades out when stopped)
      if (idleOpacity > 0.02) {
        const orbitBaseR = isHovered ? 26 : 17;
        const orbitPoints = [
          {
            x: followerPos.current.x + Math.cos(orbitAngle1) * orbitBaseR,
            y: followerPos.current.y + Math.sin(orbitAngle1) * orbitBaseR * 0.75,
            color: '#FF5A1F',
            size: 2.4,
          },
          {
            x: followerPos.current.x + Math.cos(orbitAngle2) * (orbitBaseR + 4),
            y: followerPos.current.y + Math.sin(orbitAngle2) * (orbitBaseR + 4) * 0.85,
            color: '#FF304F',
            size: 2.0,
          },
          {
            x: followerPos.current.x + Math.cos(orbitAngle3) * (orbitBaseR - 3),
            y: followerPos.current.y + Math.sin(orbitAngle3) * (orbitBaseR - 3) * 0.65,
            color: isDark ? '#F4F7FB' : '#2563EB',
            size: 1.8,
          },
        ];

        for (const orb of orbitPoints) {
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
          ctx.fillStyle = orb.color;
          ctx.globalAlpha = (isHovered ? 0.95 : 0.8) * idleOpacity;
          ctx.shadowColor = orb.color;
          ctx.shadowBlur = isDark ? 7 : 3;
          ctx.fill();
        }
      }

      // 3. Render Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.16 + 1.2;
        sw.alpha *= 0.9;

        if (sw.alpha <= 0.02 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = sw.width;
        ctx.globalAlpha = sw.alpha;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = isDark ? 12 : 5;
        ctx.stroke();
      }

      // 4. Render Sparkling Particles (Twinkling Stars, Embers, Confetti)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const currentScale = Math.max(0.2, p.alpha);

        if (p.type === 'star') {
          const outer = p.size * currentScale;
          const inner = outer * 0.32;
          drawStar(p.x, p.y, outer, inner, p.rotation, p.color, p.alpha);
        } else if (p.type === 'confetti') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.fillRect(-p.size * 0.5, -p.size * 0.25, p.size, p.size * 0.5);
          ctx.restore();
        } else {
          // Soft Glowing Ember
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.6, p.size * currentScale), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = isDark ? 8 : 4;
          ctx.fill();
        }
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
  }, [isVisible, isDark]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 1. Interactive Fluid Particle & Ribbon Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* 2. Magnetic Follower Halo Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none -mt-4 -ml-4 will-change-transform"
        style={{ width: '32px', height: '32px' }}
      >
        <div
          className={`w-full h-full rounded-full transition-all duration-200 flex items-center justify-center relative ${
            isHovered
              ? isDark
                ? 'scale-150 border-2 border-[#F4F7FB] bg-[#F4F7FB]/15 shadow-[0_0_22px_rgba(244,247,251,0.6)]'
                : 'scale-150 border-2 border-[#0F172A] bg-[#0F172A]/10 shadow-[0_0_16px_rgba(15,23,42,0.25)]'
              : isClicked
              ? 'scale-75 border-2 border-[#FF304F] bg-[#FF5A1F]/35 shadow-[0_0_18px_rgba(255,90,31,0.8)]'
              : isDark
              ? 'scale-100 border border-[#FF5A1F]/60 bg-[#FF5A1F]/10 shadow-[0_0_12px_rgba(255,90,31,0.35)]'
              : 'scale-100 border border-[#FF5A1F] bg-[#FF5A1F]/15 shadow-[0_0_10px_rgba(255,90,31,0.25)]'
          }`}
        >
          {/* Target Reticle Crosshairs when hovering interactive element */}
          {isHovered && (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] animate-ping" />
              <div className="absolute -top-1 w-1.5 h-0.5 bg-[#FF5A1F] rounded" />
              <div className="absolute -bottom-1 w-1.5 h-0.5 bg-[#FF5A1F] rounded" />
              <div className="absolute -left-1 w-0.5 h-1.5 bg-[#FF5A1F] rounded" />
              <div className="absolute -right-1 w-0.5 h-1.5 bg-[#FF5A1F] rounded" />
            </>
          )}
        </div>
      </div>

      {/* 3. Center Precision Laser Pinpoint Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none -mt-1 -ml-1 will-change-transform"
        style={{ width: '8px', height: '8px' }}
      >
        <div
          className={`w-full h-full rounded-full transition-all duration-150 ${
            isHovered
              ? 'bg-[#F4F7FB] shadow-[0_0_12px_#F4F7FB] scale-125'
              : isClicked
              ? 'bg-[#FF304F] shadow-[0_0_14px_#FF304F] scale-75'
              : isDark
              ? 'bg-[#FF5A1F] shadow-[0_0_10px_#FF5A1F]'
              : 'bg-[#FF5A1F] shadow-[0_0_8px_rgba(255,90,31,0.8)]'
          }`}
        />
      </div>
    </div>
  );
};

export const CustomCursor: React.FC = () => {
  const location = useLocation();
  const isEditorPage = location.pathname.startsWith('/editor');

  // Keep editor completely free of custom cursor for 100% native code editing & text selection
  if (isEditorPage) {
    return null;
  }

  return <CustomCursorContent />;
};

export default CustomCursor;
