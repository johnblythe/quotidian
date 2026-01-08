import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
});

// Viewport configuration for mobile browsers (Next.js 16+ requires separate export)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#fafaf8",
};

export const metadata: Metadata = {
  title: "Quotidian",
  description: "Daily philosophical quotes for reflection",
  // Apple PWA meta tags for iOS Safari
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quotidian",
  },
  // Additional mobile meta tags
  other: {
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
  },
  // Apple touch icons for iOS PWA
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  // Manifest link
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="antialiased pb-16 lg:pb-0 lg:pt-14">
        <a href="#main-content" className="skip-to-content body-text">
          Skip to content
        </a>
        <ToastProvider>
          <Navigation />
          <div id="main-content">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
