import { Quote as QuoteType } from "@/types";

// Amazon affiliate tag - update with your own
const AMAZON_AFFILIATE_TAG = "quotidian0e-20";

function buildAmazonSearchUrl(author: string, source: string): string {
  const searchQuery = `${author} ${source}`.trim();
  return `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}&tag=${AMAZON_AFFILIATE_TAG}`;
}

interface QuoteProps {
  quote: QuoteType;
  isReflecting?: boolean;
}

export function Quote({ quote, isReflecting = false }: QuoteProps) {
  return (
    <blockquote
      className={`max-w-[65ch] mx-auto px-6 text-center reflection-fade reflection-fade-delay-2 ${
        isReflecting
          ? "py-6 reflection-active-quote"
          : "py-12"
      }`}
    >
      <p className="quote-text mb-8">{quote.text}</p>
      <footer className="body-text text-foreground/70">
        <cite className="not-italic">
          — {quote.author}
          {quote.source && (
            <a
              href={buildAmazonSearchUrl(quote.author, quote.source)}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm mt-1 text-foreground/40 hover:text-foreground/60 transition-colors"
              title="Find on Amazon"
            >
              {quote.source}
            </a>
          )}
        </cite>
      </footer>
    </blockquote>
  );
}
