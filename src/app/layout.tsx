import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Calistoga, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const calistoga = Calistoga({
  variable: "--font-calistoga",
  subsets: ["latin"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hsa.plus";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HSA Plus | Turn Medical Expenses into Tax-Free Wealth",
    template: "%s | HSA Plus",
  },
  description:
    "Track your medical expenses, let your HSA compound tax-free, and stay IRS audit-ready. Built for how you actually invest your HSA.",
  applicationName: "HSA Plus",
  authors: [{ name: "HSA Plus" }],
  keywords: [
    "HSA",
    "Health Savings Account",
    "Triple Tax Advantage",
    "HSA Investment",
    "Medical Expense Tracker",
    "IRS Audit Ready",
    "LPFSA",
    "HCFSA",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "HSA Plus",
    title: "HSA Plus | Turn Medical Expenses into Tax-Free Wealth",
    description:
      "Track your medical expenses, let your HSA compound tax-free, and stay IRS audit-ready. Built for how you actually invest your HSA.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1920,
        height: 1080,
        alt: "HSA Plus: Turn Medical Expenses into Tax-Free Wealth",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HSA Plus | Turn Medical Expenses into Tax-Free Wealth",
    description:
      "Track your medical expenses, let your HSA compound tax-free, and stay IRS audit-ready.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${calistoga.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
