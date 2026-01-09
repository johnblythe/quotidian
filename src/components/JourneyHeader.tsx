'use client';

interface JourneyHeaderProps {
  emoji: string;
  title: string;
  currentDay: number;
  totalDays: number;
}

export function JourneyHeader({ emoji, title, currentDay, totalDays }: JourneyHeaderProps) {
  return (
    <div className="text-center mb-6">
      <p className="body-text text-foreground/60 mb-1">
        <span className="mr-2">{emoji}</span>
        Day {currentDay} of {totalDays}
      </p>
      <p className="body-text font-medium text-foreground/80">
        {title}
      </p>
    </div>
  );
}
