import type { Metadata } from "next";
import { Libre_Baskerville, Nunito } from "next/font/google";
import "./globals.css";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Proof AI — Verify competency before you hire",
  description:
    "See how candidates think through role-like work before interviews. Proof AI is a competency work sample — rubric-scored, not a replacement for your hiring loop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${libreBaskerville.variable} ${nunito.variable} scroll-smooth bg-surface`}
    >
      <body className="min-h-screen bg-surface font-sans antialiased text-ink">
        {children}
      </body>
    </html>
  );
}
