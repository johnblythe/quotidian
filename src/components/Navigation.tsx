"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSyncStatus } from "@/hooks/useSyncStatus";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Today",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: "/archive",
    label: "Archive",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    href: "/favorites",
    label: "Favorites",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    href: "/collections",
    label: "Collections",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: "/journeys",
    label: "Journeys",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5Z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

/**
 * Sync indicator component - shows sync status when user is signed in
 * Green dot = synced, Yellow dot = pending syncs, Pulsing = syncing
 */
function SyncIndicator() {
  const { isSignedIn, isLoading, isSupabaseConfigured } = useAuth();
  const { online, pendingCount, syncing } = useSyncStatus();

  // Don't show anything while loading or if Supabase isn't configured
  if (isLoading || !isSupabaseConfigured || !isSignedIn) {
    return null;
  }

  // Determine indicator color and status
  const hasPending = pendingCount > 0;
  const isOffline = !online;

  let bgColor = "bg-green-500"; // Synced
  let title = "Synced";

  if (syncing) {
    bgColor = "bg-blue-500 animate-pulse";
    title = "Syncing...";
  } else if (isOffline || hasPending) {
    bgColor = "bg-yellow-500";
    title = isOffline
      ? `Offline (${pendingCount} pending)`
      : `${pendingCount} pending sync${pendingCount === 1 ? "" : "s"}`;
  }

  return (
    <div className="absolute -top-1 -right-1 lg:top-0 lg:right-0">
      <div
        className={`w-2 h-2 ${bgColor} rounded-full`}
        title={title}
        aria-label={title}
      />
    </div>
  );
}

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-foreground/10 lg:top-0 lg:bottom-auto lg:border-t-0 lg:border-b z-50 nav-safe-area lg:pb-0">
      <div className="max-w-2xl mx-auto px-4 safe-area-inset-x">
        <ul className="flex items-center justify-around lg:justify-center lg:gap-12 py-2 lg:py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isSettings = item.href === "/settings";
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`btn-nav flex flex-col items-center gap-1 px-3 py-1 relative ${
                    isActive
                      ? "text-foreground"
                      : "text-foreground/50 hover:text-foreground/80"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.icon}
                  <span className="text-xs body-text">{item.label}</span>
                  {isSettings && <SyncIndicator />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
