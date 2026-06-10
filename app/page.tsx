import Link from "next/link";
import {
  ArrowRight,
  UploadCloud,
  Palette,
  Download,
  ImageIcon,
  Trophy,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";

const steps = [
  {
    icon: UploadCloud,
    step: "1",
    title: "Upload your photo",
    body: "Choose a clear photo of yourself — portrait or square works best.",
  },
  {
    icon: Palette,
    step: "2",
    title: "Pick a template",
    body: "Select from curated gradient backgrounds with your brand's style.",
  },
  {
    icon: ImageIcon,
    step: "3",
    title: "Add your name",
    body: "Type your name, pick a font, and position it exactly where you want.",
  },
  {
    icon: Download,
    step: "4",
    title: "Download HD PNG",
    body: "Get a crisp, ready-to-use profile picture in seconds.",
  },
];

const tools = [
  {
    icon: Sparkles,
    href: "/editor",
    label: "Profile DP Maker",
    desc: "Upload a photo, pick a gradient template, add your name — download a branded profile picture instantly.",
    cta: "Open Editor",
    color: "from-violet-600 to-fuchsia-600",
    glow: "rgba(139,92,246,0.4)",
  },
  {
    icon: Trophy,
    href: "/top-performer",
    label: "🏆 Top Performer Cards",
    desc: "Celebrate star performers of the week, month or year with 4 stunning, shareable award card templates.",
    cta: "Create Award Card",
    color: "from-amber-500 to-orange-500",
    glow: "rgba(245,158,11,0.4)",
  },
];

export default function LandingPage() {
  return (
    <AppShell>
      {/* ── Hero ── */}
      <section className="relative mx-auto flex min-h-[calc(100vh-88px)] max-w-3xl flex-col items-center justify-center gap-6 px-5 py-20 text-center">
        {/* Soft glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[440px] w-[440px] rounded-full bg-violet-600/15 blur-[110px]" />
        </div>

        {/* Badge */}
        <div className="relative inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
          <span className="inline-block h-2 w-2 rounded-full bg-violet-400" />
          Free · No sign-up needed · 2 powerful tools
        </div>

        {/* Headline */}
        <h1 className="relative text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
          Create beautiful{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            profile cards
          </span>{" "}
          in seconds
        </h1>

        {/* Sub-copy */}
        <p className="relative max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
          Make branded profile DPs or stunning award cards for top performers —
          upload a photo, pick a template, download instantly. No design skills required.
        </p>

        {/* CTAs */}
        <div className="relative mt-2 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/editor"
            className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-base font-semibold text-white shadow-[0_4px_28px_rgba(139,92,246,0.45)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_6px_36px_rgba(139,92,246,0.65)]"
          >
            Make my DP
            <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/top-performer"
            className="group inline-flex items-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-7 py-3.5 text-base font-semibold text-amber-300 transition-all duration-200 hover:bg-amber-500/20 hover:text-amber-200"
          >
            🏆 Award Cards
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Trust line */}
        <p className="relative text-xs text-white/30">
          Loved by <span className="font-medium text-white/55">1,200+ creators</span> · HD PNG export · 7+ templates
        </p>
      </section>

      {/* ── Tools Section ── */}
      <section className="mx-auto max-w-4xl px-5 pb-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-400">
            What you can make
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Two tools, endless possibilities
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {tools.map(({ icon: Icon, href, label, desc, cta, color, glow }) => (
            <div
              key={href}
              className="glass flex flex-col gap-5 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
            >
              <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${color}`}>
                <Icon size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{desc}</p>
              </div>
              <Link
                href={href}
                className="group mt-auto inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                {cta}
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-400">
            How it works
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Four simple steps
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, step, title, body }) => (
            <div
              key={step}
              className="glass flex flex-col gap-4 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/15">
                  <Icon size={20} className="text-violet-300" />
                </div>
                <span className="text-3xl font-extrabold text-white/10">{step}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/50">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/editor"
            className="group inline-flex items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-6 py-3 text-sm font-semibold text-violet-300 transition-all duration-200 hover:bg-violet-500/20 hover:text-violet-200"
          >
            Open the editor
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
