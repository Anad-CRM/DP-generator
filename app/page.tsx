import Link from "next/link";
import { ArrowRight, Sparkles, UploadCloud, Palette, Download, Type } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { HeroPreview } from "@/components/hero-preview";
import { FeatureBand } from "@/components/feature-band";

const logos = ["OrbitAI", "Nova Campus", "FounderX", "Pixel Guild", "LaunchLab"];

export default function LandingPage() {
  return (
    <AppShell>
      <section className="relative mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-16 pt-8 md:grid-cols-[.92fr_1.08fr] md:px-6 lg:px-8">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/75">
            <Sparkles size={16} className="text-cyanGlow" />
            Simple branded profile picture maker
          </div>
          <h1 className="text-5xl font-extrabold leading-[.96] tracking-normal text-white md:text-7xl">
            BrandDP Studio
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">Upload a photo, pick a professional gradient template, add your name, and download a social-media-ready branded DP in one click.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/editor"
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-ink shadow-neon transition hover:scale-[1.02]"
            >
              Open editor <ArrowRight size={18} />
            </Link>
            <Link
              href="/templates"
              className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-5 py-3 font-semibold text-white transition hover:bg-white/14"
            >
              Browse templates
            </Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 text-sm text-white/65">
            <Stat value="7" label="campaign templates" />
            <Stat value="HD" label="PNG/JPG export" />
            <Stat value="∞" label="brand variations" />
          </div>
        </div>
        <HeroPreview />
      </section>

      <section className="border-y border-white/10 bg-white/[.035] py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 text-sm font-semibold uppercase tracking-[.18em] text-white/42">
          {logos.map((logo) => (
            <span key={logo}>{logo}</span>
          ))}
        </div>
      </section>

      <FeatureBand
        eyebrow="Simple workflow"
        title="Everything needed for clean branded profile posters."
        features={[
          { icon: UploadCloud, title: "Photo upload", body: "Place and resize a profile photo directly on the canvas." },
          { icon: Palette, title: "Fixed templates", body: "Choose modern neon backgrounds with circular brand shapes." },
          { icon: Type, title: "Editable name", body: "Change name, font, color, and position without complex tools." },
          { icon: Download, title: "PNG export", body: "Download a crisp square profile poster instantly." }
        ]}
      />
    </AppShell>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-1 text-white/55">{label}</div>
    </div>
  );
}
