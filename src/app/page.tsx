"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Quote } from "@/components/Quote";
import { Onboarding } from "@/components/Onboarding";
import { Greeting } from "@/components/Greeting";
import { JourneyHeader } from "@/components/JourneyHeader";
import { ActionButtons } from "@/components/ActionButtons";
import { ReflectionEditor } from "@/components/ReflectionEditor";
import { PageTransition } from "@/components/PageTransition";
import { QuoteSkeleton } from "@/components/Skeleton";
import { useToast } from "@/components/Toast";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { getTodaysQuote, getRandomQuote, getRandomAuthor, getTodaysQuoteByAuthor, getRandomQuoteByAuthor, getJourneyQuote, getCollectionQuote } from "@/lib/quotes";
import { getCollection } from "@/lib/collections";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import { hasShownFirstFavoriteConfetti, markFirstFavoriteConfettiShown } from "@/components/Confetti";
import { getPreferences, markPersonalizationCelebrated, hasPersonalizationCelebrated } from "@/lib/preferences";
import { checkAlgorithmStatus } from "@/lib/signals";
import { isFavorite, addFavorite, removeFavorite, getFavorites } from "@/lib/favorites";
import { getFreshPullsToday, incrementFreshPulls, recordQuoteShown } from "@/lib/history";
import { getActiveJourney, addQuoteToJourney, deleteActiveJourney, completeActiveJourney, advanceJourneyDay } from "@/lib/journeys";
import { recordAppOpen } from "@/lib/engagement";
import { useAuth } from "@/hooks/useAuth";
import journeysData from "@/data/journeys.json";
import type { Quote as QuoteType, JourneyDefinition, UserJourney, Collection } from "@/types";

const journeyDefinitions = journeysData as JourneyDefinition[];

// Lazy load rarely-used modal components
const KeyboardShortcutsHelp = dynamic(() => import("@/components/KeyboardShortcutsHelp").then(mod => ({ default: mod.KeyboardShortcutsHelp })), { ssr: false });
const PhilosopherModeActivated = dynamic(() => import("@/components/PhilosopherMode").then(mod => ({ default: mod.PhilosopherModeActivated })), { ssr: false });
const Confetti = dynamic(() => import("@/components/Confetti").then(mod => ({ default: mod.Confetti })), { ssr: false });
const PersonalizationUnlocked = dynamic(() => import("@/components/PersonalizationUnlocked").then(mod => ({ default: mod.PersonalizationUnlocked })), { ssr: false });
const JourneyCompletion = dynamic(() => import("@/components/JourneyCompletion").then(mod => ({ default: mod.JourneyCompletion })), { ssr: false });
const ShareModal = dynamic(() => import("@/components/ShareModal").then(mod => ({ default: mod.ShareModal })), { ssr: false });
const AddToCollectionModal = dynamic(() => import("@/components/AddToCollectionModal").then(mod => ({ default: mod.AddToCollectionModal })), { ssr: false });

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
  const [showPersonalizationUnlocked, setShowPersonalizationUnlocked] = useState(false);
  const [activeJourney, setActiveJourney] = useState<UserJourney | null>(null);
  const [journeyDefinition, setJourneyDefinition] = useState<JourneyDefinition | null>(null);
  const [journeyCollection, setJourneyCollection] = useState<Collection | null>(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [showJourneyCompletion, setShowJourneyCompletion] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const { showToast } = useToast();
  const { isSignedIn } = useAuth();

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

        // Record app open for engagement tracking
        await recordAppOpen();

        // Check remaining pulls for today
        const pullsUsed = await getFreshPullsToday();
        setRemainingPulls(Math.max(0, 3 - pullsUsed));

        // Check for active journey
        const journey = await getActiveJourney();
        if (journey) {
          // Handle collection-based journeys
          if (journey.type === 'collection' && journey.collectionId) {
            const collection = await getCollection(journey.collectionId);
            if (collection) {
              const duration = collection.quote_ids.length;
              // Check if journey is complete (day exceeds duration)
              if (journey.day > duration) {
                // Journey is complete - show celebration
                setActiveJourney(journey);
                setJourneyCollection(collection);
                setShowJourneyCompletion(true);
                // Mark as completed
                await completeActiveJourney();
                // Show today's regular quote
                await recordQuoteShown(getTodaysQuote().id, false);
              } else {
                // Journey is still in progress
                setActiveJourney(journey);
                setJourneyCollection(collection);
                // Get the next quote from the collection
                const collectionQuote = getCollectionQuote(
                  collection.quote_ids,
                  journey.quotesShown
                );
                if (collectionQuote) {
                  setCurrentQuote(collectionQuote);
                  // Track this quote in the journey
                  await addQuoteToJourney(collectionQuote.id);
                  await recordQuoteShown(collectionQuote.id, false);
                  // Advance to next day for tomorrow
                  await advanceJourneyDay();
                } else {
                  // No more quotes available - complete early
                  setShowJourneyCompletion(true);
                  await completeActiveJourney();
                  await recordQuoteShown(getTodaysQuote().id, false);
                }
              }
            } else {
              // Collection not found (may have been deleted) - end journey
              await deleteActiveJourney();
              await recordQuoteShown(getTodaysQuote().id, false);
            }
          } else {
            // Handle preset journeys
            const journeyDef = journeyDefinitions.find(j => j.id === journey.journeyId);
            if (journeyDef) {
              // Check if journey is complete (day exceeds duration)
              if (journey.day > journeyDef.duration) {
                // Journey is complete - show celebration
                setActiveJourney(journey);
                setJourneyDefinition(journeyDef);
                setShowJourneyCompletion(true);
                // Mark as completed
                await completeActiveJourney();
                // Show today's regular quote
                await recordQuoteShown(getTodaysQuote().id, false);
              } else {
                // Journey is still in progress
                setActiveJourney(journey);
                setJourneyDefinition(journeyDef);
                // Get a journey-specific quote
                const journeyQuote = getJourneyQuote(
                  journeyDef.filterType,
                  journeyDef.filterValue,
                  journey.quotesShown
                );
                if (journeyQuote) {
                  setCurrentQuote(journeyQuote);
                  // Track this quote in the journey
                  await addQuoteToJourney(journeyQuote.id);
                  await recordQuoteShown(journeyQuote.id, false);
                  // Advance to next day for tomorrow
                  await advanceJourneyDay();
                } else {
                  // No more quotes available for this journey - complete early
                  setShowJourneyCompletion(true);
                  await completeActiveJourney();
                  await recordQuoteShown(getTodaysQuote().id, false);
                }
              }
            }
          }
        } else {
          // Record today's quote being shown (non-journey)
          await recordQuoteShown(getTodaysQuote().id, false);
        }

        // Check if personalization was just enabled and hasn't been celebrated
        const alreadyCelebrated = await hasPersonalizationCelebrated();
        if (!alreadyCelebrated) {
          const { wasJustEnabled } = await checkAlgorithmStatus();
          if (wasJustEnabled) {
            setShowPersonalizationUnlocked(true);
            await markPersonalizationCelebrated();
          }
        }
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

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleAddToCollection = () => {
    setShowAddToCollectionModal(true);
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

  const handleExitJourney = () => {
    setShowExitConfirmation(true);
  };

  const handleConfirmExit = async () => {
    await deleteActiveJourney();
    setActiveJourney(null);
    setJourneyDefinition(null);
    setJourneyCollection(null);
    setShowExitConfirmation(false);
    // Set a new random quote for normal mode
    const newQuote = getTodaysQuote();
    setCurrentQuote(newQuote);
    await recordQuoteShown(newQuote.id, false);
    showToast("Journey exited");
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  const handleJourneyCompletionDismiss = () => {
    setShowJourneyCompletion(false);
    setActiveJourney(null);
    setJourneyDefinition(null);
    setJourneyCollection(null);
  };

  const handleStartAnotherJourney = () => {
    setShowJourneyCompletion(false);
    setActiveJourney(null);
    setJourneyDefinition(null);
    setJourneyCollection(null);
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
        <div className={`flex min-h-screen reflection-container ${
          showReflection
            ? "items-start reflection-container-active"
            : "items-center justify-center"
        }`}>
          <main className="w-full">
            {/* Greeting - fades first with slight upward drift */}
            <div className={`reflection-fade reflection-fade-delay-1 ${showReflection ? "reflection-active-greeting" : ""}`}>
              {activeJourney && journeyDefinition ? (
                <JourneyHeader
                  emoji={journeyDefinition.emoji}
                  title={journeyDefinition.title}
                  currentDay={activeJourney.day}
                  totalDays={journeyDefinition.duration}
                  onExit={handleExitJourney}
                />
              ) : activeJourney && journeyCollection ? (
                <JourneyHeader
                  emoji="📚"
                  title={journeyCollection.title}
                  currentDay={activeJourney.day}
                  totalDays={journeyCollection.quote_ids.length}
                  onExit={handleExitJourney}
                />
              ) : (
                userName && <Greeting name={userName} />
              )}
            </div>
            {/* Quote - fades second, stays more visible as context */}
            <Quote quote={currentQuote} isReflecting={showReflection} />
            {/* Actions - fade last and most dramatically */}
            <div className={`reflection-fade reflection-fade-delay-3 ${showReflection ? "reflection-active-actions" : ""}`}>
              <ActionButtons
                onSave={handleSave}
                onReflect={handleReflect}
                onAnother={handleAnother}
                onShare={handleShare}
                onAddToCollection={handleAddToCollection}
                isSaved={isSaved}
                isReflecting={showReflection}
                remainingPulls={remainingPulls}
                isSignedIn={isSignedIn}
              />
            </div>
            {/* Reflection editor - slides up gracefully */}
            {showReflection && (
              <div className="reflection-editor-enter">
                <ReflectionEditor quoteId={currentQuote.id} />
              </div>
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
      {showPersonalizationUnlocked && (
        <PersonalizationUnlocked
          onDismiss={() => setShowPersonalizationUnlocked(false)}
        />
      )}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-background rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-serif text-lg mb-3">Exit Journey?</h3>
            <p className="body-text text-sm text-foreground/70 mb-4">
              Are you sure you want to exit &quot;{journeyDefinition?.title || journeyCollection?.title}&quot;? Your progress will not be saved.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelExit}
                className="btn-nav px-4 py-2 text-sm border border-foreground/20 rounded-md hover:bg-foreground/5 transition-colors"
              >
                Continue Journey
              </button>
              <button
                onClick={handleConfirmExit}
                className="btn-nav px-4 py-2 text-sm bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
      {showJourneyCompletion && journeyDefinition && (
        <JourneyCompletion
          journeyTitle={journeyDefinition.title}
          journeyEmoji={journeyDefinition.emoji}
          onDismiss={handleJourneyCompletionDismiss}
          onStartAnother={handleStartAnotherJourney}
        />
      )}
      {showJourneyCompletion && journeyCollection && (
        <JourneyCompletion
          journeyTitle={journeyCollection.title}
          journeyEmoji="📚"
          onDismiss={handleJourneyCompletionDismiss}
          onStartAnother={handleStartAnotherJourney}
        />
      )}
      <ShareModal
        quote={currentQuote}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
      <AddToCollectionModal
        quoteId={currentQuote.id}
        isOpen={showAddToCollectionModal}
        onClose={() => setShowAddToCollectionModal(false)}
        onSuccess={() => showToast("Added to collection")}
      />
    </>
  );
}
