'use client';

import { PageTransition } from '@/components/PageTransition';
import journeysData from '@/data/journeys.json';
import type { JourneyDefinition } from '@/types';

const journeys: JourneyDefinition[] = journeysData as JourneyDefinition[];

export default function JourneysPage() {
  return (
    <PageTransition>
      <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
        <h1 className="font-serif text-2xl mb-2 text-center">Journeys</h1>
        <p className="body-text text-sm text-foreground/60 text-center mb-8">
          Curated multi-day paths through philosophical wisdom
        </p>

        <div className="space-y-4">
          {journeys.map((journey) => (
            <article
              key={journey.id}
              className="p-4 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors"
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
                  <div className="body-text text-xs text-foreground/50 mt-2">
                    {journey.duration} days
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </PageTransition>
  );
}
