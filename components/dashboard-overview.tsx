"use client";

import Link from "next/link";
import { BarChart3, ImageUp, Palette, Users } from "lucide-react";
import { getProjects } from "@/lib/storage";

const cards = [
  { label: "Active projects", value: "12", icon: BarChart3 },
  { label: "Brand kits", value: "4", icon: Palette },
  { label: "Cloud uploads", value: "128", icon: ImageUp },
  { label: "Team members", value: "8", icon: Users }
];

export function DashboardOverview() {
  const saved = getProjects();

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_.72fr]">
      <section className="grid gap-5 sm:grid-cols-2">
        {cards.map((card) => (
          <article key={card.label} className="glass rounded-2xl p-5">
            <card.icon className="text-cyanGlow" />
            <div className="mt-8 text-4xl font-extrabold text-white">{card.value}</div>
            <div className="mt-1 text-white/58">{card.label}</div>
          </article>
        ))}
      </section>
      <aside className="glass rounded-2xl p-5">
        <h2 className="text-xl font-bold text-white">Recent projects</h2>
        <div className="mt-5 space-y-3">
          {(saved.length ? saved.slice(0, 4) : seedProjects).map((project) => (
            <Link key={project.id} href="/projects" className="block rounded-xl border border-white/10 bg-white/[.055] p-4 transition hover:bg-white/10">
              <div className="font-bold text-white">{project.name}</div>
              <div className="mt-1 text-sm text-white/50">{project.updatedAt}</div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

const seedProjects = [
  { id: "1", name: "Launch Week DPs", updatedAt: "Prototype" },
  { id: "2", name: "Campus Ambassador Batch", updatedAt: "Prototype" },
  { id: "3", name: "Creator Drop Campaign", updatedAt: "Prototype" }
];
