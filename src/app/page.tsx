"use client";

import { useEffect, useState } from "react";
import { Quote } from "@/components/Quote";
import { Onboarding } from "@/components/Onboarding";
import { Greeting } from "@/components/Greeting";
import { ActionButtons } from "@/components/ActionButtons";
import { ReflectionEditor } from "@/components/ReflectionEditor";
import { PageTransition } from "@/components/PageTransition";
import { getTodaysQuote, getRandomQuote } from "@/lib/quotes";
import { getPreferences } from "@/lib/preferences";
import { isFavorite, addFavorite, removeFavorite } from "@/lib/favorites";
import { getFreshPullsToday, incrementFreshPulls, recordQuoteShown } from "@/lib/history";
import type { Quote as QuoteType } from "@/types";

type PageState = "loading" | "onboarding" | "quote";

export default function Home() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [userName, setUserName] = useState<string>("");
  const [currentQuote, setCurrentQuote] = useState<QuoteType>(getTodaysQuote());
  const [showReflection, setShowReflection] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [remainingPulls, setRemainingPulls] = useState<number>(3);

  useEffect(() => {
    const checkOnboarding = async () => {
      const prefs = await getPreferences();
      if (prefs) {
        setUserName(prefs.name);
        setPageState("quote");
        // Check remaining pulls for today
        const pullsUsed = await getFreshPullsToday();
        setRemainingPulls(Math.max(0, 3 - pullsUsed));
        // Record today's quote being shown
        await recordQuoteShown(getTodaysQuote().id, false);
      } else {
        setPageState("onboarding");
      }
    };
    checkOnboarding();
  }, []);

  // Check favorite status when quote changes
  useEffect(() => {
    const checkFavorite = async () => {
      const saved = await isFavorite(currentQuote.id);
      setIsSaved(saved);
    };
    checkFavorite();
  }, [currentQuote.id]);

  const handleSave = async () => {
    if (isSaved) {
      await removeFavorite(currentQuote.id);
      setIsSaved(false);
    } else {
      await addFavorite(currentQuote.id);
      setIsSaved(true);
    }
  };

  const handleReflect = () => {
    setShowReflection((prev) => !prev);
  };

  const handleAnother = async () => {
    if (remainingPulls <= 0) return;

    const newQuote = getRandomQuote(currentQuote.id);
    setCurrentQuote(newQuote);
    setShowReflection(false);

    // Record the fresh pull and decrement remaining
    await incrementFreshPulls(newQuote.id);
    setRemainingPulls((prev) => Math.max(0, prev - 1));
  };

  if (pageState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-foreground/30 body-text">Loading...</div>
      </div>
    );
  }

  if (pageState === "onboarding") {
    return (
      <Onboarding
        onComplete={async () => {
          const prefs = await getPreferences();
          if (prefs) {
            setUserName(prefs.name);
          }
          setPageState("quote");
        }}
      />
    );
  }

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center">
        <main className="w-full">
          {userName && <Greeting name={userName} />}
          <Quote quote={currentQuote} />
          <ActionButtons
            onSave={handleSave}
            onReflect={handleReflect}
            onAnother={handleAnother}
            isSaved={isSaved}
            isReflecting={showReflection}
            remainingPulls={remainingPulls}
          />
          {showReflection && (
            <ReflectionEditor quoteId={currentQuote.id} />
          )}
        </main>
      </div>
    </PageTransition>
  );
}
