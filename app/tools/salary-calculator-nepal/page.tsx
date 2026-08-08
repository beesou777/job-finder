"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Calculator, Clock3, MapPin } from "lucide-react";

const money = (value: number) => `NPR ${Math.round(value).toLocaleString("en-IN")}`;
const initial = { salary: 40000, allowance: 0, bonus: 0, commute: 3000, meals: 2500, other: 0, hours: 8, days: 22 };

export default function SalaryCalculatorNepalPage() {
  const [values, setValues] = useState<Record<keyof typeof initial, number | string>>(initial);
  const update = (key: keyof typeof initial, value: string) => setValues((current) => ({ ...current, [key]: value === "" ? "" : Number(value) }));
  const result = useMemo(() => {
    const salary = Number(values.salary) || 0;
    const allowance = Number(values.allowance) || 0;
    const bonus = Number(values.bonus) || 0;
    const commute = Number(values.commute) || 0;
    const meals = Number(values.meals) || 0;
    const other = Number(values.other) || 0;
    const hours = Number(values.hours) || 0;
    const days = Number(values.days) || 0;
    const monthlyGross = salary + allowance + bonus / 12;
    const monthlyCosts = commute + meals + other;
    const monthlyValue = Math.max(0, monthlyGross - monthlyCosts);
    const monthlyHours = Math.max(1, hours * days);
    return { monthlyGross, monthlyCosts, monthlyValue, annualGross: monthlyGross * 12, hourly: monthlyValue / monthlyHours };
  }, [values]);

  return <main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto max-w-6xl px-4 py-10 md:py-16"><Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link><div className="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start"><section><p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-primary">KamKhoj career tool</p><h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Compare a Nepal job offer by its real monthly value.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-zinc-400">Salary is only one part of an offer. Add allowances, commute, meals, and working hours to see a clearer comparison in Nepali rupees.</p><div className="mt-8 space-y-4 text-sm leading-6 text-zinc-400"><p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-primary" />Useful for comparing Kathmandu office roles, remote work, and offers in other Nepal locations.</p><p className="flex gap-3"><Clock3 className="h-5 w-5 shrink-0 text-primary" />The hourly figure is an estimate based on the hours and workdays you enter.</p></div></section><section className="rounded-2xl border border-white/10 bg-[#18181a] p-6 md:p-8"><div className="flex items-center gap-3"><Calculator className="h-5 w-5 text-primary" /><h2 className="text-xl font-black">Enter offer details</h2></div><div className="mt-6 grid gap-5 sm:grid-cols-2">{([["salary","Monthly base salary"],["allowance","Monthly allowances"],["bonus","Annual bonus"],["commute","Monthly commute cost"],["meals","Monthly meal cost"],["other","Other monthly costs"],["hours","Hours per workday"],["days","Workdays per month"]] as const).map(([key,label]) => <label key={key} className="text-sm font-bold text-zinc-300">{label}<div className="mt-2 flex items-center rounded-lg border border-white/10 bg-zinc-950 px-3 focus-within:border-primary"><span className="mr-2 text-xs text-zinc-500">{key === "hours" || key === "days" ? "" : "NPR"}</span><input type="number" min="0" value={values[key]} onChange={(event) => update(key, event.target.value)} className="h-11 w-full bg-transparent text-white outline-none" /></div></label>)}</div><div className="mt-8 grid gap-3 sm:grid-cols-2"><Metric label="Estimated monthly value" value={money(result.monthlyValue)} highlight /><Metric label="Estimated annual gross" value={money(result.annualGross)} /><Metric label="Estimated monthly costs" value={money(result.monthlyCosts)} /><Metric label="Value per working hour" value={money(result.hourly)} /></div><p className="mt-6 text-xs leading-5 text-zinc-500">This is a personal comparison tool, not a payslip or tax calculation. It does not estimate TDS, provident fund, insurance, leave, or benefits. Confirm the complete package with the employer.</p></section></div><section className="mt-12 border-t border-white/10 pt-8 text-sm leading-7 text-zinc-400"><h2 className="text-xl font-black text-white">How to use the result</h2><ul className="mt-4 list-disc space-y-2 pl-5"><li>Ask whether the quoted salary is gross or take-home and whether allowances are guaranteed.</li><li>Confirm probation salary, review date, working hours, leave, insurance, and overtime terms.</li><li>Use the original job notice as the final source for the offer.</li></ul><p className="mt-5">For official tax information, consult the <a href="https://ird.gov.np/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Inland Revenue Department</a>. Read more in our <Link href="/blog/salary-negotiation-nepal" className="text-primary hover:underline">salary negotiation guide</Link>.</p></section></div></main>;
}

function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div className={`rounded-xl border p-4 ${highlight ? "border-primary/50 bg-primary/10" : "border-white/10 bg-zinc-950/70"}`}><p className="text-xs text-zinc-500">{label}</p><p className={`mt-2 text-xl font-black ${highlight ? "text-primary" : "text-white"}`}>{value}</p></div>;
}
