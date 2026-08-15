import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: "Ecom Store | Curated Products, Simple Shopping",
    template: "%s | Ecom Store",
  },
  description: "Browse categories and tags, discover products. Elegant baby-pink storefront, simple and standout.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Ecom Store",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[var(--pink-50)] font-sans text-[var(--foreground)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
