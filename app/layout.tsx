import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Best Job Aggregator Sites in Nepal | Job Aggregator Sites in Nepal | JobKhoj",
    template: "%s | JobKhoj - Nepal's #1 Job Aggregator"
  },
  description: "Best job aggregator sites in Nepal - Find the latest jobs and internships from top Nepali job portals - MeroCareer, JobsNepal, KumariJob, InternSathi, JobAxle all in one place. Your career journey starts here.",
  keywords: [
    "best job aggregator sites in nepal",
    "job aggregator sites in nepal",
    "jobs in nepal",
    "nepal jobs",
    "jobs kathmandu",
    "internships nepal",
    "job portal nepal",
    "nepal job search",
    "career nepal",
    "nepal employment",
    "job opportunities nepal",
    "merocareer",
    "jobsnepal",
    "kumarijob",
    "internsathi",
    "jobaxle",
    "nepal job aggregator",
    "job aggregator nepal",
    "best job sites nepal",
    "top job aggregator nepal"
  ],
  authors: [{ name: "JobKhoj" }],
  creator: "JobKhoj",
  publisher: "JobKhoj",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kamkhoj.eventeir.ai",
    siteName: "JobKhoj - Best Job Aggregator Sites in Nepal",
    title: "Best Job Aggregator Sites in Nepal | Job Aggregator Sites in Nepal | JobKhoj",
    description: "Best job aggregator sites in Nepal - Find the latest jobs and internships from top Nepali job portals all in one place.",
    images: [
      {
        url: "https://kamkhoj.eventeir.ai/og-image.png",
        width: 1200,
        height: 630,
        alt: "JobKhoj - Nepal's Job Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Job Aggregator Sites in Nepal | JobKhoj",
    description: "Best job aggregator sites in Nepal - Find the latest jobs and internships from all major portals",
    images: ["https://kamkhoj.eventeir.ai/og-image.png"],
  },
  alternates: {
    canonical: "https://kamkhoj.eventeir.ai",
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "uso6417t8o");
            `,
          }}
        />
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

