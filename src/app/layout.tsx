import type { Metadata } from "next";
import "@fontsource/lora/400.css";
import "@fontsource/lora/400-italic.css";
import "@fontsource/lora/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { ToastProvider } from "@/components/Toast";

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
    <html lang="en">
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
