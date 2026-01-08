"use client";

import { useEffect, useState } from "react";
import { Quote } from "@/components/Quote";
import { Onboarding } from "@/components/Onboarding";
import { Greeting } from "@/components/Greeting";
import { getTodaysQuote } from "@/lib/quotes";
import { getPreferences } from "@/lib/preferences";

type PageState = "loading" | "onboarding" | "quote";

export default function Home() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [userName, setUserName] = useState<string>("");
  const todaysQuote = getTodaysQuote();

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
        <Quote quote={todaysQuote} />
      </main>
    </div>
  );
}
