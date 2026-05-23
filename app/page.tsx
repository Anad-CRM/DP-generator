import Link from "next/link";
import { ArrowRight, Sparkles, UploadCloud, Palette, Download, Type, Star } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { HeroPreview } from "@/components/hero-preview";
import { FeatureBand } from "@/components/feature-band";

const logos = ["OrbitAI", "Nova Campus", "FounderX", "Pixel Guild", "LaunchLab"];

export default function LandingPage() {
  return (
    <AppShell>
      {/* ── Hero ── */}
      <section className="relative mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-10 md:grid-cols-[1fr_1fr] md:px-6 lg:px-8">

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-500/8 blur-[100px]" />

        {/* Left – Copy */}
        <div className="relative z-10 flex flex-col">

          {/* Eyebrow pill */}
          <div className="mb-7 inline-flex w-fit items-center gap-2.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-sm text-violet-300 backdrop-blur-sm">
            <Sparkles size={14} className="text-violet-300" />
            <span className="font-semibold tracking-wide">Instant branded profile pictures</span>
          </div>

          {/* Headline */}
          <h1 className="mb-5 text-5xl font-extrabold leading-[.94] tracking-tight text-white md:text-6xl lg:text-7xl">
            Your Brand,
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Your Identity
            </span>
          </h1>

          {/* Sub-copy */}
          <p className="mb-8 max-w-lg text-lg leading-relaxed text-white/60">
            Upload a photo, pick a stunning gradient template, personalise with your name — and download a crisp social-media-ready branded DP in seconds.
          </p>

          {/* CTA buttons */}
          <div className="mb-10 flex flex-wrap gap-3">
            <Link
              href="/editor"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 font-semibold text-white shadow-[0_4px_24px_rgba(139,92,246,0.45)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_6px_32px_rgba(139,92,246,0.65)]"
            >
              Open Editor
              <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-6 py-3.5 font-semibold text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Browse Templates
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex items-center gap-3 text-sm text-white/40">
            <div className="flex -space-x-2">
              {["V", "A", "M", "J"].map((l, i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0f0c29] bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-bold text-white"
                >
                  {l}
                </div>
              ))}
            </div>
            <span>Loved by <span className="font-semibold text-white/70">1,200+ creators</span></span>
          </div>

          {/* Stats */}
          <div className="mt-8 grid max-w-sm grid-cols-3 gap-3 text-sm">
            <Stat value="7+" label="Templates" />
            <Stat value="HD" label="PNG Export" />
            <Stat value="∞" label="Variations" />
          </div>
        </div>

        {/* Right – Live preview card */}
        <div className="relative z-10 flex items-center justify-center">
          <HeroPreview />
        </div>
      </section>

      {/* ── Logo marquee ── */}
      <section className="relative overflow-hidden border-y border-white/8 bg-white/[.03] py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-4">
          {logos.map((logo) => (
            <span
              key={logo}
              className="text-xs font-bold uppercase tracking-[.2em] text-white/30 transition hover:text-white/60"
            >
              {logo}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <FeatureBand
        eyebrow="Simple workflow"
        title="Everything needed for clean branded profile posters."
        features={[
          { icon: UploadCloud, title: "Photo upload", body: "Place and resize a profile photo directly on the canvas." },
          { icon: Palette, title: "Fixed templates", body: "Choose modern neon backgrounds with circular brand shapes." },
          { icon: Type, title: "Editable name", body: "Change name, font, color, and position without complex tools." },
          { icon: Download, title: "PNG export", body: "Download a crisp square profile poster instantly." },
        ]}
      />

      {/* ── Social proof callout ── */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center md:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-cyan-600/10 p-10 shadow-2xl backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent" />
          <div className="relative z-10">
            <div className="mb-4 flex justify-center gap-1">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="mb-4 text-lg font-medium leading-relaxed text-white/80">
              "BrandDP Studio saved us hours of Photoshop work. Our entire team now has matching branded profile pictures in minutes."
            </blockquote>
            <p className="text-sm font-semibold text-violet-300">— Sarah K., Community Manager at FounderX</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-start rounded-2xl border border-white/8 bg-white/[.045] p-4 backdrop-blur-sm">
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-white/45">{label}</div>
    </div>
  );
}
