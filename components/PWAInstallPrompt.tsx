"use client";
import { useEffect, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
export function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);
  if (!visible || !installEvent) return null;
  async function install() {
    await installEvent!.prompt();
    await installEvent!.userChoice;
    setVisible(false);
    setInstallEvent(null);
  }
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-2xl border border-primary/40 bg-zinc-900 p-4 text-white shadow-2xl">
      <div>
        <p className="font-black">Install KamKhoj</p>
        <p className="mt-1 text-xs text-zinc-400">Keep job search one tap away on your phone.</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => setVisible(false)}
          className="rounded-full px-3 py-2 text-xs font-bold text-zinc-400"
        >
          Later
        </button>
        <button
          onClick={install}
          className="rounded-full bg-primary px-4 py-2 text-xs font-black text-zinc-950"
        >
          Install
        </button>
      </div>
    </div>
  );
}
