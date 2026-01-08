"use client";

import { useState } from "react";

interface OnboardingProps {
  onComplete?: (data: { name: string; notificationTime: string }) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState("");

  const handleNext = () => {
    // For now, just log - will wire up in US-010/US-012
    console.log("Name entered:", name);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="quote-text mb-8">What should we call you?</h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 text-lg bg-transparent border-b-2 border-foreground/20
                     focus:border-foreground/50 focus:outline-none text-center body-text
                     placeholder:text-foreground/30 transition-colors"
          autoFocus
        />
        <button
          onClick={handleNext}
          disabled={!name.trim()}
          className="mt-8 px-8 py-3 bg-foreground text-background body-text
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:opacity-90 transition-opacity rounded-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
