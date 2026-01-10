"use client";

import { useState, useEffect } from "react";

type AnimationStyle = "A" | "B" | "C" | "D";

const styles = {
  A: {
    name: "Slow Drift",
    description: "Very slow, dreamlike. Elements float apart like clouds. (1.5s)",
    duration: 1500,
  },
  B: {
    name: "Gentle Wave",
    description: "Medium pace, smooth wave-like motion. Natural and calm. (1.2s)",
    duration: 1200,
  },
  C: {
    name: "Soft Breath",
    description: "Organic, like breathing. Subtle and meditative. (1s)",
    duration: 1000,
  },
  D: {
    name: "Silk Curtain",
    description: "Elegant, theatrical. Graceful but not rushed. (0.8s)",
    duration: 800,
  },
};

export default function AnimationLab() {
  const [activeStyle, setActiveStyle] = useState<AnimationStyle>("B");
  const [isReflecting, setIsReflecting] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const style = styles[activeStyle];
  const duration = style.duration;
  const easing = "cubic-bezier(0.4, 0, 0.15, 1)"; // Smooth, organic easing

  // Handle editor visibility with proper exit animation
  useEffect(() => {
    if (isReflecting) {
      // Entering: show editor after a brief delay
      const timer = setTimeout(() => setShowEditor(true), duration * 0.2);
      return () => clearTimeout(timer);
    } else {
      // Exiting: fade editor first, then hide
      setIsExiting(true);
      const timer = setTimeout(() => {
        setShowEditor(false);
        setIsExiting(false);
      }, duration * 0.6);
      return () => clearTimeout(timer);
    }
  }, [isReflecting, duration]);

  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#1a1a1a] overflow-hidden">
      {/* Style selector - fixed at top */}
      <div className="fixed top-0 left-0 right-0 bg-[#fafaf8]/90 backdrop-blur-sm border-b border-black/5 z-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 mb-3 flex-wrap">
            {(Object.keys(styles) as AnimationStyle[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveStyle(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeStyle === key
                    ? "bg-[#1a1a1a] text-[#fafaf8]"
                    : "bg-black/5 hover:bg-black/10"
                }`}
              >
                {key}: {styles[key].name}
              </button>
            ))}
          </div>
          <p className="text-sm text-black/50">{style.description}</p>
        </div>
      </div>

      {/* Main content area - the whole thing transitions smoothly */}
      <div
        className="flex min-h-screen"
        style={{
          transition: `all ${duration}ms ${easing}`,
          alignItems: isReflecting ? "flex-start" : "center",
          justifyContent: "center",
          paddingTop: isReflecting ? "9rem" : "7rem",
        }}
      >
        <main className="w-full max-w-2xl mx-auto px-6">
          {/* Greeting */}
          <div
            className="text-center mb-2"
            style={{
              transition: `all ${duration}ms ${easing}`,
              opacity: isReflecting ? 0.2 : 1,
              transform: isReflecting ? "scale(0.96) translateY(-8px)" : "scale(1) translateY(0)",
              filter: isReflecting ? "blur(2px)" : "blur(0)",
            }}
          >
            <p className="text-black/50 text-sm">Good winter morning, John</p>
          </div>

          {/* Quote - this is the key element that shouldn't jump */}
          <blockquote
            className="text-center"
            style={{
              transition: `all ${duration}ms ${easing}`,
              transitionDelay: `${duration * 0.1}ms`,
              opacity: isReflecting ? 0.4 : 1,
              transform: isReflecting ? "scale(0.97)" : "scale(1)",
              padding: isReflecting ? "1rem 0" : "2rem 0",
            }}
          >
            <p className="font-serif text-2xl md:text-3xl leading-relaxed mb-6">
              The art of knowing is knowing what to ignore.
            </p>
            <footer className="text-black/60">
              <cite className="not-italic">
                — Rumi
                <span className="block text-sm mt-1 text-black/40">
                  Selected Poems
                </span>
              </cite>
            </footer>
          </blockquote>

          {/* Actions */}
          <div
            className="flex justify-center gap-8 py-4"
            style={{
              transition: `all ${duration}ms ${easing}`,
              transitionDelay: `${duration * 0.15}ms`,
              opacity: isReflecting ? 0.15 : 1,
              transform: isReflecting ? "scale(0.94) translateY(4px)" : "scale(1) translateY(0)",
              filter: isReflecting ? "blur(1px)" : "blur(0)",
            }}
          >
            <button className="p-2 text-black/30 hover:text-black/50 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
            <button
              onClick={() => setIsReflecting(!isReflecting)}
              className={`p-2 transition-colors ${
                isReflecting ? "text-black/70" : "text-black/30 hover:text-black/50"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
            <button className="p-2 text-black/30 hover:text-black/50 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
            <button className="p-2 text-black/30 hover:text-black/50 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            </button>
          </div>

          {/* Reflection editor - always rendered, controlled by opacity/transform */}
          <div
            className="max-w-[65ch] mx-auto px-6 overflow-hidden"
            style={{
              transition: `all ${duration}ms ${easing}`,
              opacity: showEditor && !isExiting ? 1 : 0,
              transform: showEditor && !isExiting
                ? "translateY(0) scale(1)"
                : "translateY(24px) scale(0.98)",
              maxHeight: showEditor ? "500px" : "0",
              paddingTop: showEditor ? "2rem" : "0",
              paddingBottom: showEditor ? "2rem" : "0",
            }}
          >
            <textarea
              className="w-full bg-transparent resize-none outline-none font-serif text-lg leading-relaxed placeholder:text-black/40 min-h-[200px]"
              placeholder="What does this stir in you?"
              disabled={!showEditor}
            />
          </div>
        </main>
      </div>

      {/* Toggle button - fixed at bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => setIsReflecting(!isReflecting)}
          className="px-6 py-3 bg-[#1a1a1a] text-[#fafaf8] rounded-full text-sm font-medium shadow-lg hover:scale-105 transition-transform"
        >
          {isReflecting ? "Exit Reflection" : "Enter Reflection Mode"}
        </button>
      </div>
    </div>
  );
}
