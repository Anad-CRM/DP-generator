export function HeroPreview() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[620px]">
      <div className="absolute -inset-6 rounded-[40px] bg-fuchsiaGlow/10 blur-3xl" />
      <div className="glass relative h-full overflow-hidden rounded-[32px] p-5">
        <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_50%_35%,#7c3aed_0%,#1e0b3b_46%,#05030c_100%)]">
          <div className="absolute left-1/2 top-8 -translate-x-1/2 rounded-2xl border border-white/16 bg-white/10 px-5 py-2 text-lg font-extrabold text-white">NEURAL LABS</div>
          <div className="absolute inset-x-10 top-[34%] text-center text-[112px] font-extrabold leading-none text-white/15 md:text-[148px]">AI</div>
          <div className="absolute left-1/2 top-[18%] h-[68%] w-[68%] -translate-x-1/2 rounded-full border-[26px] border-violetGlow shadow-[0_0_70px_rgba(168,85,247,.72)]" />
          <div className="absolute left-1/2 top-[28%] h-[46%] w-[46%] -translate-x-1/2 rounded-full border-[10px] border-cyanGlow shadow-[0_0_40px_rgba(34,211,238,.75)]" />
          <div className="absolute left-1/2 top-[22%] h-[58%] w-[38%] -translate-x-1/2 rounded-full bg-[linear-gradient(160deg,#f7d4ff,#6332ff_52%,#111827)] shadow-2xl" />
          <div className="absolute right-[14%] top-[20%] h-3 w-28 rotate-[-18deg] rounded-full bg-cyanGlow shadow-[0_0_24px_rgba(34,211,238,.9)] after:absolute after:right-[-4px] after:top-[-8px] after:h-6 after:w-6 after:rotate-45 after:border-r-4 after:border-t-4 after:border-cyanGlow" />
          <div className="absolute bottom-16 left-8 right-8 text-center">
            <div className="text-5xl font-extrabold text-white">ALEX MORGAN</div>
            <div className="mt-2 text-xl font-bold text-cyanGlow">AI COMMUNITY LEAD</div>
          </div>
        </div>
      </div>
    </div>
  );
}
