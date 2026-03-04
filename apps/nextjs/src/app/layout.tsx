import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { cn } from "@acme/ui";
import { ThemeProvider } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { DotScreenShader } from "~/components/dot-shader-background";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";

import "~/app/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://music.calayo.net"
      : "http://localhost:3000",
  ),
  title: "Chumbaleague",
  description: "Music leagues with friends",
  openGraph: {
    title: "Chumbaleague",
    description: "Music leagues with friends",
    url: "https://music.calayo.net",
    siteName: "Chumbaleague",
  },
};

export const viewport: Viewport = {
  themeColor: "black",
  maximumScale: 1,
  userScalable: false,
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background text-foreground min-h-screen font-sans antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <ThemeProvider>
          <TRPCReactProvider>
            <div className="fixed inset-0 -z-10">
              <DotScreenShader />
            </div>
            {props.children}
          </TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
