export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <main className="flex w-full max-w-2xl flex-col items-center text-center">
        <p className="quote-text mb-8">
          &ldquo;The happiness of your life depends upon the quality of your
          thoughts.&rdquo;
        </p>
        <p className="body-text text-foreground/70">
          — Marcus Aurelius, <em>Meditations</em>
        </p>
      </main>
    </div>
  );
}
