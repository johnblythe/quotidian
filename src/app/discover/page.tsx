"use client";

import { PageTransition } from "@/components/PageTransition";

export default function DiscoverPage() {
  return (
    <PageTransition>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="quote-text text-2xl text-center mb-8 text-foreground/80">
            Discover Collections
          </h1>

          {/* Popular collections placeholder - US-C13 */}
          <section className="mb-10">
            <h2 className="quote-text text-lg text-foreground/70 mb-4">
              Popular
            </h2>
            <div className="bg-foreground/5 rounded-lg p-6 text-center">
              <p className="body-text text-foreground/50 text-sm">
                Popular collections coming soon
              </p>
            </div>
          </section>

          {/* New collections placeholder - US-C14 */}
          <section>
            <h2 className="quote-text text-lg text-foreground/70 mb-4">
              New
            </h2>
            <div className="bg-foreground/5 rounded-lg p-6 text-center">
              <p className="body-text text-foreground/50 text-sm">
                New collections coming soon
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
