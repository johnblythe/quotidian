'use client';

interface JourneyHeaderProps {
  emoji: string;
  title: string;
  currentDay: number;
  totalDays: number;
  onExit?: () => void;
}

export function JourneyHeader({ emoji, title, currentDay, totalDays, onExit }: JourneyHeaderProps) {
  return (
    <div className="text-center mb-6">
      <p className="body-text text-foreground/60 mb-1">
        <span className="mr-2">{emoji}</span>
        Day {currentDay} of {totalDays}
      </p>
      <p className="body-text font-medium text-foreground/80">
        {title}
      </p>
      {onExit && (
        <button
          onClick={onExit}
          className="body-text text-xs text-foreground/40 hover:text-foreground/60 transition-colors mt-2"
        >
          Exit Journey
        </button>
      )}
    </div>
  );
}
