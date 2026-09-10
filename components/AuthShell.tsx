"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="grid min-h-screen bg-[#f8f7f2] lg:grid-cols-2">
      <aside className="relative hidden min-h-screen overflow-hidden lg:block">
        <Image
          src="/kamkhoj-auth-visual.png"
          alt="A Nepali professional looking toward Kathmandu and the Himalayas"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,24,48,0.1)_18%,rgba(5,24,48,0.88)_100%)]" />
        <Link
          href="/"
          className="absolute left-10 top-9 text-2xl font-black tracking-tight text-white xl:left-14"
        >
          kam<span className="text-blue-300">khoj</span>
        </Link>
        <div className="absolute inset-x-0 bottom-0 p-10 text-white xl:p-14">
          <p className="max-w-xl text-4xl font-medium leading-[1.08] tracking-[-0.03em] xl:text-5xl">
            Your next opportunity starts with a clearer view.
          </p>
          <p className="mt-5 max-w-md text-sm leading-6 text-blue-100">
            Search verified public listings across Nepal, compare the details that matter, and
            continue directly to the original source.
          </p>
          <div className="mt-9 flex gap-10 border-t border-white/25 pt-5">
            <div>
              <strong className="block text-xl">1,988+</strong>
              <span className="text-xs text-blue-100">active opportunities</span>
            </div>
            <div>
              <strong className="block text-xl">500+</strong>
              <span className="text-xs text-blue-100">hiring companies</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="flex min-h-screen items-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-[520px]">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tight text-[#102e67] lg:hidden">
              kam<span className="text-primary">khoj</span>
            </Link>
            <Link
              href="/"
              className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-[#617493] transition hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> Back to jobs
            </Link>
          </div>

          <h1 className="mt-16 max-w-md text-4xl font-medium leading-[1.05] tracking-[-0.035em] text-gray-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mb-10 mt-5 max-w-md text-base leading-7 text-[#404443]">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  );
}
