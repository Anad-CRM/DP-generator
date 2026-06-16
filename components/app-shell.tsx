import Link from "next/link";
import { Sparkles } from "lucide-react";

const nav = [
  ["Templates", "/templates"],
  ["Editor", "/editor"],
  ["🏆 Awards", "/top-performer"],
  ["🧾 Receipt", "/receipt"],
];

export function AppShell({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className={`sticky top-0 z-40 border-b border-white/10 bg-ink/70 backdrop-blur-xl ${compact ? "h-16" : "h-[88px]"}`}>
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <Link href="/" className="focus-ring flex items-center gap-3 rounded-lg">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-neon">
              <Sparkles size={20} />
            </span>
            <span className="text-lg font-extrabold text-white">TemplateStudio</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="focus-ring rounded-xl px-3 py-2 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <Link href="/editor" className="focus-ring rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-ink">
            Start
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
