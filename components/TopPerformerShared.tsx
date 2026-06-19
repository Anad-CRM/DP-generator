import React from "react";
export type Transform = { scale: number; x: number; y: number; rotate: number };

export interface RenderOpts {
  photo: HTMLImageElement | null;
  logoImg: HTMLImageElement | null;
  tf: Transform;
  name: string;
  role: string;
  awardType: string;
  periodLabel: string;
  tagline: string;
  orgName: string;
  primary: string;
  secondary: string;
  bg: string;
  txt: string;
}

export const AWARD_TYPES = [
  "Top Performer",
  "Employee of the Month",
  "Employee of the Week",
  "Employee of the Year",
  "Star Performer",
  "Best in Team",
  "Outstanding Achievement",
  "Most Valuable Player",
];

export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export const WEEKS = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);

export const COLOR_PRESETS = [
  { name: "AIBI Blue",    primary: "#3B4FE8", secondary: "#8B5CF6", bg: "#f4f6ff", txt: "#111827" },
  { name: "Bold Red",     primary: "#DC2626", secondary: "#F97316", bg: "#160000", txt: "#ffffff" },
  { name: "Deep Ocean",   primary: "#0284C7", secondary: "#38BDF8", bg: "#061422", txt: "#ffffff" },
  { name: "Sunset Gold",  primary: "#D97706", secondary: "#FCD34D", bg: "#130f00", txt: "#ffffff" },
  { name: "Forest",       primary: "#15803D", secondary: "#4ADE80", bg: "#051108", txt: "#ffffff" },
  { name: "Cosmos",       primary: "#9333EA", secondary: "#EC4899", bg: "#0c0120", txt: "#ffffff" },
  { name: "Charcoal",     primary: "#6B7280", secondary: "#D1D5DB", bg: "#09090b", txt: "#ffffff" },
  { name: "Rose",         primary: "#E11D48", secondary: "#FB7185", bg: "#160010", txt: "#ffffff" },
];

export function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function drawPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | null,
  cx: number, cy: number,
  rw: number, rh: number,
  tf: Transform,
  shape: "circle" | "rrect"
) {
  ctx.save();
  if (shape === "circle") {
    ctx.beginPath(); ctx.arc(cx, cy, rw, 0, Math.PI * 2); ctx.clip();
  } else {
    rrect(ctx, cx - rw, cy - rh, rw * 2, rh * 2, rw * 0.14); ctx.clip();
  }
  if (photo) {
    const base = Math.max((rw * 2) / photo.naturalWidth, (rh * 2) / photo.naturalHeight);
    const s = base * tf.scale;
    ctx.translate(cx, cy);
    ctx.rotate((tf.rotate * Math.PI) / 180);
    ctx.translate(tf.x, tf.y);
    ctx.drawImage(photo, -(photo.naturalWidth * s) / 2, -(photo.naturalHeight * s) / 2, photo.naturalWidth * s, photo.naturalHeight * s);
  } else {
    ctx.fillStyle = "rgba(100,100,130,0.18)";
    ctx.fillRect(cx - rw, cy - rh, rw * 2, rh * 2);
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.font = `500 ${Math.round(rw * 0.15)}px Inter,system-ui`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Upload photo", cx, cy);
  }
  ctx.restore();
}

export function autoFit(ctx: CanvasRenderingContext2D, text: string, maxW: number, baseSz: number, minSz = 14): number {
  let sz = baseSz;
  ctx.font = `900 ${sz}px Inter,system-ui`;
  while (ctx.measureText(text).width > maxW && sz > minSz) {
    sz -= 1;
    ctx.font = `900 ${sz}px Inter,system-ui`;
  }
  return sz;
}

export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 0xff) + amt);
  const b = clamp((n & 0xff) + amt);
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

export function wrapAwardText(ctx: CanvasRenderingContext2D, text: string, maxW: number, baseSz: number): { lines: string[]; sz: number } {
  const words = text.split(" ");
  let sz = baseSz;
  ctx.font = `900 ${sz}px Inter,system-ui`;
  if (ctx.measureText(text).width <= maxW) return { lines: [text], sz };
  const mid = Math.ceil(words.length / 2);
  const l1 = words.slice(0, mid).join(" ");
  const l2 = words.slice(mid).join(" ");
  const longer = l1.length >= l2.length ? l1 : l2;
  sz = autoFit(ctx, longer, maxW, baseSz);
  return { lines: [l1, l2], sz };
}

export function renderProfilePic(canvas: HTMLCanvasElement, opts: RenderOpts) {
  canvas.width = 800; canvas.height = 800;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  (ctx as any).imageSmoothingQuality = "high";

  const { photo, logoImg, tf, primary, secondary, bg } = opts;
  const W = 800;
  const H = 800;

  // Fill background with theme bg
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Gradient ambient ring in background
  const grad = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 400);
  grad.addColorStop(0, primary + "1a");
  grad.addColorStop(1, (secondary || primary) + "33");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Styled main photo circle (large)
  const pCx = W / 2;
  const pCy = H / 2;
  const pR = 270;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 16;
  ctx.beginPath(); ctx.arc(pCx, pCy, pR + 12, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.restore();

  drawPhoto(ctx, photo, pCx, pCy, pR, pR, tf, "circle");

  // Draw main border ring
  ctx.save();
  ctx.strokeStyle = primary;
  ctx.lineWidth = 14;
  ctx.beginPath(); ctx.arc(pCx, pCy, pR + 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Draw an overlapping mini logo badge at bottom right
  const bCx = 620;
  const bCy = 620;
  const bR = 64;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.beginPath(); ctx.arc(bCx, bCy, bR, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.restore();

  // Badge border
  ctx.save();
  ctx.strokeStyle = secondary || primary;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(bCx, bCy, bR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Badge Logo content
  if (logoImg) {
    ctx.save();
    const lw = bR * 1.2;
    const lh = logoImg.naturalHeight * (lw / logoImg.naturalWidth);
    ctx.translate(bCx, bCy);
    ctx.drawImage(logoImg, -lw / 2, -lh / 2, lw, lh);
    ctx.restore();
  } else {
    // Draw star badge
    ctx.save();
    ctx.fillStyle = primary;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 28px Inter,system-ui";
    ctx.fillText("★", bCx, bCy);
    ctx.restore();
  }
}

export function renderLandscapeCard(canvas: HTMLCanvasElement, opts: RenderOpts) {
  canvas.width = 1200; canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  (ctx as any).imageSmoothingQuality = "high";

  const { photo, logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt } = opts;
  const W = 1200;
  const H = 630;
  const light = txt !== "#ffffff";

  // Fill background
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Subtle dot grid
  ctx.save(); ctx.fillStyle = primary + "1a";
  for (let x = 30; x < W; x += 30) for (let y = 30; y < H; y += 30) {
    ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Draw a split layout
  // Left half: Profile photo centered in a beautiful framed circle
  const pCx = W * 0.28;
  const pCy = H / 2;
  const pR = 150;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  ctx.beginPath(); ctx.arc(pCx, pCy, pR + 8, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.restore();

  drawPhoto(ctx, photo, pCx, pCy, pR, pR, tf, "circle");

  // Draw decorative ring
  ctx.save();
  ctx.strokeStyle = primary;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(pCx, pCy, pR + 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Right half: Content
  const contentX = W * 0.54;
  
  // Draw Logo or Org Name
  if (logoImg) {
    ctx.save();
    const lw = 140, lh = logoImg.naturalHeight * (lw / logoImg.naturalWidth);
    ctx.drawImage(logoImg, contentX, 60, lw, lh);
    ctx.restore();
  } else if (orgName) {
    ctx.save();
    ctx.font = `800 24px Inter,system-ui`;
    ctx.fillStyle = light ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";
    ctx.fillText(orgName.toUpperCase(), contentX, 80);
    ctx.restore();
  }

  // Award Label (large pill or text)
  ctx.save();
  ctx.font = `900 48px Inter,system-ui`;
  ctx.fillStyle = primary;
  ctx.fillText(awardType.toUpperCase(), contentX, 190);
  ctx.restore();

  // Name
  ctx.save();
  ctx.font = `800 40px Inter,system-ui`;
  ctx.fillStyle = light ? "#111827" : "#ffffff";
  ctx.fillText(name || "Your Name", contentX, 290);
  ctx.restore();

  // Role
  ctx.save();
  ctx.font = `500 22px Inter,system-ui`;
  ctx.fillStyle = light ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  ctx.fillText(role || "Department · Role", contentX, 335);
  ctx.restore();

  // Period Label
  if (periodLabel) {
    ctx.save();
    ctx.font = `600 italic 22px Georgia,serif`;
    ctx.fillStyle = secondary || primary;
    ctx.fillText(periodLabel, contentX, 395);
    ctx.restore();
  }

  // Tagline
  if (tagline) {
    ctx.save();
    ctx.font = `400 18px Inter,system-ui`;
    ctx.fillStyle = light ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
    ctx.fillText(tagline, contentX, 470);
    ctx.restore();
  }
}

// ─── UI Sub-components ───────────────────────────────────────────────────────

export function Sec({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div>
      <p style={{ fontSize: 10, letterSpacing: "0.18em", fontWeight: 600, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 10 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

export function Sep(): React.JSX.Element { return <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />; }

export function Inp(props: React.InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  return (
    <input style={{
      width: "100%", boxSizing: "border-box",
      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 10, padding: "8px 11px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit",
    }} {...props} />
  );
}

export function Lbl({ text, children }: { text: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{text}</label>
      {children}
    </div>
  );
}

export function SlRow({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }): React.JSX.Element {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 48, fontSize: 11, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: "#fff", height: 3, cursor: "pointer" } as React.CSSProperties} />
      <span style={{ width: 34, textAlign: "right", fontSize: 11, color: "rgba(255,255,255,0.28)", flexShrink: 0 }}>
        {step < 1 ? value.toFixed(2) : Math.round(value)}
      </span>
    </div>
  );
}
