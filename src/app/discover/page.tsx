"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";
import { getPopularCollections, getNewCollections, type PopularCollection, type NewCollection } from "@/lib/collections";

export default function DiscoverPage() {
  const [popularCollections, setPopularCollections] = useState<PopularCollection[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [newCollections, setNewCollections] = useState<NewCollection[]>([]);
  const [loadingNew, setLoadingNew] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      const [popular, recent] = await Promise.all([
        getPopularCollections(10),
        getNewCollections(10),
      ]);
      setPopularCollections(popular);
      setLoadingPopular(false);
      setNewCollections(recent);
      setLoadingNew(false);
    };

    loadCollections();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="quote-text text-2xl text-center mb-8 text-foreground/80">
            Discover Collections
          </h1>

          {/* Popular collections - US-C13 */}
          <section className="mb-10">
            <h2 className="quote-text text-lg text-foreground/70 mb-4">
              Popular
            </h2>
            {loadingPopular ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-foreground/5 rounded-lg p-4"
                  >
                    <div className="h-5 bg-foreground/10 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-foreground/10 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : popularCollections.length === 0 ? (
              <div className="bg-foreground/5 rounded-lg p-6 text-center">
                <p className="body-text text-foreground/50 text-sm">
                  No public collections yet. Be the first to share!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {popularCollections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.id}`}
                    className="block bg-foreground/5 hover:bg-foreground/10 rounded-lg p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="quote-text text-lg text-foreground/90 truncate">
                          {collection.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 body-text text-sm text-foreground/60">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            {collection.follower_count} follower{collection.follower_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-foreground/40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-label="Public"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* New collections - US-C14 */}
          <section>
            <h2 className="quote-text text-lg text-foreground/70 mb-4">
              New
            </h2>
            {loadingNew ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-foreground/5 rounded-lg p-4"
                  >
                    <div className="h-5 bg-foreground/10 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-foreground/10 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : newCollections.length === 0 ? (
              <div className="bg-foreground/5 rounded-lg p-6 text-center">
                <p className="body-text text-foreground/50 text-sm">
                  No new collections in the last 30 days.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {newCollections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.id}`}
                    className="block bg-foreground/5 hover:bg-foreground/10 rounded-lg p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="quote-text text-lg text-foreground/90 truncate">
                          {collection.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 body-text text-sm text-foreground/60">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            {collection.quote_count} quote{collection.quote_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-foreground/40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-label="Public"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
