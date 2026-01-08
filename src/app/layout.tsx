import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Quotidian",
  description: "Daily philosophical quotes for reflection",
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
