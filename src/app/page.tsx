"use client";

import { useEffect, useState } from "react";
import { Quote } from "@/components/Quote";
import { Onboarding } from "@/components/Onboarding";
import { Greeting } from "@/components/Greeting";
import { ActionButtons } from "@/components/ActionButtons";
import { ReflectionEditor } from "@/components/ReflectionEditor";
import { getTodaysQuote, getRandomQuote } from "@/lib/quotes";
import { getPreferences } from "@/lib/preferences";
import { isFavorite, addFavorite, removeFavorite } from "@/lib/favorites";
import type { Quote as QuoteType } from "@/types";

type PageState = "loading" | "onboarding" | "quote";

export default function Home() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [userName, setUserName] = useState<string>("");
  const [currentQuote, setCurrentQuote] = useState<QuoteType>(getTodaysQuote());
  const [showReflection, setShowReflection] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const prefs = await getPreferences();
      if (prefs) {
        setUserName(prefs.name);
        setPageState("quote");
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

  const handleAnother = () => {
    // TODO: Will be wired to daily limit in US-024
    const newQuote = getRandomQuote(currentQuote.id);
    setCurrentQuote(newQuote);
    setShowReflection(false);
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
        />
        {showReflection && (
          <ReflectionEditor quoteId={currentQuote.id} />
        )}
      </main>
    </div>
  );
}
