import type { StudioProject } from "@/lib/types";

const KEY = "brand-dp-studio-projects";

export function getProjects(): StudioProject[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as StudioProject[];
  } catch {
    return [];
  }
}

export function saveProject(project: StudioProject) {
  if (typeof window === "undefined") return;
  const projects = getProjects();
  const next = [project, ...projects.filter((item) => item.id !== project.id)].slice(0, 24);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function duplicateProjectSeed(project: StudioProject): StudioProject {
  return {
    ...project,
    id: crypto.randomUUID(),
    name: `${project.name} Copy`,
    updatedAt: new Date().toISOString()
  };
}
