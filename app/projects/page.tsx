import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProjectsClient } from "@/components/projects-client";

export default function ProjectsPage() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-limeGlow">Saved work</p>
            <h1 className="mt-3 text-4xl font-extrabold text-white">Projects</h1>
          </div>
          <Link href="/editor" className="focus-ring rounded-xl bg-white px-5 py-3 font-semibold text-ink shadow-neon">
            Create project
          </Link>
        </div>
        <ProjectsClient />
      </main>
    </AppShell>
  );
}
