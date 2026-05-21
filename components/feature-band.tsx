import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
};

export function FeatureBand({ eyebrow, title, features }: { eyebrow: string; title: string; features: Feature[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[.18em] text-fuchsiaGlow">{eyebrow}</p>
      <h2 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-white">{title}</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <article key={feature.title} className="glass rounded-2xl p-5">
            <feature.icon className="text-cyanGlow" size={24} />
            <h3 className="mt-5 text-lg font-bold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/62">{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
