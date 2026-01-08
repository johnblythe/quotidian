import { Quote } from "@/components/Quote";
import { getTodaysQuote } from "@/lib/quotes";

export default function Home() {
  const todaysQuote = getTodaysQuote();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="w-full">
        <Quote quote={todaysQuote} />
      </main>
    </div>
  );
}
