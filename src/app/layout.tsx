import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkProvider } from "@clerk/nextjs";
import {
  PostHogProvider,
  PostHogIdentifier,
} from "@/lib/analytics/posthog-provider";
import { PageViewTracker } from "@/lib/analytics/page-tracking";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Discovery Loop Coach",
  description: "AI-powered software delivery coaching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="antialiased">
          <PostHogProvider>
            <PostHogIdentifier />
            <PageViewTracker />
            {children}
            <Analytics />
            <SpeedInsights />
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
