import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, X, Trophy, PartyPopper } from 'lucide-react';

interface AnimalCelebrationProps {
  show: boolean;
  onDismiss?: () => void;
}

const ANIMALS = [
  { emoji: '🦁', name: 'Party Lion', delay: '0s', label: 'Roar of Success!' },
  { emoji: '🐼', name: 'Dancing Panda', delay: '0.15s', label: 'Pandastic Run!' },
  { emoji: '🦊', name: 'Happy Fox', delay: '0.3s', label: 'Super Clever!' },
  { emoji: '🦄', name: 'Magic Unicorn', delay: '0.45s', label: 'Pure Magic!' },
  { emoji: '🐱', name: 'Cheering Cat', delay: '0.2s', label: 'Purrfect Code!' },
  { emoji: '🐶', name: 'Joyful Puppy', delay: '0.35s', label: 'Pawsome Job!' },
  { emoji: '🐻', name: 'Celebrating Bear', delay: '0.1s', label: 'Unbearably Fast!' },
  { emoji: '🐰', name: 'Bouncing Bunny', delay: '0.4s', label: 'Zero Bugs!' },
  { emoji: '🐸', name: 'Grooving Frog', delay: '0.25s', label: 'Leap Ahead!' },
  { emoji: '🦝', name: 'Party Raccoon', delay: '0.5s', label: 'Clean Execution!' },
];

const FIREWORKS = ['🎆', '💥', '🎇', '✨', '🎉', '🌟', '💥', '🎆'];
const CONFETTI_ITEMS = ['🎉', '✨', '🌟', '🎈', '💫', '🎊', '⭐', '🚀', '🔥', '🏆'];

export const AnimalCelebration: React.FC<AnimalCelebrationProps> = ({ show, onDismiss }) => {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] pointer-events-none flex flex-col justify-between overflow-hidden p-4">
      {/* 1. Animated Fireworks Explosions */}
      <div className="absolute inset-0 pointer-events-none">
        {FIREWORKS.map((fw, i) => (
          <div
            key={i}
            className="absolute text-4xl sm:text-5xl"
            style={{
              top: `${15 + (i * 12) % 65}%`,
              left: `${8 + (i * 14) % 84}%`,
              animation: `fireworkPop 2s ease-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {fw}
          </div>
        ))}
      </div>

      {/* 2. Falling Party Confetti Stream */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-xl sm:text-2xl animate-confettiFall"
            style={{
              left: `${(i * 3.5) % 100}%`,
              animationDelay: `${(i * 0.1) % 2}s`,
              animationDuration: `${2.2 + (i % 3) * 0.6}s`,
            }}
          >
            {CONFETTI_ITEMS[i % CONFETTI_ITEMS.length]}
          </div>
        ))}
      </div>

      {/* 3. Top Animated Marching Animal Parade */}
      <div className="w-full relative h-16 overflow-hidden pointer-events-none mt-12">
        <div className="absolute top-0 left-0 flex items-center gap-6 animate-march">
          {ANIMALS.concat(ANIMALS).map((a, i) => (
            <div
              key={i}
              className="text-4xl filter drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]"
              style={{
                animation: `animalDance 0.8s ease-in-out infinite alternate`,
                animationDelay: `${(i * 0.1) % 0.5}s`,
              }}
            >
              {a.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bottom Main Celebration Banner */}
      <div className={`pointer-events-auto glass-box border-2 border-[#FF5A1F] p-4 sm:p-5 rounded-2xl shadow-[0_0_50px_rgba(255,90,31,0.45)] max-w-2xl w-full mx-auto text-center relative overflow-hidden animate-bannerPop mb-4 transition-colors duration-300 ${
        isDark ? 'bg-[#121620]/95 text-[#F4F7FB]' : 'bg-white/95 text-[#0F172A]'
      }`}>
        {/* Glow background circles */}
        <div className="absolute -top-10 -left-10 w-36 h-36 bg-[#FF5A1F]/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-[#FF304F]/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={() => {
            setVisible(false);
            if (onDismiss) onDismiss();
          }}
          className={`absolute top-3 right-3 transition-colors p-1.5 rounded-lg ${
            isDark ? 'text-white/50 hover:text-white neo-inset' : 'text-slate-400 hover:text-slate-800 bg-slate-100'
          }`}
          title="Close Celebration"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <PartyPopper className="w-5 h-5 text-amber-400 animate-bounce" />
          <h4 className={`text-base sm:text-lg font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Execution Successful!
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF5A1F] to-[#FF304F] text-[#F4F7FB] font-mono font-bold shadow-[0_0_15px_rgba(255,90,31,0.45)]">
              Exit Code 0
            </span>
          </h4>
          <Sparkles className="w-5 h-5 text-[#FF5A1F] animate-pulse" />
        </div>

        <p className={`text-xs font-sans mb-3 ${isDark ? 'text-white/80' : 'text-slate-600'}`}>
          The Animal Squad is marching & dancing to celebrate your successful code execution! 🎉
        </p>

        {/* Animals Parade Row */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-1 px-1">
          {ANIMALS.map((animal, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-125"
              style={{
                animation: `animalDance 1s ease-in-out infinite alternate`,
                animationDelay: animal.delay,
              }}
              title={`${animal.name}: ${animal.label}`}
            >
              <div className="relative text-3xl sm:text-4xl filter drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">
                {animal.emoji}
                <span className="absolute -top-2 -right-1 text-xs">🎉</span>
              </div>
              <span className={`text-[9px] font-mono font-bold mt-1 opacity-90 whitespace-nowrap ${
                isDark ? 'text-[#F4F7FB]' : 'text-slate-800'
              }`}>
                {animal.name}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
