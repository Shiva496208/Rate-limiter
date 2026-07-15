import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RateLab — Rate Limiter Visualizer",
  description:
    "Interactive, animated visualizations of the classic rate-limiting algorithms: token bucket, leaky bucket, fixed window, sliding window log and sliding window counter.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
