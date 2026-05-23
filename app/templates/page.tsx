import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const THEMES = [
  { id: "navy", name: "Corporate Navy", category: "Corporate", bg: ["#020617", "#0f172a", "#1e3a8a"], accent: "#60a5fa", glow: "#3b82f6" },
  { id: "executive", name: "Executive Slate", category: "Professional", bg: ["#09090b", "#18181b", "#27272a"], accent: "#e4e4e7", glow: "#a1a1aa" },
  { id: "pristine", name: "Pristine", category: "Minimal", bg: ["#000000", "#111827", "#1f2937"], accent: "#f3f4f6", glow: "#e5e7eb" },
  { id: "royal", name: "Royal", category: "Creative", bg: ["#0d0221", "#4a00e0", "#8e2de2"], accent: "#c084fc", glow: "#7c3aed" },
  { id: "ocean", name: "Ocean", category: "Tech", bg: ["#020c1b", "#0a3c6e", "#1e90ff"], accent: "#60c4ff", glow: "#0ea5e9" },
  { id: "forest", name: "Forest", category: "Eco / Growth", bg: ["#071a0e", "#14532d", "#4ade80"], accent: "#86efac", glow: "#22c55e" },
  { id: "ember", name: "Ember", category: "Dynamic", bg: ["#1c0700", "#9a3412", "#f97316"], accent: "#fdba74", glow: "#f97316" },
  { id: "cosmos", name: "Cosmos", category: "Web3 / Crypto", bg: ["#0a0515", "#3b0764", "#7c3aed"], accent: "#e879f9", glow: "#a855f7" },
  { id: "rose", name: "Rose", category: "Fashion / Beauty", bg: ["#1a0010", "#9d174d", "#ec4899"], accent: "#f9a8d4", glow: "#ec4899" },
  { id: "teal", name: "Teal", category: "Modern", bg: ["#001a1f", "#0e7490", "#22d3ee"], accent: "#67e8f9", glow: "#06b6d4" },
  { id: "gold", name: "Gold", category: "Luxury", bg: ["#1a1000", "#78350f", "#f59e0b"], accent: "#fde68a", glow: "#f59e0b" },
  { id: "white", name: "Clean Light", category: "Clean", bg: ["#ffffff", "#f8f9fa", "#e2e8f0"], accent: "#0f172a", glow: "#94a3b8" },
];

export default function TemplatesPage() {
  return (
    <AppShell>
      <div className="relative min-h-[calc(100vh-88px)] w-full overflow-hidden">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

        <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 md:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-white via-violet-100 to-cyan-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl lg:text-6xl">
              Stunning Templates
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/60">
              Start with a professionally crafted color theme. One click to apply it to your profile poster in the editor.
            </p>
          </div>

          {/* Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {THEMES.map((theme) => {
              const bgGradient = `linear-gradient(135deg, ${theme.bg[0]}, ${theme.bg[1]}, ${theme.bg[2]})`;

              return (
                <Link
                  key={theme.id}
                  href={`/editor?theme=${theme.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0515]/80 p-3 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:border-white/20"
                >
                  {/* Card Glow on Hover */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${theme.accent}, transparent 70%)` }}
                  />

                  {/* Template Preview Box */}
                  <div
                    className="relative mb-4 aspect-square w-full overflow-hidden rounded-2xl border border-white/5 shadow-inner"
                    style={{ background: bgGradient }}
                  >
                    {/* Ring */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="h-32 w-32 rounded-full border-[6px]"
                        style={{ borderColor: theme.accent, boxShadow: `0 0 20px ${theme.glow}66` }}
                      />
                    </div>

                    {/* Text overlays */}
                    <div className="absolute left-4 top-4 rounded-full bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md border border-white/10">
                      Brand
                    </div>
                    <div
                      className="absolute bottom-4 left-4 right-4 text-center text-3xl font-black tracking-tight"
                      style={{ color: theme.id === "white" ? "#0f172a" : "#ffffff" }}
                    >
                      {theme.name.split(' ')[0]}
                    </div>

                    {/* Decorative subtle pattern */}
                    <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Ccircle cx=\"2\" cy=\"2\" r=\"1\" fill=\"rgba(255,255,255,0.05)\"/%3E%3C/svg%3E')" }} />
                  </div>

                  {/* Info Section */}
                  <div className="flex flex-1 flex-col justify-between px-3 pb-2">
                    <div>
                      <h2 className="text-lg font-bold text-white transition-colors group-hover:text-violet-200">
                        {theme.name}
                      </h2>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/40">
                        {theme.category}
                      </p>
                    </div>

                    {/* Action button inside card */}
                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {theme.bg.map((color, i) => (
                          <div
                            key={i}
                            className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors group-hover:bg-white group-hover:text-[#0f0c29]">
                        Use Theme
                        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })} 
          </div>
        </main>
      </div>
    </AppShell>
  );
}
