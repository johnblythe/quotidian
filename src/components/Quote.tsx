import { Quote as QuoteType } from "@/types";

interface QuoteProps {
  quote: QuoteType;
}

export function Quote({ quote }: QuoteProps) {
  return (
    <blockquote className="max-w-[65ch] mx-auto px-6 py-12 text-center">
      <p className="quote-text mb-8">{quote.text}</p>
      <footer className="body-text text-foreground/70">
        <cite className="not-italic">
          — {quote.author}
          {quote.source && (
            <span className="block text-sm mt-1 text-foreground/50">
              {quote.source}
            </span>
          )}
        </cite>
      </footer>
    </blockquote>
  );
}
