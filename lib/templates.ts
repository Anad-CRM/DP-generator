import type { StudioLayer, StudioTemplate } from "@/lib/types";

const baseText = {
  kind: "text" as const,
  rotation: 0,
  opacity: 1,
  fontFamily: "Inter",
  align: "center" as const
};

const baseRing = {
  kind: "ring" as const,
  rotation: 0,
  opacity: 1,
  shape: "circle" as const,
  fill: "transparent"
};

function makeLayers(accent: string, secondary: string, title: string): StudioLayer[] {
  return [
    {
      id: "poster-word",
      name: "Bold campaign word",
      ...baseText,
      text: title.toUpperCase(),
      x: 42,
      y: 225,
      width: 756,
      height: 140,
      fontSize: 104,
      fontWeight: 800,
      color: "rgba(255,255,255,.18)",
      zIndex: 1
    },
    {
      id: "outer-ring",
      name: "Outer neon ring",
      ...baseRing,
      x: 132,
      y: 122,
      width: 576,
      height: 576,
      stroke: accent,
      strokeWidth: 28,
      shadow: `0 0 44px ${accent}`,
      zIndex: 2
    },
    {
      id: "inner-ring",
      name: "Inner electric ring",
      ...baseRing,
      x: 210,
      y: 198,
      width: 420,
      height: 420,
      stroke: secondary,
      strokeWidth: 10,
      shadow: `0 0 34px ${secondary}`,
      zIndex: 3
    },
    {
      id: "profile",
      name: "Profile image",
      kind: "image",
      x: 225,
      y: 168,
      width: 390,
      height: 500,
      rotation: 0,
      opacity: 1,
      zIndex: 5,
      radius: 220,
      fit: "cover"
    },
    {
      id: "logo",
      name: "Company logo",
      kind: "text",
      text: "BRAND",
      x: 288,
      y: 42,
      width: 264,
      height: 52,
      rotation: 0,
      opacity: 1,
      zIndex: 6,
      fontSize: 28,
      fontWeight: 800,
      color: "#FFFFFF",
      align: "center",
      fill: "rgba(255,255,255,.08)",
      radius: 18
    },
    {
      id: "name",
      name: "Name",
      ...baseText,
      text: "ALEX MORGAN",
      x: 128,
      y: 666,
      width: 584,
      height: 54,
      fontSize: 44,
      fontWeight: 800,
      color: "#FFFFFF",
      zIndex: 7
    },
    {
      id: "tagline",
      name: "Title",
      ...baseText,
      text: "AI COMMUNITY LEAD",
      x: 178,
      y: 724,
      width: 484,
      height: 36,
      fontSize: 22,
      fontWeight: 700,
      color: secondary,
      zIndex: 8
    },
    {
      id: "arrow",
      name: "Glow arrow",
      kind: "shape",
      shape: "arrow",
      x: 602,
      y: 118,
      width: 118,
      height: 86,
      rotation: -16,
      opacity: .95,
      zIndex: 4,
      fill: accent,
      shadow: `0 0 28px ${accent}`
    }
  ];
}

export const templates: StudioTemplate[] = [
  {
    id: "ai-startup",
    name: "AI Startup",
    category: "Launch team",
    background: "radial-gradient(circle at 50% 40%, #7627ff 0%, #17082f 44%, #05030c 100%)",
    accent: "#A855F7",
    secondary: "#22D3EE",
    logoText: "NEURAL",
    posterText: "AI",
    layers: makeLayers("#A855F7", "#22D3EE", "AI")
  },
  {
    id: "corporate",
    name: "Corporate",
    category: "Company profile",
    background: "linear-gradient(135deg, #111827 0%, #312e81 45%, #0f172a 100%)",
    accent: "#60A5FA",
    secondary: "#C4B5FD",
    logoText: "ACME",
    posterText: "LEAD",
    layers: makeLayers("#60A5FA", "#C4B5FD", "Lead")
  },
  {
    id: "campus",
    name: "Campus Ambassador",
    category: "University program",
    background: "radial-gradient(circle at 52% 35%, #ec4899 0%, #3b0764 48%, #09090b 100%)",
    accent: "#F0ABFC",
    secondary: "#BEF264",
    logoText: "CAMPUS",
    posterText: "CREW",
    layers: makeLayers("#F0ABFC", "#BEF264", "Crew")
  },
  {
    id: "speaker",
    name: "Event Speaker",
    category: "Conference",
    background: "linear-gradient(145deg, #030712 0%, #164e63 50%, #581c87 100%)",
    accent: "#2DD4BF",
    secondary: "#F5D0FE",
    logoText: "SUMMIT",
    posterText: "LIVE",
    layers: makeLayers("#2DD4BF", "#F5D0FE", "Live")
  },
  {
    id: "webinar",
    name: "Webinar Host",
    category: "Online event",
    background: "radial-gradient(circle at 30% 20%, #4f46e5 0%, #0e7490 38%, #020617 100%)",
    accent: "#818CF8",
    secondary: "#67E8F9",
    logoText: "WEBCAST",
    posterText: "HOST",
    layers: makeLayers("#818CF8", "#67E8F9", "Host")
  },
  {
    id: "creator",
    name: "Creator",
    category: "Personal brand",
    background: "linear-gradient(135deg, #18181b 0%, #86198f 42%, #fb7185 100%)",
    accent: "#FB7185",
    secondary: "#FDE68A",
    logoText: "CREATOR",
    posterText: "DROP",
    layers: makeLayers("#FB7185", "#FDE68A", "Drop")
  },
  {
    id: "gaming",
    name: "Gaming",
    category: "Esports",
    background: "radial-gradient(circle at 50% 45%, #84cc16 0%, #14532d 40%, #020617 100%)",
    accent: "#A3E635",
    secondary: "#38BDF8",
    logoText: "CLAN",
    posterText: "MVP",
    layers: makeLayers("#A3E635", "#38BDF8", "MVP")
  }
];

export function getTemplate(id?: string | null) {
  return templates.find((template) => template.id === id) ?? templates[0];
}
