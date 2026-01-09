"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Quote } from "@/components/Quote";
import { Onboarding } from "@/components/Onboarding";
import { Greeting } from "@/components/Greeting";
import { ActionButtons } from "@/components/ActionButtons";
import { ReflectionEditor } from "@/components/ReflectionEditor";
import { PageTransition } from "@/components/PageTransition";
import { QuoteSkeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { getTodaysQuote, getRandomQuote, getRandomAuthor, getTodaysQuoteByAuthor, getRandomQuoteByAuthor } from "@/lib/quotes";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import { hasShownFirstFavoriteConfetti, markFirstFavoriteConfettiShown } from "@/components/Confetti";
import { getPreferences } from "@/lib/preferences";
import { isFavorite, addFavorite, removeFavorite, getFavorites } from "@/lib/favorites";
import { getFreshPullsToday, incrementFreshPulls, recordQuoteShown } from "@/lib/history";
import type { Quote as QuoteType } from "@/types";

// Lazy load rarely-used modal components
const KeyboardShortcutsHelp = dynamic(() => import("@/components/KeyboardShortcutsHelp").then(mod => ({ default: mod.KeyboardShortcutsHelp })), { ssr: false });
const PhilosopherModeActivated = dynamic(() => import("@/components/PhilosopherMode").then(mod => ({ default: mod.PhilosopherModeActivated })), { ssr: false });
const Confetti = dynamic(() => import("@/components/Confetti").then(mod => ({ default: mod.Confetti })), { ssr: false });

type PageState = "loading" | "onboarding" | "quote";

export default function Home() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [userName, setUserName] = useState<string>("");
  const [currentQuote, setCurrentQuote] = useState<QuoteType>(getTodaysQuote());
  const [showReflection, setShowReflection] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [remainingPulls, setRemainingPulls] = useState<number>(3);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [philosopherMode, setPhilosopherMode] = useState<string | null>(null);
  const [showPhilosopherActivated, setShowPhilosopherActivated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { showToast } = useToast();

  // Konami code easter egg
  const handleKonamiCode = useCallback(() => {
    if (philosopherMode) return; // Already active
    const randomPhilosopher = getRandomAuthor();
    setPhilosopherMode(randomPhilosopher);
    setShowPhilosopherActivated(true);
    // Switch to a quote from this philosopher
    setCurrentQuote(getTodaysQuoteByAuthor(randomPhilosopher));
  }, [philosopherMode]);

  useKonamiCode(handleKonamiCode);

  // Keyboard shortcut handlers
  const handleKeyboardSave = useCallback(async () => {
    if (pageState !== "quote") return;
    if (isSaved) {
      await removeFavorite(currentQuote.id);
      setIsSaved(false);
      showToast("Removed from favorites");
    } else {
      // Check if this is the very first favorite
      const isFirstFavorite = !hasShownFirstFavoriteConfetti();
      const currentFavorites = await getFavorites();
      const isActuallyFirst = isFirstFavorite && currentFavorites.length === 0;

      await addFavorite(currentQuote.id);
      setIsSaved(true);
      showToast("Saved to favorites");

      // Trigger confetti on first favorite ever
      if (isActuallyFirst) {
        setShowConfetti(true);
        markFirstFavoriteConfettiShown();
      }
    }
  }, [pageState, isSaved, currentQuote.id, showToast]);

  const handleKeyboardReflect = useCallback(() => {
    if (pageState !== "quote") return;
    setShowReflection((prev) => !prev);
  }, [pageState]);

  const handleKeyboardEscape = useCallback(() => {
    if (showShortcutsHelp) {
      setShowShortcutsHelp(false);
    } else if (showReflection) {
      setShowReflection(false);
    }
  }, [showShortcutsHelp, showReflection]);

  const handleKeyboardHelp = useCallback(() => {
    setShowShortcutsHelp((prev) => !prev);
  }, []);

  useKeyboardShortcuts({
    onSave: handleKeyboardSave,
    onReflect: handleKeyboardReflect,
    onEscape: handleKeyboardEscape,
    onHelp: handleKeyboardHelp,
  });

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
      showToast("Removed from favorites");
    } else {
      // Check if this is the very first favorite
      const isFirstFavorite = !hasShownFirstFavoriteConfetti();
      const currentFavorites = await getFavorites();
      const isActuallyFirst = isFirstFavorite && currentFavorites.length === 0;

      await addFavorite(currentQuote.id);
      setIsSaved(true);
      showToast("Saved to favorites");

      // Trigger confetti on first favorite ever
      if (isActuallyFirst) {
        setShowConfetti(true);
        markFirstFavoriteConfettiShown();
      }
    }
  };

  const handleReflect = () => {
    setShowReflection((prev) => !prev);
  };

  const handleAnother = async () => {
    if (remainingPulls <= 0) return;

    // Capture the current quote ID before changing
    const rejectedQuoteId = currentQuote.id;

    // Use philosopher-specific quotes if in philosopher mode
    const newQuote = philosopherMode
      ? getRandomQuoteByAuthor(philosopherMode, currentQuote.id)
      : getRandomQuote(currentQuote.id);
    setCurrentQuote(newQuote);
    setShowReflection(false);

    // Record the fresh pull and 'another' signal for rejected quote
    await incrementFreshPulls(newQuote.id, rejectedQuoteId);
    setRemainingPulls((prev) => Math.max(0, prev - 1));
  };

  if (pageState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <main className="w-full">
          <QuoteSkeleton />
        </main>
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
    <>
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
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
        context="home"
      />
      {showPhilosopherActivated && philosopherMode && (
        <PhilosopherModeActivated
          philosopher={philosopherMode}
          onDismiss={() => setShowPhilosopherActivated(false)}
        />
      )}
      <Confetti
        isActive={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </>
  );
}
