import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { GlobalChatWidget } from "@/components/GlobalChatWidget";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KamKhoj | Nepal Job Search and Career Resources",
    template: "%s | KamKhoj",
  },
  description:
    "KamKhoj helps Nepal job seekers browse vacancies, internships, and career resources, then continue to the original source for application details.",
  keywords: [
    "jobs in nepal",
    "internships nepal",
    "nepal job search",
    "career resources nepal",
    "remote jobs nepal",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "KamKhoj | Nepal Job Search and Career Resources",
    description:
      "Browse Nepal jobs, internships, and practical career guides, then verify final details on the original source.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "kamkhoj - Nepal's Job Finder - Find Jobs in Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KamKhoj | Nepal Job Search",
    description:
      "Browse Nepal jobs, internships, and practical career resources.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
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
        <meta name="theme-color" content="#09090b" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <meta name="google-adsense-account" content="ca-pub-7656502769250843" />
      </head>
      <body className={manrope.className}>
        {/* Google Analytics - Only load in production */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-Y9CBC0L9KM"
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-Y9CBC0L9KM');
                `,
              }}
            />
            {/* Tawk.to - Only load in production */}
            <Script
              id="tawk-to"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                  (function(){
                    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                    s1.async=true;
                    s1.src='https://embed.tawk.to/6970ec9a8b91131980e10ee9/1jfghofkr';
                    s1.charset='UTF-8';
                    s1.setAttribute('crossorigin','*');
                    s0.parentNode.insertBefore(s1,s0);
                  })();
                `,
              }}
            />
          </>
        )}
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
        {/* Google AdSense - Injected into head via beforeInteractive strategy */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7656502769250843"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-zinc-950">{children}</main>
          <Footer />
          <GlobalChatWidget />
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
