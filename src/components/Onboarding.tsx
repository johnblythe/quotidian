"use client";

import { useState } from "react";
import { savePreferences } from "@/lib/preferences";

interface OnboardingProps {
  onComplete?: (data: { name: string; notificationTime: string }) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [notificationTime, setNotificationTime] = useState("08:00");

  const handleNext = () => {
    setStep(2);
  };

  const handleComplete = async () => {
    const data = { name: name.trim(), notificationTime };
    await savePreferences(data);
    onComplete?.(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {step === 1 ? (
          <>
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
              className="btn-primary mt-8 px-8 py-3 bg-foreground text-background body-text
                         disabled:opacity-30 disabled:cursor-not-allowed rounded-sm"
            >
              Next
            </button>
          </>
        ) : (
          <>
            <h1 className="quote-text mb-8">
              When would you like your daily reflection?
            </h1>
            <input
              type="time"
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
              className="w-full px-4 py-3 text-lg bg-transparent border-b-2 border-foreground/20
                         focus:border-foreground/50 focus:outline-none text-center body-text
                         transition-colors appearance-none"
              autoFocus
            />
            <p className="mt-4 text-sm text-foreground/50 body-text">
              We&apos;ll send you a gentle reminder at this time each day
            </p>
            <button
              onClick={handleComplete}
              className="btn-primary mt-8 px-8 py-3 bg-foreground text-background body-text rounded-sm"
            >
              Complete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
