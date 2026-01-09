'use client';

import { useState, useEffect } from 'react';
import { getPreferences, savePreferences, saveTimingCalculationDate, getLastTimingCalculationDate } from '@/lib/preferences';
import { PageTransition } from '@/components/PageTransition';
import { useToast } from '@/components/Toast';
import { calculateOptimalTime, shouldRecalculateTiming, isSignificantTimeDifference } from '@/lib/engagement';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [suggestedTime, setSuggestedTime] = useState<string | null>(null);
  const [showTimingNotification, setShowTimingNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadPreferences() {
      const prefs = await getPreferences();
      let currentNotifTime = '08:00';
      if (prefs) {
        setName(prefs.name);
        setNotificationTime(prefs.notificationTime);
        currentNotifTime = prefs.notificationTime;
      }

      // Check if weekly recalculation is due (every Sunday)
      const lastCalculationDate = await getLastTimingCalculationDate();
      const shouldRecalculate = shouldRecalculateTiming(lastCalculationDate);

      // Load suggested time based on engagement patterns
      const optimal = await calculateOptimalTime();
      setSuggestedTime(optimal);

      // If it's Sunday and we should recalculate, check for significant difference
      if (shouldRecalculate && optimal) {
        // Save the calculation date so we don't recalculate again this week
        const today = new Date().toISOString().split('T')[0];
        await saveTimingCalculationDate(today);

        // Show notification if the suggestion differs by > 30 minutes
        if (isSignificantTimeDifference(optimal, currentNotifTime)) {
          setShowTimingNotification(true);
        }
      }

      setIsLoading(false);
    }
    loadPreferences();
  }, []);

  // Format HH:MM to user-friendly display (e.g., "8:30 AM")
  const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleUseSuggestedTime = () => {
    if (suggestedTime) {
      setNotificationTime(suggestedTime);
      showToast('Suggested time applied');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await savePreferences({ name, notificationTime });
    setIsSaving(false);
    setShowSaved(true);
    showToast("Settings saved");
    setTimeout(() => setShowSaved(false), 2000);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="body-text text-foreground/60">Loading...</p>
      </main>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
        <h1 className="font-serif text-2xl mb-8 text-center">Settings</h1>

        {/* Weekly timing recalculation notification */}
        {showTimingNotification && suggestedTime && (
          <div className="mb-6 p-4 bg-amber-100/80 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
            <p className="body-text text-sm text-amber-900 dark:text-amber-100 mb-2">
              Based on your recent habits, we suggest changing your reflection time to{' '}
              <span className="font-medium">{formatTimeDisplay(suggestedTime)}</span>.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setNotificationTime(suggestedTime);
                  setShowTimingNotification(false);
                  showToast('Suggested time applied');
                }}
                className="body-text text-sm font-medium text-amber-900 dark:text-amber-100 underline hover:opacity-80 transition-opacity"
              >
                Use suggested time
              </button>
              <button
                type="button"
                onClick={() => setShowTimingNotification(false)}
                className="body-text text-sm text-amber-700 dark:text-amber-300 hover:opacity-80 transition-opacity"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Name input */}
          <div className="space-y-2">
            <label htmlFor="name" className="body-text text-sm text-foreground/60 block">
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b-2 border-foreground/20 focus:border-foreground/60
                         outline-none py-2 text-lg font-serif transition-colors"
              placeholder="Enter your name"
            />
          </div>

          {/* Notification time picker */}
          <div className="space-y-2">
            <label htmlFor="notification-time" className="body-text text-sm text-foreground/60 block">
              Daily reflection time
            </label>
            <input
              id="notification-time"
              type="time"
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
              className="w-full bg-transparent border-b-2 border-foreground/20 focus:border-foreground/60
                         outline-none py-2 text-lg font-serif transition-colors appearance-none"
            />
            <p className="body-text text-xs text-foreground/60">
              We&apos;ll remind you to reflect at this time
            </p>

            {/* Suggested time based on habits */}
            {suggestedTime && (
              <div className="mt-4 p-3 bg-foreground/5 rounded-lg">
                <p className="body-text text-sm text-foreground/80">
                  Suggested: <span className="font-medium">{formatTimeDisplay(suggestedTime)}</span>
                  <span className="text-foreground/60"> based on your habits</span>
                </p>
                <button
                  type="button"
                  onClick={handleUseSuggestedTime}
                  className="mt-2 body-text text-sm text-foreground/80 underline hover:text-foreground transition-colors"
                >
                  Use suggested time
                </button>
              </div>
            )}
          </div>

          {/* Save button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="btn-primary w-full py-3 px-6 bg-foreground text-background font-medium rounded-lg
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            {/* Saved confirmation */}
            <div
              className={`text-center mt-4 body-text text-foreground/60 transition-opacity duration-300 ${
                showSaved ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Saved!
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
