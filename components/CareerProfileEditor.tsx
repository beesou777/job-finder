"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Circle, Download, FileText, ShieldCheck } from "lucide-react";
import { useSession } from "@/lib/auth-context";
import { CareerProfile, CareerProfileResponse, loadCareerProfile, loadCvSuggestions, ProfileRequestError, saveCareerProfile } from "@/lib/career-profile";

const steps = ["Personal details", "Experience & education", "Skills & projects", "AI preferences"];
const sectionTitles = ["Professional information", "Your career so far", "What you bring", "How AI should help"];
const sectionDescriptions = [
  "Tell your story in your own words. You can add a CV later.",
  "Add employment and education you want to include in applications. All dates use the AD calendar.",
  "Add your skills, languages, projects and professional links. Only include things you can stand behind.",
  "Choose your preferences for the upcoming application-document workflow.",
];
const inputClass = "mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const buttonClass = "rounded-lg border border-input px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function CareerProfileEditor() {
  const { status, data: session } = useSession();
  const accountEmail = session?.user?.email;
  const [data, setData] = useState<CareerProfileResponse | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [action, setAction] = useState<"save" | "cv" | null>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [suggestions, setSuggestions] = useState<Awaited<ReturnType<typeof loadCvSuggestions>>>(null);
  const actionController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => actionController.current?.abort();
  }, [status, accountEmail]);

  useEffect(() => {
    if (status !== "authenticated") {
      setData(null);
      setSuggestions(null);
      setDirty(false);
      setConfirmed(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setBusy(false);
    setAction(null);
    setSuggestions(null);
    setNotice("");
    setError("");
    loadCareerProfile(controller.signal).then((value) => {
      if (controller.signal.aborted) return;
      setData(value); setConfirmed(Boolean(value.confirmedAt)); setDirty(false); setConflict(false);
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load your profile.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [status, accountEmail, reloadKey]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const guardLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin === window.location.origin && destination.pathname === window.location.pathname && destination.search === window.location.search) return;
      if (!window.confirm("You have unsaved profile edits. Leave without saving?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", guardLink, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", guardLink, true);
    };
  }, [dirty]);

  function update<K extends keyof CareerProfile>(field: K, value: CareerProfile[K]) {
    setData((current) => current ? { ...current, profile: { ...current.profile, [field]: value } } : current);
    setDirty(true); setConfirmed(false); setNotice("");
  }

  async function save() {
    if (!data || busy || conflict || !dirty) return;
    if (confirmed && (!data.profile.fullName.trim() || !data.profile.professionalTitle.trim())) {
      setStep(0);
      setError("Add your full name and professional title before confirming, or uncheck confirmation to save a draft.");
      return;
    }
    setBusy(true); setAction("save"); setError(""); setNotice("");
    const controller = new AbortController();
    actionController.current = controller;
    try {
      const saved = await saveCareerProfile(data, confirmed, controller.signal);
      if (controller.signal.aborted) return;
      setData(saved); setConfirmed(Boolean(saved.confirmedAt)); setDirty(false); setNotice(`Profile version ${saved.version} saved${saved.confirmedAt ? " and confirmed" : " as a draft"}.`);
    } catch (cause: unknown) {
      if (controller.signal.aborted) return;
      setError(cause instanceof Error ? cause.message : "Could not save. Your edits are still here.");
      if (cause instanceof ProfileRequestError) {
        if (cause.status === 409 || cause.status === 0) setConflict(true);
        const field = cause.fields[0];
        if (field?.startsWith("profile.experience") || field?.startsWith("profile.education")) setStep(1);
        else if (["profile.skills", "profile.languages", "profile.projects", "profile.links"].some((prefix) => field?.startsWith(prefix))) setStep(2);
        else if (field?.startsWith("aiSettings")) setStep(3);
        else if (field) setStep(0);
      }
    } finally { if (!controller.signal.aborted) { setBusy(false); setAction(null); } }
  }

  async function previewCv() {
    if (busy) return;
    setBusy(true); setAction("cv"); setError(""); setNotice("");
    const controller = new AbortController();
    actionController.current = controller;
    try {
      const value = await loadCvSuggestions(controller.signal);
      if (controller.signal.aborted) return;
      setSuggestions(value);
      if (!value) setNotice("No CV is available yet. You can complete every section manually, or upload a CV from Overview.");
    } catch (cause: unknown) {
      if (controller.signal.aborted) return;
      setError(cause instanceof Error ? cause.message : "Could not load CV suggestions.");
    } finally { if (!controller.signal.aborted) { setBusy(false); setAction(null); } }
  }

  function exportDraft() {
    if (!data) return;
    const blob = new Blob([JSON.stringify({
      format: "kamkhoj-career-profile-v1", exportedAt: new Date().toISOString(),
      basedOnVersion: data.version, hasUnsavedChanges: dirty,
      profile: data.profile, aiSettings: data.aiSettings,
      confirmedAt: dirty ? null : data.confirmedAt,
    }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "kamkhoj-career-profile.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Profile copy downloaded. It contains personal information; store it securely.");
  }

  function reload() {
    if (dirty && !window.confirm("Discard your unsaved edits and load the latest saved profile?")) return;
    setSuggestions(null); setNotice(""); setReloadKey((value) => value + 1);
  }

  if (status === "unauthenticated") return <section className="rounded-xl border border-border bg-card p-6 text-card-foreground"><h1 className="text-2xl font-bold">Your career profile</h1><p className="mt-3"><Link className="underline" href="/login?callbackUrl=%2Fdashboard%2Fprofile">Sign in</Link> to create or edit your profile.</p></section>;
  if (status === "loading" || loading) return <p className="mt-10 text-muted-foreground" role="status">Loading your career profile…</p>;
  if (!data) return <section className="mt-10 rounded-xl border border-border p-6"><p role="alert" className="text-foreground">{error}</p><button type="button" onClick={reload} className={`${buttonClass} mt-4`}>Retry loading profile</button></section>;
  const p = data.profile;
  const savedAndConfirmed = !dirty && Boolean(data.confirmedAt);

  return (
    <section id="career-profile" aria-labelledby="career-profile-heading" className="text-foreground">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 id="career-profile-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">Your career profile</h1>
          <p className="mt-3 max-w-prose text-base leading-7 text-muted-foreground">Your experience, ready for the next opportunity.</p>
        </div>
        <button type="button" onClick={exportDraft} className={`${buttonClass} inline-flex items-center gap-2`}><Download aria-hidden="true" className="h-4 w-4" />Download profile copy</button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{data.version ? `Saved version ${data.version}` : "Start with a few details; a CV is optional"} · {dirty ? "Unsaved changes — save before leaving this page" : data.confirmedAt ? "Facts confirmed" : "Draft — facts not yet confirmed"}</p>
      <nav aria-label="Profile sections" className="my-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {steps.map((label, index) => <button key={label} type="button" disabled={busy} aria-current={step === index ? "step" : undefined} onClick={() => setStep(index)} className={`flex min-h-16 items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${step === index ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:bg-secondary"}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${step === index ? "border-current" : "border-border"}`}>{index + 1}</span>{label}</button>)}
      </nav>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-7">
      <h2 className="text-xl font-bold sm:text-2xl">{sectionTitles[step]}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{sectionDescriptions[step]}</p>
      {error && <p role="alert" className="mt-5 break-words rounded-lg border border-destructive p-3 text-sm text-foreground">{error}</p>}
      {notice && <p role="status" className="mt-5 text-sm text-foreground">{notice}</p>}
      {conflict && <button type="button" onClick={reload} className={`${buttonClass} mt-3`}>Reload latest saved profile</button>}
      <form aria-busy={busy} onSubmit={(event) => { event.preventDefault(); void save(); }}>
        <fieldset disabled={busy || conflict} className="mt-6 min-w-0 space-y-5 disabled:opacity-60">
          <legend className="sr-only">{steps[step]}</legend>
          {step === 0 && <>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" value={p.fullName} maxLength={160} onChange={(value) => update("fullName", value)} autoComplete="name" />
              <Field label="Professional title" value={p.professionalTitle} maxLength={160} onChange={(value) => update("professionalTitle", value)} />
              <Field label="Phone (optional)" value={p.phone} maxLength={40} type="tel" autoComplete="tel" onChange={(value) => update("phone", value)} />
              <Field label="Current location" value={p.location} maxLength={160} onChange={(value) => update("location", value)} />
            </div>
            <p className="break-all text-sm text-muted-foreground">Account email: {data.accountEmail}. This is managed by your account, not your CV.</p>
            <Field label="Professional summary" value={p.summary} maxLength={5000} multiline onChange={(value) => update("summary", value)} />
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <button type="button" onClick={() => void previewCv()} className={`${buttonClass} inline-flex items-center gap-2`}><FileText aria-hidden="true" className="h-4 w-4" />{action === "cv" ? "Loading suggestions…" : "Preview suggestions from my CV"}</button>
              <Link href="/dashboard" className="text-sm font-semibold text-accent underline underline-offset-4">Upload or replace CV</Link>
            </div>
            {suggestions && <div className="space-y-3 border-t border-border pt-4">
              <h3 className="font-semibold">Unconfirmed suggestions from {suggestions.filename}</h3>
              <p className="text-sm text-muted-foreground">Using these replaces your draft title, summary and skills. Review them before saving.</p>
              <p className="font-medium">{suggestions.professionalTitle || "No title extracted"}</p>
              <p className="whitespace-pre-wrap text-sm">{suggestions.summary || "No summary extracted"}</p>
              <p className="text-sm">{suggestions.skills.join(", ") || "No skills extracted"}</p>
              <button type="button" className={buttonClass} onClick={() => {
                if ((p.professionalTitle || p.summary || p.skills.length) && !window.confirm("Replace your draft title, summary and skills with these CV suggestions?")) return;
                setData({ ...data, profile: { ...p, professionalTitle: suggestions.professionalTitle, summary: suggestions.summary, skills: suggestions.skills } });
                setDirty(true); setConfirmed(false); setSuggestions(null); setNotice("Suggestions added to your draft. Review and save when ready.");
              }}>Use these suggestions in my draft</button>
              <button type="button" className={`${buttonClass} ml-2`} onClick={() => setSuggestions(null)}>Dismiss</button>
            </div>}
          </>}
          {step === 1 && <>
            <Group title="Experience" empty={!p.experience.length} emptyText="No experience added. New to work? You can skip this and add your education or projects.">
              {p.experience.map((entry, index) => <div key={index} className="space-y-4 border-b border-border py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={`Role ${index + 1}`} value={entry.title} maxLength={160} onChange={(value) => update("experience", p.experience.map((item, i) => i === index ? { ...item, title: value } : item))} />
                  <Field label="Employer / organization" value={entry.organization} maxLength={160} onChange={(value) => update("experience", p.experience.map((item, i) => i === index ? { ...item, organization: value } : item))} />
                  <Field label="Start month (AD)" type="month" value={entry.startMonth} onChange={(value) => update("experience", p.experience.map((item, i) => i === index ? { ...item, startMonth: value } : item))} />
                  {!entry.current && <Field label="End month (AD)" type="month" value={entry.endMonth} onChange={(value) => update("experience", p.experience.map((item, i) => i === index ? { ...item, endMonth: value } : item))} />}
                </div>
                <Toggle label="I currently work here" checked={entry.current} onChange={(value) => update("experience", p.experience.map((item, i) => i === index ? { ...item, current: value, endMonth: value ? "" : item.endMonth } : item))} />
                <Field label="Responsibilities and achievements" value={entry.description} maxLength={5000} multiline onChange={(value) => update("experience", p.experience.map((item, i) => i === index ? { ...item, description: value } : item))} />
                <button type="button" className={buttonClass} onClick={() => update("experience", p.experience.filter((_, i) => i !== index))}>Remove role {index + 1}</button>
              </div>)}
              <button type="button" disabled={p.experience.length >= 30} className={buttonClass} onClick={() => update("experience", [...p.experience, { title: "", organization: "", startMonth: "", endMonth: "", current: false, description: "" }])}>Add experience</button>
            </Group>
            <Group title="Education" empty={!p.education.length} emptyText="Add a qualification, or leave this section empty for now.">
              {p.education.map((entry, index) => <div key={index} className="space-y-4 border-b border-border py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={`Qualification ${index + 1}`} value={entry.qualification} maxLength={160} onChange={(value) => update("education", p.education.map((item, i) => i === index ? { ...item, qualification: value } : item))} />
                  <Field label="Institution" value={entry.institution} maxLength={160} onChange={(value) => update("education", p.education.map((item, i) => i === index ? { ...item, institution: value } : item))} />
                  <Field label="Start month (AD)" type="month" value={entry.startMonth} onChange={(value) => update("education", p.education.map((item, i) => i === index ? { ...item, startMonth: value } : item))} />
                  <Field label="End month (AD, optional)" type="month" value={entry.endMonth} onChange={(value) => update("education", p.education.map((item, i) => i === index ? { ...item, endMonth: value } : item))} />
                </div>
                <Field label="Additional details" value={entry.description} maxLength={3000} multiline onChange={(value) => update("education", p.education.map((item, i) => i === index ? { ...item, description: value } : item))} />
                <button type="button" className={buttonClass} onClick={() => update("education", p.education.filter((_, i) => i !== index))}>Remove qualification {index + 1}</button>
              </div>)}
              <button type="button" disabled={p.education.length >= 20} className={buttonClass} onClick={() => update("education", [...p.education, { qualification: "", institution: "", startMonth: "", endMonth: "", description: "" }])}>Add education</button>
            </Group>
          </>}
          {step === 2 && <>
            <Tags label="Skills" values={p.skills} onChange={(value) => update("skills", value)} />
            <Tags label="Languages" values={p.languages} onChange={(value) => update("languages", value)} />
            <Group title="Projects" empty={!p.projects.length} emptyText="Show work you are proud of, including personal or college projects.">
              {p.projects.map((entry, index) => <div key={index} className="space-y-4 border-b border-border py-5">
                <Field label={`Project ${index + 1}`} value={entry.name} maxLength={160} onChange={(value) => update("projects", p.projects.map((item, i) => i === index ? { ...item, name: value } : item))} />
                <Field label="Your contribution" value={entry.description} maxLength={5000} multiline onChange={(value) => update("projects", p.projects.map((item, i) => i === index ? { ...item, description: value } : item))} />
                <button type="button" className={buttonClass} onClick={() => update("projects", p.projects.filter((_, i) => i !== index))}>Remove project {index + 1}</button>
              </div>)}
              <button type="button" disabled={p.projects.length >= 30} className={buttonClass} onClick={() => update("projects", [...p.projects, { name: "", description: "" }])}>Add project</button>
            </Group>
            <Group title="Professional links" empty={!p.links.length} emptyText="Add your portfolio or professional profiles. Use full https:// links.">
              {p.links.map((entry, index) => <div key={index} className="space-y-4 border-b border-border py-5">
                <Field label={`Link name ${index + 1}`} value={entry.label} maxLength={80} onChange={(value) => update("links", p.links.map((item, i) => i === index ? { ...item, label: value } : item))} />
                <Field label="URL" type="url" value={entry.url} maxLength={2048} onChange={(value) => update("links", p.links.map((item, i) => i === index ? { ...item, url: value } : item))} />
                <button type="button" className={buttonClass} onClick={() => update("links", p.links.filter((_, i) => i !== index))}>Remove link {index + 1}</button>
              </div>)}
              <button type="button" disabled={p.links.length >= 20} className={buttonClass} onClick={() => update("links", [...p.links, { label: "", url: "" }])}>Add link</button>
            </Group>
          </>}
          {step === 3 && <>
            <p className="text-sm leading-6 text-muted-foreground">These preferences are saved for the upcoming document workflow. They do not yet change matching or interview behavior.</p>
            {([ ["tailorResume", "Tailor my resume to the job"], ["coverLetter", "Prepare a cover letter"], ["gapQuestions", "Ask me about missing information"] ] as const).map(([key, label]) => <Toggle key={key} label={label} checked={data.aiSettings[key]} onChange={(value) => { setData({ ...data, aiSettings: { ...data.aiSettings, [key]: value } }); setDirty(true); setNotice(""); }} />)}
            <label className="block text-sm font-medium">Document language<select className={inputClass} value={data.aiSettings.language} onChange={(event) => { const language = event.target.value; if (language === "auto" || language === "en" || language === "ne") { setData({ ...data, aiSettings: { ...data.aiSettings, language } }); setDirty(true); setNotice(""); } }}><option value="auto">Match the job language</option><option value="en">English</option><option value="ne">Nepali</option></select></label>
            <p className="border-t border-border pt-4 text-sm leading-6">Review before submission is required. Automatic application submission is not enabled.</p>
          </>}
          <div className="space-y-4 border-t border-border pt-5">
            <Toggle label="I have reviewed the profile facts and confirm they are accurate" checked={confirmed} onChange={(value) => { setConfirmed(value); setDirty(true); setNotice(""); }} />
            <p className="text-xs leading-5 text-muted-foreground">Leave unchecked to save a draft. Changing a career fact requires confirmation again. Saving does not grant permission to apply on your behalf.</p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={!dirty || busy} className="rounded-lg bg-accent px-5 py-3 text-sm font-bold text-accent-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">{action === "save" ? "Saving…" : "Save profile"}</button>
              {step > 0 && <button type="button" className={buttonClass} onClick={() => setStep(step - 1)}>Previous section</button>}
              {step < steps.length - 1 && <button type="button" className={buttonClass} onClick={() => setStep(step + 1)}>Next section</button>}
            </div>
          </div>
        </fieldset>
      </form>
      </div>
      <aside aria-labelledby="profile-guidance-heading" className="rounded-xl border border-border bg-secondary/50 p-6 xl:sticky xl:top-6">
        <h2 id="profile-guidance-heading" className="text-xl font-bold">Before you apply</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">A few steps to keep your applications accurate and in your control.</p>
        <ul className="mt-6 space-y-6">
          <li className="flex gap-3">{savedAndConfirmed ? <CheckCircle2 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-accent" /> : <Circle aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />}<div><h3 className="text-sm font-semibold">Confirm your experience</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{savedAndConfirmed ? "Your saved profile facts are confirmed." : "Review your details, check confirmation, then save."}</p></div></li>
          <li className="flex gap-3"><FileText aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" /><div><h3 className="text-sm font-semibold">Review CV suggestions</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Extracted text is a starting point. Correct mistakes before using it.</p></div></li>
          <li className="flex gap-3"><ShieldCheck aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" /><div><h3 className="text-sm font-semibold">Choose each application</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Saving this profile does not authorize an application or spend credits.</p></div></li>
        </ul>
        <div className="mt-6 border-t border-border pt-5"><h3 className="text-sm font-semibold">Keep your own copy</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Download your draft before reloading after a conflict. Your edits are not stored in browser storage.</p></div>
      </aside>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, multiline = false, type = "text", maxLength, autoComplete }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string; maxLength?: number; autoComplete?: string }) {
  return <label className="block text-sm font-medium">{label}{multiline ? <textarea className={inputClass} rows={5} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} /> : <input className={inputClass} type={type} value={value} maxLength={maxLength} autoComplete={autoComplete} onChange={(event) => onChange(event.target.value)} />}</label>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-accent focus-visible:ring-2 focus-visible:ring-ring" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}
function Group({ title, empty, emptyText, children }: { title: string; empty: boolean; emptyText: string; children: ReactNode }) {
  return <section className="space-y-4 pt-3"><h3 className="text-lg font-semibold">{title}</h3>{empty && <p className="text-sm text-muted-foreground">{emptyText}</p>}{children}</section>;
}
function Tags({ label, values, onChange }: { label: string; values: string[]; onChange: (value: string[]) => void }) {
  const [draft, setDraft] = useState("");
  function add() {
    const value = draft.trim();
    if (!value || values.length >= 100) return;
    if (!values.some((item) => item.toLowerCase() === value.toLowerCase())) onChange([...values, value]);
    setDraft("");
  }
  return <div className="space-y-3"><label className="block text-sm font-medium">{label}<input className={inputClass} value={draft} maxLength={100} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} /></label><button type="button" className={buttonClass} disabled={!draft.trim() || values.length >= 100} onClick={add}>Add to {label.toLowerCase()}</button><ul className="flex flex-wrap gap-2">{values.map((value, index) => <li key={`${value}-${index}`}><button type="button" className={buttonClass} aria-label={`Remove ${value} from ${label.toLowerCase()}`} onClick={() => onChange(values.filter((_, i) => i !== index))}>{value} · Remove</button></li>)}</ul></div>;
}
