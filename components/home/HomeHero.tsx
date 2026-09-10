import {
  ArrowRight,
  BriefcaseBusiness,
  BarChart3,
  MapPin,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

export function HomeHero() {
  return (
    <section className="reference-hero relative overflow-hidden border-b border-slate-100">
      <div className="absolute inset-0 bg-[url('/nepal-career-hero.png')] bg-cover bg-right bg-no-repeat" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#f8fbff_0%,rgba(248,251,255,.96)_29%,rgba(248,251,255,.12)_66%,rgba(248,251,255,0)_100%)]" />
      <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-10 sm:px-8 lg:px-10 lg:pb-16 lg:pt-14">
        <div className="max-w-[620px]">
          <p className="home-eyebrow">
            <span />
            Nepal's job search platform
          </p>
          <h1 className="mt-4 text-5xl font-black leading-[.98] tracking-[-.055em] text-[#112d62] sm:text-6xl lg:text-[4.3rem]">
            Better jobs
            <br />
            brighter tomorrows
            <br />
            for a <span className="text-primary">stronger Nepal.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-6 text-slate-600">
            Discover meaningful job opportunities from top companies across Nepal. Your next career
            move starts here.
          </p>
          <form
            action="/jobs"
            method="get"
            className="mt-7 grid max-w-3xl gap-2 rounded-xl border border-blue-100 bg-white/95 p-2 shadow-[0_12px_35px_rgba(27,85,160,.12)] backdrop-blur sm:grid-cols-[1.3fr_1fr_auto]"
          >
            <label className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-500 focus-within:bg-blue-50">
              <Search className="h-4 w-4 text-primary" />
              <input
                name="search"
                placeholder="Job title, skill or keyword"
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
              />
            </label>
            <label className="flex items-center gap-2 rounded-lg border-t border-slate-100 px-3 py-2.5 text-sm text-slate-500 focus-within:bg-blue-50 sm:border-l sm:border-t-0">
              <MapPin className="h-4 w-4 text-primary" />
              <input
                name="hero-location"
                placeholder="Select location"
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
              />
            </label>
            <button type="submit" className="primary-button justify-center">
              Search jobs <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
            <span className="font-semibold">Popular searches:</span>
            <span className="search-chip">IT & Software</span>
            <span className="search-chip">Banking</span>
            <span className="search-chip">Education</span>
            <span className="search-chip">Remote</span>
            <span className="search-chip">Internship</span>
          </div>
        </div>
        <div className="mt-9 grid max-w-3xl grid-cols-2 gap-4 border-t border-slate-200/80 pt-5 sm:grid-cols-4">
          <HeroStat icon={BarChart3} value="2,500+" label="Active job listings" />
          <HeroStat icon={BriefcaseBusiness} value="500+" label="Trusted companies" />
          <HeroStat icon={ShieldCheck} value="100%" label="Free for you" />
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BarChart3;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 text-primary" />
      <div>
        <p className="text-base font-black text-[#112d62]">{value}</p>
        <p className="text-[10px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}
