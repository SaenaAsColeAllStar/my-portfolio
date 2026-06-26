import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../src/shared/providers/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cole.dev — AI & Systems Engineer Portfolio",
  description: "An immersive digital product representing the strategic thinking, system architecture, and cognitive design of a world-class AI Engineer.",
  metadataBase: new URL("https://cole.dev"),
  openGraph: {
    title: "Cole.dev — AI & Systems Engineer Portfolio",
    description: "An immersive digital product representing the strategic thinking, system architecture, and cognitive design of a world-class AI Engineer.",
    url: "https://cole.dev",
    siteName: "Cole.dev",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cole.dev — AI & Systems Engineer Portfolio",
    description: "An immersive digital product representing the strategic thinking, system architecture, and cognitive design of a world-class AI Engineer.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="font-sans antialiased bg-background text-foreground transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

