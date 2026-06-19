import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export const metadata = {
  title: "Top Performer Card Maker — TemplateStudio",
  description: "Create stunning award cards to celebrate your top performers. Choose from 4 beautiful templates.",
};

const TEMPLATES = [
  { id: "modern-stack", name: "Modern Stack", desc: "Clean stacked card layout with bold footer" },
  { id: "minimal-split", name: "Minimal Split", desc: "Stylish split layout with dark left band" },
  { id: "glow-frame", name: "Glow Frame", desc: "Tech portrait with glowing border frame" },
  { id: "elegant-classic", name: "Elegant Classic", desc: "Classic asymmetrical layout with clean lines" },
];

export default function TopPerformerPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Choose a Template
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            Select one of our professionally designed templates to get started.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {TEMPLATES.map((template) => (
            <Link
              key={template.id}
              href={`/top-performer/${template.id}`}
              className="flex flex-col gap-y-4 rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 transition hover:bg-white/10"
            >
              <h3 className="text-xl font-semibold leading-7 text-white">
                {template.name}
              </h3>
              <p className="text-base leading-7 text-gray-300">
                {template.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
