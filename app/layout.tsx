import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono, Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// Latin fonts above have no Thai glyphs, so Thai text silently falls back
// to whatever generic Thai font the OS ships. These fill that gap — CSS
// font-family fallback picks the first font with a glyph for each
// character, so Latin text still renders in Inter/Playfair.
const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai-sans",
  subsets: ["thai"],
  display: "swap",
});

const notoSerifThai = Noto_Serif_Thai({
  variable: "--font-thai-serif",
  subsets: ["thai"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PROMETHEUS — Research Operating System for Builders",
  description:
    "A thinking environment for ambitious researchers and engineers to organize knowledge, discover ideas, and build technologies that advance humanity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} ${notoSansThai.variable} ${notoSerifThai.variable}`}
      >
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
