'use client';

interface GreetingProps {
  name: string;
}

type Season = 'winter' | 'spring' | 'summer' | 'autumn';

function getSeason(): Season {
  const date = new Date();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Approximate season boundaries (Northern Hemisphere)
  // Winter: Dec 21 - Mar 20
  // Spring: Mar 21 - Jun 20
  // Summer: Jun 21 - Sep 22
  // Autumn: Sep 23 - Dec 20

  if ((month === 11 && day >= 21) || month < 2 || (month === 2 && day <= 20)) {
    return 'winter';
  }
  if ((month === 2 && day >= 21) || month < 5 || (month === 5 && day <= 20)) {
    return 'spring';
  }
  if ((month === 5 && day >= 21) || month < 8 || (month === 8 && day <= 22)) {
    return 'summer';
  }
  return 'autumn';
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
  const season = getSeason();
  const timeOfDay = getGreetingTime();

  return (
    <p className="body-text text-center text-foreground/60 mb-4">
      Good {season} {timeOfDay}, {name}
    </p>
  );
}
