import { Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const plans = [
  { name: "Starter", price: "$0", body: "For creators testing campaign visuals.", perks: ["3 active projects", "PNG export", "Community templates"] },
  { name: "Studio", price: "$19", body: "For startups and campus teams.", perks: ["Unlimited projects", "HD PNG/JPG export", "Brand kits", "Shared templates"], featured: true },
  { name: "Business", price: "$79", body: "For communities and launch teams.", perks: ["Team roles", "Cloud uploads", "Template management", "Priority AI credits"] }
];

export default function PricingPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-cyanGlow">Pricing</p>
        <h1 className="mt-3 text-4xl font-extrabold text-white">Scale from one DP to a full brand campaign.</h1>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className={`rounded-2xl p-6 ${plan.featured ? "bg-white text-ink shadow-neon" : "glass text-white"}`}>
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <div className="mt-5 text-4xl font-extrabold">{plan.price}<span className="text-base font-semibold opacity-60">/mo</span></div>
              <p className="mt-4 min-h-14 opacity-70">{plan.body}</p>
              <ul className="mt-6 space-y-3">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-3 text-sm">
                    <Check size={18} />
                    {perk}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
