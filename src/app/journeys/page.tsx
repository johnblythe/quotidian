'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/PageTransition';
import journeysData from '@/data/journeys.json';
import type { JourneyDefinition, UserJourney } from '@/types';
import { getActiveJourney, startJourney } from '@/lib/journeys';

const journeys: JourneyDefinition[] = journeysData as JourneyDefinition[];

export default function JourneysPage() {
  const router = useRouter();
  const [activeJourney, setActiveJourney] = useState<UserJourney | undefined>(undefined);
  const [pendingJourneyId, setPendingJourneyId] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActiveJourney() {
      const active = await getActiveJourney();
      setActiveJourney(active);
      setIsLoading(false);
    }
    loadActiveJourney();
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
