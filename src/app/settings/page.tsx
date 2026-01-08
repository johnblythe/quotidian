'use client';

import { useState, useEffect } from 'react';
import { getPreferences, savePreferences } from '@/lib/preferences';
import { PageTransition } from '@/components/PageTransition';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      const prefs = await getPreferences();
      if (prefs) {
        setName(prefs.name);
        setNotificationTime(prefs.notificationTime);
      }
      setIsLoading(false);
    }
    loadPreferences();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    await savePreferences({ name, notificationTime });
    setIsSaving(false);
    setShowSaved(true);
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
            <p className="body-text text-xs text-foreground/40">
              We&apos;ll remind you to reflect at this time
            </p>
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
