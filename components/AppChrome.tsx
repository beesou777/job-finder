"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalChatWidget } from "@/components/GlobalChatWidget";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dashboard = pathname?.startsWith("/dashboard");
  return (
    <>
      {!dashboard && <Navbar />}
      <main className={dashboard ? "min-h-screen bg-[#10100f]" : "min-h-screen bg-zinc-950"}>
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
