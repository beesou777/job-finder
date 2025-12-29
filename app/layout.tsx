import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "JobKhoj - Find Jobs in Nepal | Latest Job Opportunities & Internships",
    template: "%s | JobKhoj - Nepal's #1 Job Aggregator"
  },
  description: "Find the latest jobs and internships in Nepal. Search across top Nepali job portals - MeroCareer, JobsNepal, KumariJob, InternSathi, JobAxle and more. Your career journey starts here.",
  keywords: [
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
    "nepal job aggregator"
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
    url: "https://job-khoj.vercel.app",
    siteName: "JobKhoj",
    title: "JobKhoj - Nepal's #1 Job Finder | Jobs & Internships in Nepal",
    description: "Find the latest jobs and internships in Nepal. Search across top Nepali job portals.",
    images: [
      {
        url: "https://job-khoj.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "JobKhoj - Nepal's Job Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobKhoj - Nepal's #1 Job Finder",
    description: "Find the latest jobs and internships in Nepal",
    images: ["https://job-khoj.vercel.app/og-image.png"],
  },
  alternates: {
    canonical: "https://job-khoj.vercel.app",
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

