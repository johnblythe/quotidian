"use client";

import { useEffect, useState } from "react";
import { Quote } from "@/components/Quote";
import { Onboarding } from "@/components/Onboarding";
import { getTodaysQuote } from "@/lib/quotes";
import { isOnboarded } from "@/lib/preferences";

type PageState = "loading" | "onboarding" | "quote";

export default function Home() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const todaysQuote = getTodaysQuote();

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarded = await isOnboarded();
      setPageState(onboarded ? "quote" : "onboarding");
    };
    checkOnboarding();
  }, []);

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
        onComplete={() => setPageState("quote")}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="w-full">
        <Quote quote={todaysQuote} />
      </main>
    </div>
  );
}
