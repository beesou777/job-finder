import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Salary Calculator Nepal",
  description: "Estimate take-home value and compare salary offers for jobs in Nepal.",
  alternates: { canonical: absoluteUrl("/tools/salary-calculator-nepal") },
};

export default function SalaryCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
