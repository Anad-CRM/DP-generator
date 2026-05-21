import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DashboardOverview } from "@/components/dashboard-overview";

export default function DashboardPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-cyanGlow">Workspace</p>
            <h1 className="mt-3 text-4xl font-extrabold text-white">Campaign dashboard</h1>
            <p className="mt-3 max-w-2xl text-white/65">Manage brand kits, recent projects, team templates, and export targets from one launchpad.</p>
          </div>
          <Link href="/editor" className="focus-ring rounded-xl bg-white px-5 py-3 font-semibold text-ink shadow-neon">
            New design
          </Link>
        </div>
        <DashboardOverview />
      </main>
    </AppShell>
  );
}
