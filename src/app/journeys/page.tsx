'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';
import journeysData from '@/data/journeys.json';
import type { JourneyDefinition, UserJourney, Quote } from '@/types';
import { getActiveJourney, startJourney, getCompletedJourneys } from '@/lib/journeys';
import { getQuoteById } from '@/lib/quotes';

const journeys: JourneyDefinition[] = journeysData as JourneyDefinition[];

interface CompletedJourneyWithQuotes {
  journey: UserJourney;
  definition: JourneyDefinition | undefined;
  quotes: Quote[];
}

export default function JourneysPage() {
  const router = useRouter();
  const [activeJourney, setActiveJourney] = useState<UserJourney | undefined>(undefined);
  const [completedJourneys, setCompletedJourneys] = useState<CompletedJourneyWithQuotes[]>([]);
  const [pendingJourneyId, setPendingJourneyId] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [expandedJourneyId, setExpandedJourneyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadJourneys() {
      const [active, completed] = await Promise.all([
        getActiveJourney(),
        getCompletedJourneys(),
      ]);
      setActiveJourney(active);

      // Load quotes for each completed journey
      const completedWithQuotes: CompletedJourneyWithQuotes[] = completed.map((j) => {
        const definition = journeys.find((def) => def.id === j.journeyId);
        const quotes = j.quotesShown
          .map((qId) => getQuoteById(qId))
          .filter((q): q is Quote => q !== undefined);
        return { journey: j, definition, quotes };
      });

      // Sort by completedAt descending (most recent first)
      completedWithQuotes.sort((a, b) => {
        const dateA = a.journey.completedAt ? new Date(a.journey.completedAt).getTime() : 0;
        const dateB = b.journey.completedAt ? new Date(b.journey.completedAt).getTime() : 0;
        return dateB - dateA;
      });

      setCompletedJourneys(completedWithQuotes);
      setIsLoading(false);
    }
    loadJourneys();
  }, []);

  const handleStartClick = async (journeyId: string) => {
    if (activeJourney) {
      // Show warning if another journey is active
      setPendingJourneyId(journeyId);
      setShowWarning(true);
    } else {
      // Start journey directly
      await startJourney(journeyId);
      router.push('/');
    }
  };

  const handleConfirmStart = async () => {
    if (!pendingJourneyId) return;

    // Note: The active journey will be replaced by the new one
    // The old journey record remains (not deleted) as incomplete
    await startJourney(pendingJourneyId);
    setShowWarning(false);
    setPendingJourneyId(null);
    router.push('/');
  };

  const handleCancelStart = () => {
    setShowWarning(false);
    setPendingJourneyId(null);
  };

  const getActiveJourneyTitle = (): string => {
    if (!activeJourney) return '';
    const journey = journeys.find((j) => j.id === activeJourney.journeyId);
    return journey?.title || 'Unknown Journey';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const toggleExpanded = (journeyId: number | undefined) => {
    if (journeyId === undefined) return;
    setExpandedJourneyId((prev) => (prev === journeyId ? null : journeyId));
  };

  return (
    <PageTransition>
      <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
        <h1 className="font-serif text-2xl mb-2 text-center">Journeys</h1>
        <p className="body-text text-sm text-foreground/60 text-center mb-8">
          Curated multi-day paths through philosophical wisdom
        </p>

        <div className="space-y-4">
          {journeys.map((journey) => {
            const isActive = activeJourney?.journeyId === journey.id;
            return (
              <article
                key={journey.id}
                className={`p-4 rounded-lg border transition-colors ${
                  isActive
                    ? 'border-foreground/30 bg-foreground/5'
                    : 'border-foreground/10 hover:border-foreground/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" role="img" aria-label={journey.title}>
                    {journey.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-serif text-lg text-foreground">
                      {journey.title}
                    </h2>
                    <p className="body-text text-sm text-foreground/70 mt-1">
                      {journey.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="body-text text-xs text-foreground/50">
                        {journey.duration} days
                      </span>
                      {isLoading ? (
                        <span className="body-text text-xs text-foreground/50">Loading...</span>
                      ) : isActive ? (
                        <span className="body-text text-xs text-foreground/70 font-medium">
                          Day {activeJourney?.day} of {journey.duration}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartClick(journey.id)}
                          className="btn-nav px-3 py-1.5 text-sm border border-foreground/20 rounded-md hover:bg-foreground/5 transition-colors"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Completed Journeys Section */}
        {!isLoading && completedJourneys.length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif text-xl mb-4 text-foreground/80">
              Completed Journeys
            </h2>
            <div className="space-y-3">
              {completedJourneys.map((item) => {
                const isExpanded = expandedJourneyId === item.journey.id;
                return (
                  <article
                    key={item.journey.id}
                    className="border border-foreground/10 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpanded(item.journey.id)}
                      className="w-full p-4 text-left flex items-start gap-3 hover:bg-foreground/5 transition-colors"
                    >
                      <span className="text-xl" role="img" aria-label={item.definition?.title}>
                        {item.definition?.emoji || '📚'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-base text-foreground">
                          {item.definition?.title || 'Unknown Journey'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="body-text text-xs text-foreground/50">
                            {item.journey.completedAt && formatDate(item.journey.completedAt)}
                          </span>
                          <span className="body-text text-xs text-foreground/40">•</span>
                          <span className="body-text text-xs text-foreground/50">
                            {item.quotes.length} quotes
                          </span>
                        </div>
                      </div>
                      <svg
                        className={`w-4 h-4 text-foreground/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded quotes list */}
                    {isExpanded && item.quotes.length > 0 && (
                      <div className="border-t border-foreground/10 bg-foreground/5 px-4 py-3">
                        <ul className="space-y-3">
                          {item.quotes.map((quote, idx) => (
                            <li key={quote.id} className="text-sm">
                              <span className="text-foreground/40 body-text mr-2">
                                Day {idx + 1}
                              </span>
                              <span className="quote-text text-foreground/80 italic">
                                &ldquo;{quote.text.length > 80 ? quote.text.slice(0, 80) + '…' : quote.text}&rdquo;
                              </span>
                              <span className="body-text text-foreground/50 ml-1">
                                — {quote.author}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Warning Modal */}
        {showWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-background rounded-lg p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-serif text-lg mb-3">Journey in Progress</h3>
              <p className="body-text text-sm text-foreground/70 mb-4">
                You&apos;re currently on &quot;{getActiveJourneyTitle()}&quot;. Starting a new journey will abandon your current progress.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelStart}
                  className="btn-nav px-4 py-2 text-sm border border-foreground/20 rounded-md hover:bg-foreground/5 transition-colors"
                >
                  Keep Current
                </button>
                <button
                  onClick={handleConfirmStart}
                  className="btn-nav px-4 py-2 text-sm bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors"
                >
                  Start New
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  );
}
