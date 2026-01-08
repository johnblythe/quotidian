'use client';

interface GreetingProps {
  name: string;
}

function getGreetingTime(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();

  // Morning: 5am-12pm (5-11)
  if (hour >= 5 && hour < 12) {
    return 'morning';
  }
  // Afternoon: 12pm-5pm (12-16)
  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }
  // Evening: 5pm-5am (17-23 or 0-4)
  return 'evening';
}

export function Greeting({ name }: GreetingProps) {
  const timeOfDay = getGreetingTime();

  return (
    <p className="body-text text-center text-foreground/60 mb-4">
      Good {timeOfDay}, {name}
    </p>
  );
}
