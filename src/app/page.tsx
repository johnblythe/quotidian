import { Quote } from "@/components/Quote";

const sampleQuote = {
  id: "marcus-001",
  text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
  author: "Marcus Aurelius",
  source: "Meditations, Book 6",
};

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="w-full">
        <Quote quote={sampleQuote} />
      </main>
    </div>
  );
}
