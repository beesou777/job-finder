"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalChatWidget } from "@/components/GlobalChatWidget";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dashboard = pathname?.startsWith("/dashboard");
  const home = pathname === "/";
  const listing = [
    "/jobs",
    "/internships",
    "/remote-jobs",
    "/linkedin-jobs",
    "/skills",
    "/company",
  ].some((route) => pathname?.startsWith(route));
  return (
    <>
      {!dashboard && <Navbar />}
      <main
        className={
          dashboard
            ? "dashboard-surface min-h-screen bg-[#f4f8ff] text-[#102e67]"
            : home || listing
              ? "min-h-screen bg-[#f9fafb]"
              : "min-h-screen bg-zinc-950"
        }
      >
        {children}
      </main>
      {!dashboard && (
        <>
          <Footer />
          <GlobalChatWidget />
          <PWAInstallPrompt />
        </>
      )}
    </>
  );
}
