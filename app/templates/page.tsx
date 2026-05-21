import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const templates = [
  { id: "aibi-purple", name: "AIBI Purple", category: "Campus / AI", background: "linear-gradient(135deg,#7c2dff,#bf32ff,#5a21d8)", accent: "#ff56f6", logoText: "aibi", posterText: "name" },
  { id: "neon-blue", name: "Neon Blue", category: "Startup", background: "linear-gradient(135deg,#06182f,#1262ff,#28d6ff)", accent: "#60f3ff", logoText: "nova", posterText: "name" },
  { id: "corporate-violet", name: "Corporate Violet", category: "Professional", background: "linear-gradient(135deg,#111827,#4c1d95,#8b5cf6)", accent: "#c4b5fd", logoText: "brand", posterText: "name" },
  { id: "creator-pink", name: "Creator Pink", category: "Creator", background: "linear-gradient(135deg,#3b0764,#db2777,#fb7185)", accent: "#fdf2f8", logoText: "studio", posterText: "name" },
  { id: "campus-green", name: "Campus Green", category: "Campus", background: "linear-gradient(135deg,#042f2e,#16a34a,#a3e635)", accent: "#ecfccb", logoText: "campus", posterText: "name" }
];

export default function TemplatesPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-fuchsiaGlow">Template gallery</p>
        <h1 className="mt-3 text-4xl font-extrabold text-white">Simple professional DP backgrounds</h1>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => (
            <Link key={template.id} href={`/editor?template=${template.id}`} className="group glass rounded-2xl p-4 transition hover:-translate-y-1">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10" style={{ background: template.background }}>
                <div className="absolute inset-8 rounded-full border-[18px]" style={{ borderColor: template.accent }} />
                <div className="absolute left-5 top-5 rounded-lg bg-white/14 px-3 py-2 text-xs font-bold text-white">{template.logoText}</div>
                <div className="absolute bottom-5 left-5 right-5 text-4xl font-extrabold leading-none text-white/90">{template.posterText}</div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-white">{template.name}</h2>
                  <p className="mt-1 text-sm text-white/55">{template.category}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/70 group-hover:bg-white group-hover:text-ink">Use</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
