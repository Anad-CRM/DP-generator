"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/lib/storage";
import type { StudioProject } from "@/lib/types";

export function ProjectsClient() {
  const [projects, setProjects] = useState<StudioProject[]>([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  if (!projects.length) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-white/18 bg-white/[.04] p-10 text-center">
        <h2 className="text-2xl font-bold text-white">No saved projects yet</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/62">Create a DP in the editor and save it locally. The backend adapter is ready for Supabase/Firebase project persistence.</p>
        <Link href="/editor" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-ink">
          Open editor
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <article key={project.id} className="glass rounded-2xl p-4">
          <div className="aspect-square rounded-xl border border-white/10" style={{ background: project.background }} />
          <h2 className="mt-4 font-bold text-white">{project.name}</h2>
          <p className="mt-1 text-sm text-white/50">{new Date(project.updatedAt).toLocaleString()}</p>
        </article>
      ))}
    </div>
  );
}
