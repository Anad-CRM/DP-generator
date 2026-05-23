import Link from "next/link";

export function HeroPreview() {
  return (
    <div className="relative mx-auto flex w-full max-w-lg items-center justify-center py-8">
      {/* Ambient glow layers */}
      <div className="pointer-events-none absolute -inset-10 rounded-full bg-violet-600/20 blur-[80px]" />
      <div className="pointer-events-none absolute -inset-6 rounded-full bg-cyan-500/10 blur-[60px]" />

      {/* Card */}
      <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] shadow-[0_32px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/5">

        {/* Top shimmer bar */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />

        {/* Background decoration orbs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-32 w-32 rounded-full bg-pink-500/15 blur-2xl" />

        {/* Inner content */}
        <div className="relative z-10 flex flex-col items-center px-8 py-10 text-center">

          {/* Floating org badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_#a78bfa]" />
            AIBI Campus
          </div>

          {/* Avatar ring */}
          <div className="relative mb-5">
            {/* Outer ring */}
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 p-[3px] shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              {/* Avatar placeholder */}
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#1a1040] to-[#0d0826] text-4xl font-black text-white/80">
                AV
              </div>
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#1a1040] bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>

          {/* Divider */}
          <div className="mb-5 h-px w-24 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Social tags */}
          <div className="mb-7 flex flex-wrap justify-center gap-2">
            {["Machine Learning", "Design Systems", "Open Source"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/editor"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-2.5 text-sm font-bold text-white shadow-[0_4px_24px_rgba(139,92,246,0.5)] transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_6px_32px_rgba(139,92,246,0.7)]"
          >
            <span className="relative z-10">Create Your DP</span>
            <svg
              className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {/* Shine sweep */}
            <span className="absolute inset-0 -skew-x-12 translate-x-[-200%] bg-white/20 transition-transform duration-700 group-hover:translate-x-[200%]" />
          </Link>
        </div>

        {/* Bottom shimmer bar */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      </div>

      {/* Floating corner decorations */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-2xl border border-violet-500/20 bg-violet-500/5 backdrop-blur-sm rotate-12" />
      <div className="pointer-events-none absolute -bottom-4 -left-4 h-16 w-16 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 backdrop-blur-sm -rotate-12" />
    </div>
  );
}