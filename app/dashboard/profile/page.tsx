import type { Metadata } from "next";
import { CareerProfileEditor } from "@/components/CareerProfileEditor";

export const metadata: Metadata = {
  title: "Career profile",
  robots: { index: false, follow: false },
};

export default function CareerProfilePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 lg:py-12">
      <CareerProfileEditor />
    </main>
  );
}
