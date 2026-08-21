"use client";
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="hero-grid flex min-h-[75vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/90 p-8 shadow-2xl">
        <p className="mb-8 text-center text-2xl font-black text-white">kamkhoj</p>
        <h1 className="text-3xl font-black text-white">{title}</h1>
        <p className="mt-2 mb-8 text-zinc-400">{subtitle}</p>
        {children}
      </div>
    </main>
  );
}
