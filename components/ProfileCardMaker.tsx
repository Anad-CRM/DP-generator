"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types & Constants ────────────────────────────────────────────────────────

const FORMATS = [
  { id: "profile", label: "Profile DP", sub: "1:1", w: 800, h: 800 },
  { id: "story", label: "Story", sub: "9:16", w: 450, h: 800 },
  { id: "post", label: "Post", sub: "4:5", w: 640, h: 800 },
  { id: "banner", label: "Banner", sub: "16:9", w: 800, h: 450 },
  { id: "twitter", label: "Twitter Header", sub: "3:1", w: 900, h: 300 },
  { id: "linkedin", label: "LinkedIn", sub: "4:1", w: 800, h: 200 },
];

const THEMES = [
  { id: "navy", name: "Corporate Navy", bg: ["#020617", "#0f172a", "#1e3a8a"], accent: "#60a5fa", glow: "#3b82f6" },
  { id: "executive", name: "Executive Slate", bg: ["#09090b", "#18181b", "#27272a"], accent: "#e4e4e7", glow: "#a1a1aa" },
  { id: "pristine", name: "Pristine", bg: ["#000000", "#111827", "#1f2937"], accent: "#f3f4f6", glow: "#e5e7eb" },
  { id: "royal", name: "Royal", bg: ["#0d0221", "#4a00e0", "#8e2de2"], accent: "#c084fc", glow: "#7c3aed" },
  { id: "ocean", name: "Ocean", bg: ["#020c1b", "#0a3c6e", "#1e90ff"], accent: "#60c4ff", glow: "#0ea5e9" },
  { id: "forest", name: "Forest", bg: ["#071a0e", "#14532d", "#4ade80"], accent: "#86efac", glow: "#22c55e" },
  { id: "ember", name: "Ember", bg: ["#1c0700", "#9a3412", "#f97316"], accent: "#fdba74", glow: "#f97316" },
  { id: "cosmos", name: "Cosmos", bg: ["#0a0515", "#3b0764", "#7c3aed"], accent: "#e879f9", glow: "#a855f7" },
  { id: "rose", name: "Rose", bg: ["#1a0010", "#9d174d", "#ec4899"], accent: "#f9a8d4", glow: "#ec4899" },
  { id: "teal", name: "Teal", bg: ["#001a1f", "#0e7490", "#22d3ee"], accent: "#67e8f9", glow: "#06b6d4" },
  { id: "gold", name: "Gold", bg: ["#1a1000", "#78350f", "#f59e0b"], accent: "#fde68a", glow: "#f59e0b" },
  { id: "white", name: "White", bg: ["#ffffff", "#ffffff", "#f0f0f0"], accent: "#000000", glow: "#111111" },
];

const FRAME_STYLES = [
  { id: "circle", label: "Circle" },
  { id: "rounded", label: "Rounded" },
  { id: "minimal", label: "Minimalist" },
  { id: "badge", label: "ID Badge" },
  { id: "hexagon", label: "Hexagon" },
  { id: "diamond", label: "Diamond" },
  { id: "ring", label: "Ring Glow" },
];

const BG_PATTERNS = [
  { id: "gradient", label: "Gradient" },
  { id: "clean", label: "Clean Solid" },
  { id: "grid", label: "Tech Grid" },
  { id: "dots", label: "Dot Grid" },
  { id: "waves", label: "Waves" },
  { id: "mesh", label: "Mesh" },
  { id: "bokeh", label: "Bokeh" },
  { id: "lines", label: "Lines" },
];

const BADGE_PRESETS = [
  "", "Verified ✓", "Pro Member", "Top Creator", "CEO",
  "Founder", "Director", "Developer", "Designer", "Admin",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Format = { w: number; h: number; id: string;[key: string]: any };
type Theme = { accent: string; bg: string[];[key: string]: any };
type Transform = { scale: number; x: number; y: number; rotate: number };
type SocialHandle = { icon: string; label: string; value: string };
type Stat = { label: string; value: string };

// ─── Canvas Helpers ───────────────────────────────────────────────────────────

function hexPath(cx: number, cy: number, r: number, ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function diamondPath(cx: number, cy: number, r: number, ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.8, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.8, cy);
  ctx.closePath();
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawBg(ctx: CanvasRenderingContext2D, w: number, h: number, theme: Theme, pattern: string) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, theme.bg[0]);
  g.addColorStop(0.5, theme.bg[1]);
  g.addColorStop(1, theme.bg[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.save();

  if (pattern === "clean") {
    // Just the sleek gradient
  } else if (pattern === "grid") {
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    const sp = 45;
    for (let x = 0; x < w; x += sp) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += sp) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // Add intersecting dots
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.15;
    for (let x = 0; x < w; x += sp) {
      for (let y = 0; y < h; y += sp) {
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      }
    }
  } else if (pattern === "dots") {
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#ffffff";
    const sp = 30;
    for (let x = sp / 2; x < w; x += sp)
      for (let y = sp / 2; y < h; y += sp) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
  } else if (pattern === "waves") {
    ctx.globalAlpha = 0.07;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    for (let i = -h; i < w + h; i += 40) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const y = i + x * 0.4 + Math.sin(x / 40) * 18;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (pattern === "mesh") {
    ctx.globalAlpha = 0.07;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 0.8;
    const sp = 40;
    for (let x = 0; x < w; x += sp) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += sp) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  } else if (pattern === "bokeh") {
    const blobs = [
      [0.12, 0.12, 0.35], [0.88, 0.85, 0.28], [0.5, 0.5, 0.2],
      [0.2, 0.8, 0.22], [0.8, 0.2, 0.18], [0.65, 0.4, 0.15],
    ];
    blobs.forEach(([bx, by, br]) => {
      ctx.globalAlpha = 0.14;
      const bg = ctx.createRadialGradient(w * bx, h * by, 0, w * bx, h * by, Math.min(w, h) * br);
      bg.addColorStop(0, theme.accent);
      bg.addColorStop(1, "transparent");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
    });
  } else if (pattern === "lines") {
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    for (let x = 0; x < w + h; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - h, h); ctx.stroke();
    }
  } else if (pattern === "noise") {
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < w * h * 0.04; i++) {
      const nx = Math.random() * w, ny = Math.random() * h;
      ctx.fillRect(nx, ny, 1.5, 1.5);
    }
  } else {
    ctx.globalAlpha = 0.22;
    const radg1 = ctx.createRadialGradient(w * 0.08, h * 0.08, 0, w * 0.08, h * 0.08, Math.min(w, h) * 0.45);
    radg1.addColorStop(0, theme.accent);
    radg1.addColorStop(1, "transparent");
    ctx.fillStyle = radg1;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.16;
    const radg2 = ctx.createRadialGradient(w * 0.9, h * 0.88, 0, w * 0.9, h * 0.88, Math.min(w, h) * 0.32);
    radg2.addColorStop(0, theme.bg[1]);
    radg2.addColorStop(1, "transparent");
    ctx.fillStyle = radg2;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
}

function clipShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, frame: string) {
  if (frame === "circle") {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  } else if (frame === "rounded") {
    rrect(ctx, cx - r, cy - r, r * 2, r * 2, r * 0.28);
  } else if (frame === "minimal") {
    ctx.beginPath();
    ctx.rect(cx - r, cy - r, r * 2, r * 2);
  } else if (frame === "badge") {
    rrect(ctx, cx - r, cy - r * 1.25, r * 2, r * 2.5, r * 0.12);
  } else if (frame === "hexagon") {
    hexPath(cx, cy, r, ctx);
  } else if (frame === "diamond") {
    diamondPath(cx, cy, r, ctx);
  } else if (frame === "ring") {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
}

function drawPhotoFrame(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, frame: string, theme: { accent: string }) {
  if (frame === "minimal" || frame === "badge") {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 16;
    clipShape(ctx, cx, cy, r + 4, frame);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.shadowColor = theme.accent;
  ctx.shadowBlur = frame === "ring" ? 32 : 18;
  clipShape(ctx, cx, cy, r + 4, frame);
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = frame === "ring" ? 4 : 2;
  ctx.stroke();
  ctx.restore();

  if (frame === "ring") {
    ctx.save();
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
    ctx.strokeStyle = theme.accent + "55";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

function drawPhoto(ctx: CanvasRenderingContext2D, photo: HTMLImageElement | null, cx: number, cy: number, r: number, tf: Transform, frame: string) {
  ctx.save();
  clipShape(ctx, cx, cy, r, frame);
  ctx.clip();

  if (photo) {
    const base = Math.max((r * 2) / photo.naturalWidth, (r * 2) / photo.naturalHeight);
    const s = base * tf.scale;
    ctx.translate(cx, cy);
    ctx.rotate((tf.rotate * Math.PI) / 180);
    ctx.translate(tf.x, tf.y);
    ctx.drawImage(photo, -(photo.naturalWidth * s) / 2, -(photo.naturalHeight * s) / 2, photo.naturalWidth * s, photo.naturalHeight * s);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `500 ${Math.round(r * 0.12)}px 'Inter', 'Segoe UI', system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Upload photo ↑", cx, cy);
  }
  ctx.restore();
}

function drawBadge(ctx: CanvasRenderingContext2D, cx: number, by: number, badgeText: string, accentColor: string) {
  if (!badgeText) return;
  ctx.save();
  const fs = 14;
  ctx.font = `600 ${fs}px 'Inter', 'Segoe UI', system-ui`;
  const tw = ctx.measureText(badgeText).width;
  const pw = tw + 28, ph = 26, pr = 13;
  rrect(ctx, cx - pw / 2, by, pw, ph, pr);
  ctx.fillStyle = accentColor + "44";
  ctx.fill();
  rrect(ctx, cx - pw / 2, by, pw, ph, pr);
  ctx.strokeStyle = accentColor + "aa";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = accentColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, cx, by + ph / 2);
  ctx.restore();
}

function drawSocial(ctx: CanvasRenderingContext2D, w: number, handles: SocialHandle[], accentColor: string, baseY: number) {
  if (!handles || handles.every(h => !h.value)) return;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fs = 13;
  ctx.font = `400 ${fs}px 'Inter', 'Segoe UI', system-ui`;
  const activeHandles = handles.filter(h => h.value);
  const totalW = activeHandles.reduce((sum: number, h) => sum + ctx.measureText(`${h.icon} ${h.value}`).width + 28, 0) - 28;
  let startX = w / 2 - totalW / 2;
  activeHandles.forEach(h => {
    const lbl = `${h.icon} ${h.value}`;
    const lw = ctx.measureText(lbl).width;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText(lbl, startX + lw / 2, baseY);
    startX += lw + 28;
  });
  ctx.restore();
}

function drawStats(ctx: CanvasRenderingContext2D, w: number, stats: Stat[], accentColor: string, baseY: number) {
  if (!stats || stats.every(s => !s.value)) return;
  const activeStats = stats.filter(s => s.value);
  if (!activeStats.length) return;
  ctx.save();

  const boxW = 90, boxH = 52, gap = 16;
  const total = activeStats.length * boxW + (activeStats.length - 1) * gap;
  let sx = w / 2 - total / 2;

  activeStats.forEach(s => {
    rrect(ctx, sx, baseY, boxW, boxH, 10);
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fill();
    rrect(ctx, sx, baseY, boxW, boxH, 10);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.font = `700 17px 'Inter', 'Segoe UI', system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.value, sx + boxW / 2, baseY + 18);

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = `400 11px 'Inter', 'Segoe UI', system-ui`;
    ctx.fillText(s.label, sx + boxW / 2, baseY + 38);

    sx += boxW + gap;
  });
  ctx.restore();
}

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, show: boolean) {
  if (!show) return;
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#ffffff";
  ctx.font = `500 11px 'Inter', 'Segoe UI', system-ui`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("made with Profile Card Maker", w - 14, h - 10);
  ctx.restore();
}

function renderCanvas(
  canvas: HTMLCanvasElement,
  fmt: Format,
  theme: Theme,
  photo: HTMLImageElement | null,
  logoImg: HTMLImageElement | null,
  name: string,
  role: string,
  textColor: string,
  tf: Transform,
  frame: string,
  bgPattern: string,
  badge: string,
  socialHandles: SocialHandle[],
  stats: Stat[],
  showWatermark: boolean,
  tagline: string
) {
  canvas.width = fmt.w;
  canvas.height = fmt.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { w, h } = fmt;

  drawBg(ctx, w, h, theme, bgPattern);

  const isHoriz = fmt.id === "banner" || fmt.id === "twitter" || fmt.id === "linkedin";

  if (isHoriz) {
    const r = Math.round(h * (fmt.id === "linkedin" ? 0.32 : 0.33));
    const cx = Math.round(h * 0.54);
    const cy = Math.round(h / 2);
    drawPhotoFrame(ctx, cx, cy, r, frame, theme);
    drawPhoto(ctx, photo, cx, cy, r, tf, frame);

    const tx = cx + r + 44;
    const nameFontSize = Math.round(h * (fmt.id === "linkedin" ? 0.22 : 0.14));

    if (logoImg) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      const logoW = Math.round(r * 0.8);
      const logoH = logoImg.naturalHeight * (logoW / logoImg.naturalWidth);
      ctx.drawImage(logoImg, cx - logoW / 2, cy - r - logoH - 32, logoW, logoH);
      ctx.restore();
    }

    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = `700 ${nameFontSize}px 'Inter', 'Segoe UI', system-ui`;
    ctx.fillStyle = textColor;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 16;
    ctx.fillText(name || " ", tx, cy - 4);
    ctx.shadowBlur = 0;

    const roleFontSize = Math.round(nameFontSize * 0.44);
    ctx.font = `500 ${roleFontSize}px 'Inter', 'Segoe UI', system-ui`;
    const pillH = roleFontSize * 2.2;
    const pillW = Math.min(ctx.measureText(role).width + 36, w - tx - 30);
    const pillY = cy + 12;
    rrect(ctx, tx, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = "rgba(255,255,255,0.11)";
    ctx.fill();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = textColor;
    ctx.fillText(role || " ", tx + 18, pillY + pillH * 0.68);
    ctx.restore();

    if (badge) drawBadge(ctx, tx + 80, cy + 12 + Math.round(nameFontSize * 0.44) * 2.2 + 12, badge, theme.accent);
  } else {
    const isStory = fmt.id === "story";
    const r = Math.round(Math.min(w, h) * (isStory ? 0.23 : 0.22));
    const cx = Math.round(w / 2);

    // Calculate total layout height to center it vertically
    const nameFontSize = Math.round(w * (isStory ? 0.072 : 0.062));
    const roleFontSize = Math.round(nameFontSize * 0.4);
    const pillH = Math.round(roleFontSize * 2.2);

    let deltaY = r + 30 + nameFontSize + 10 + 14 + pillH + 16;
    if (badge) deltaY += 38;
    if (tagline) deltaY += 34;
    const hasSocial = socialHandles && socialHandles.some(s => s.value);
    if (hasSocial) deltaY += 40;
    const hasStats = stats && stats.some(s => s.value);
    if (hasStats) deltaY += 66;

    let logoW = 0, logoH = 0, logoSpacing = 60;
    if (logoImg) {
      logoW = Math.round(r * 1.0);
      logoH = logoImg.naturalHeight * (logoW / logoImg.naturalWidth);
    }

    // Include logo height in vertical centering
    const totalHeight = deltaY + r + (logoImg ? logoH + logoSpacing : 0);
    const topMargin = (h - totalHeight) / 2;
    const cy = Math.round(topMargin + (logoImg ? logoH + logoSpacing : 0) + r);

        if (logoImg) {
      ctx.save();
      // Apply black color for white theme
      const prevFilter = ctx.filter;
      if (theme.id === "white") {
        ctx.filter = "brightness(0)";
      }
      // Enable high‑quality image smoothing for better logo appearance
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(logoImg, cx - logoW / 2, cy - r - logoH - logoSpacing, logoW, logoH);
      // Restore filter (save/restore also restores smoothing settings)
      ctx.filter = prevFilter;
      ctx.restore();
    }

    drawPhotoFrame(ctx, cx, cy, r, frame, theme);
    drawPhoto(ctx, photo, cx, cy, r, tf, frame);

    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 0.7;
    const divY = cy + r + 30;
    ctx.beginPath();
    ctx.moveTo(cx - 70, divY);
    ctx.lineTo(cx + 70, divY);
    ctx.stroke();
    ctx.restore();

    const nameY = divY + nameFontSize + 10;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `700 ${nameFontSize}px 'Inter', 'Segoe UI', system-ui`;
    ctx.fillStyle = textColor;
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 20;
    ctx.fillText(name || " ", w / 2, nameY);
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `500 ${roleFontSize}px 'Inter', 'Segoe UI', system-ui`;
    const pillW = Math.min(ctx.measureText(role).width + 44, w * 0.74);
    const pillY = nameY + 24;
    rrect(ctx, w / 2 - pillW / 2, pillY, pillW, pillH, pillH / 2);
    ctx.fillStyle = "rgba(255,255,255,0.11)";
    ctx.fill();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = textColor;
    ctx.textBaseline = "middle";
    ctx.fillText(role || " ", w / 2, pillY + pillH / 2);
    ctx.restore();

    let nextY = pillY + pillH + 16;

    if (badge) {
      drawBadge(ctx, w / 2, nextY, badge, theme.accent);
      nextY += 38;
    }

    if (tagline) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `400 italic ${Math.round(nameFontSize * 0.32)}px Georgia, serif`;
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillText(tagline, w / 2, nextY + 12);
      ctx.restore();
      nextY += 34;
    }

    drawSocial(ctx, w, socialHandles, theme.accent, nextY + 10);
    if (socialHandles && socialHandles.some(s => s.value)) nextY += 30;

    drawStats(ctx, w, stats, theme.accent, nextY + 14);
  }

  drawWatermark(ctx, w, h, showWatermark);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Sec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 10, letterSpacing: "0.18em", fontWeight: 600, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 10 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

function Sep() { return <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />; }

function Fl({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>{label}</p>
      {children}
    </div>
  );
}

function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      style={{
        width: "100%", boxSizing: "border-box",
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 10, padding: "8px 11px", color: "#fff", fontSize: 13,
        outline: "none", fontFamily: "inherit",
      }}
      {...props}
    />
  );
}

function SliderRow({ label, min, max, step, value, onChange }: {
  label: string; min: number; max: number; step: number; value: number; onChange: (val: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 48, fontSize: 11, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: "#fff", height: 3, cursor: "pointer" } as React.CSSProperties}
      />
      <span style={{ width: 34, textAlign: "right", fontSize: 11, color: "rgba(255,255,255,0.28)", flexShrink: 0 }}>
        {step < 1 ? value.toFixed(2) : Math.round(value)}
      </span>
    </div>
  );
}

function TabBtn({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
      background: active ? "#fff" : "rgba(255,255,255,0.05)",
      color: active ? "#000" : "rgba(255,255,255,0.45)",
      border: "1px solid " + (active ? "#fff" : "rgba(255,255,255,0.08)"),
      transition: "all .15s",
    }}>
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfileCardMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);

  const [fmt, setFmt] = useState(FORMATS[0]);

  // Update scale based on container width
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const baseWidth = fmt.w;
        const newScale = Math.min(containerWidth / baseWidth, 1);
        setScale(newScale);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [fmt]);

  useEffect(() => {
    const img = new Image();
    img.src = "/aibi_logo.png";
    img.onload = () => setLogoImg(img);
  }, []);


  const [theme, setTheme] = useState(THEMES[0]);
  const [name, setName] = useState("Your Name");
  const [role, setRole] = useState("Community Member");
  const [tagline, setTagline] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [tf, setTf] = useState<Transform>({ scale: 1, x: 0, y: 0, rotate: 0 });
  const [frame, setFrame] = useState("circle");
  const [bgPattern, setBgPattern] = useState("gradient");
  const [badge, setBadge] = useState("");
  const [showWatermark, setShowWatermark] = useState(false);
  const [activeTab, setActiveTab] = useState("design");
  const [socialHandles, setSocialHandles] = useState<SocialHandle[]>([
    { icon: "𝕏", label: "Twitter", value: "" },
    { icon: "in", label: "LinkedIn", value: "" },
    { icon: "@", label: "Instagram", value: "" },
  ]);
  const [stats, setStats] = useState<Stat[]>([
    { label: "Posts", value: "" },
    { label: "Followers", value: "" },
    { label: "Following", value: "" },
  ]);

  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    // Scale format dimensions for high‑DPI rendering
    const scaledFmt = {
      ...fmt,
      w: Math.round(fmt.w * scale),
      h: Math.round(fmt.h * scale),
    };
    renderCanvas(canvasRef.current, scaledFmt, theme, photoRef.current, logoImg, name, role, textColor, tf, frame, bgPattern, badge, socialHandles, stats, showWatermark, tagline);
  }, [fmt, theme, name, role, textColor, tf, frame, bgPattern, badge, socialHandles, stats, showWatermark, tagline, logoImg, scale]);

  useEffect(() => { draw(); }, [draw]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      photoRef.current = img;
      setTf({ scale: 1, x: 0, y: 0, rotate: 0 });
      setHasPhoto(true);
    };
    img.src = URL.createObjectURL(file);
  }

  function download(dlFmt: Format) {
    const tmp = document.createElement("canvas");
    renderCanvas(tmp, dlFmt, theme, photoRef.current, logoImg, name, role, textColor, tf, frame, bgPattern, badge, socialHandles, stats, showWatermark, tagline);
    const a = document.createElement("a");
    a.download = `${(name || "profile").replace(/\s+/g, "-").toLowerCase()}-${dlFmt.id}.png`;
    a.href = tmp.toDataURL("image/png");
    a.click();
  }

  function updateSocial(i: number, val: string) {
    setSocialHandles(prev => prev.map((h, idx) => idx === i ? { ...h, value: val } : h));
  }

  function updateStat(i: number, key: keyof Stat, val: string) {
    setStats(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s));
  }

  const cardStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.02)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
    borderRadius: 20,
    padding: 24,
  };

  return (
    <div ref={containerRef} style={{ background: "radial-gradient(circle at 50% 0%, #151522 0%, #040406 100%)", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', 'Outfit', 'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; cursor: pointer; box-shadow: 0 0 8px rgba(255,255,255,0.4); transition: transform 0.1s; }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
        input[type=range]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #fff; border: none; cursor: pointer; }
        input[type=color] { -webkit-appearance: none; cursor: pointer; border: none; background: none; }
        .pill-btn { cursor: pointer; border-radius: 10px; font-size: 13px; font-weight: 500; padding: 6px 14px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.6); transition: all .2s cubic-bezier(0.4, 0, 0.2, 1); }
        .pill-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); transform: translateY(-1px); }
        .pill-btn.active { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.4); color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .dl-btn { cursor: pointer; border-radius: 14px; padding: 12px 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.85); font-size: 14px; font-weight: 600; transition: all .2s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; align-items: center; gap: 4px; backdrop-filter: blur(10px); }
        .dl-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
        .toggle-sw { position: relative; display: inline-block; width: 40px; height: 22px; }
        .toggle-sw input { opacity: 0; width: 0; height: 0; }
        .toggle-knob { position: absolute; cursor: pointer; inset: 0; border-radius: 12px; background: rgba(255,255,255,0.15); transition: .3s cubic-bezier(0.4, 0, 0.2, 1); }
        .toggle-knob:before { content: ''; position: absolute; width: 16px; height: 16px; left: 3px; bottom: 3px; border-radius: 50%; background: #fff; transition: .3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        input:checked + .toggle-knob { background: rgba(255,255,255,0.45); }
        input:checked + .toggle-knob:before { transform: translateX(18px); }
      `}</style>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "32px 20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", margin: 0, background: "linear-gradient(to right, #fff, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Profile Card Maker</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Design · Customize · Export in any format</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>

          {/* ── Sidebar ───────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, ...cardStyle, padding: "8px", flexWrap: "wrap" }}>
              {(["design", "text", "photo", "extras"] as const).map(t => (
                <TabBtn key={t} active={activeTab === t} onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </TabBtn>
              ))}
            </div>

            <div style={{ ...cardStyle, marginTop: 4 }}>
              {/* DESIGN TAB */}
              {activeTab === "design" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Sec label="Theme">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 }}>
                      {THEMES.map((t, i) => (
                        <button key={i} title={t.name} onClick={() => setTheme(t)}
                          style={{
                            aspectRatio: "1", borderRadius: 10, cursor: "pointer",
                            background: `linear-gradient(135deg,${t.bg[0]},${t.bg[1]},${t.bg[2]})`,
                            border: theme === t ? "2.5px solid rgba(255,255,255,0.9)" : "2px solid rgba(255,255,255,0.06)",
                            boxShadow: theme === t ? `0 0 14px ${t.accent}66` : "none",
                            transition: "all .15s", transform: theme === t ? "scale(1.06)" : "scale(1)",
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Active: {theme.name}</p>
                  </Sec>

                  <Sep />

                  <Sec label="Background Pattern">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {BG_PATTERNS.map(p => (
                        <button key={p.id} className={`pill-btn ${bgPattern === p.id ? "active" : ""}`}
                          onClick={() => setBgPattern(p.id)}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </Sec>

                  <Sep />

                  <Sec label="Photo Frame">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {FRAME_STYLES.map(f => (
                        <button key={f.id} className={`pill-btn ${frame === f.id ? "active" : ""}`}
                          onClick={() => setFrame(f.id)}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </Sec>
                </div>
              )}

              {/* TEXT TAB */}
              {activeTab === "text" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Sec label="Identity">
                    <Fl label="Full Name">
                      <Inp value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" />
                    </Fl>
                    <Fl label="Role / Title">
                      <Inp value={role} onChange={e => setRole(e.target.value)} placeholder="Community Member" />
                    </Fl>
                    <Fl label="Tagline (italic)">
                      <Inp value={tagline} onChange={e => setTagline(e.target.value)} placeholder='"Building the future..."' />
                    </Fl>
                    <Fl label="Text Color">
                      <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                        style={{ width: "100%", height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", padding: 3 }} />
                    </Fl>
                  </Sec>

                  <Sep />

                  <Sec label="Badge / Status">
                    <Fl label="Badge Text">
                      <Inp value={badge} onChange={e => setBadge(e.target.value)} placeholder="Verified ✓" />
                    </Fl>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
                      {BADGE_PRESETS.slice(1).map(b => (
                        <button key={b} className={`pill-btn ${badge === b ? "active" : ""}`}
                          onClick={() => setBadge(badge === b ? "" : b)} style={{ fontSize: 11 }}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </Sec>

                  <Sep />

                  <Sec label="Social Handles">
                    {socialHandles.map((h, i) => (
                      <Fl key={i} label={`${h.icon} ${h.label}`}>
                        <Inp value={h.value} onChange={e => updateSocial(i, e.target.value)} placeholder="@handle" />
                      </Fl>
                    ))}
                  </Sec>
                </div>
              )}

              {/* PHOTO TAB */}
              {activeTab === "photo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Sec label="Upload">
                    <label style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      borderRadius: 12, padding: "14px 0", cursor: "pointer",
                      border: "1.5px dashed rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.03)",
                      color: "rgba(255,255,255,0.5)", fontSize: 13,
                    }}>
                      <span style={{ fontSize: 18 }}>↑</span>
                      <span>{hasPhoto ? "Replace photo" : "Upload photo"}</span>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
                    </label>
                  </Sec>

                  {hasPhoto && (
                    <>
                      <Sep />
                      <Sec label="Adjust Image">
                        <SliderRow label="Zoom" min={0.8} max={3} step={0.01} value={tf.scale} onChange={v => setTf(p => ({ ...p, scale: v }))} />
                        <SliderRow label="Pan X" min={-220} max={220} step={1} value={tf.x} onChange={v => setTf(p => ({ ...p, x: v }))} />
                        <SliderRow label="Pan Y" min={-220} max={220} step={1} value={tf.y} onChange={v => setTf(p => ({ ...p, y: v }))} />
                        <SliderRow label="Rotate" min={-180} max={180} step={1} value={tf.rotate} onChange={v => setTf(p => ({ ...p, rotate: v }))} />
                        <button onClick={() => setTf({ scale: 1, x: 0, y: 0, rotate: 0 })}
                          style={{ color: "rgba(255,255,255,0.28)", background: "none", border: "none", cursor: "pointer", fontSize: 11, textAlign: "left", padding: 0, marginTop: 2 }}>
                          ↺ Reset adjustments
                        </button>
                      </Sec>
                    </>
                  )}
                </div>
              )}

              {/* EXTRAS TAB */}
              {activeTab === "extras" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Sec label="Stats / Counters">
                    {stats.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 6 }}>
                        <div style={{ flex: 1 }}>
                          <Fl label="Value">
                            <Inp value={s.value} onChange={e => updateStat(i, "value", e.target.value)} placeholder="10K" />
                          </Fl>
                        </div>
                        <div style={{ flex: 1 }}>
                          <Fl label="Label">
                            <Inp value={s.label} onChange={e => updateStat(i, "label", e.target.value)} placeholder="Followers" />
                          </Fl>
                        </div>
                      </div>
                    ))}
                  </Sec>

                  <Sep />

                  <Sec label="Extras">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Show watermark</span>
                      <label className="toggle-sw">
                        <input type="checkbox" checked={showWatermark} onChange={e => setShowWatermark(e.target.checked)} />
                        <span className="toggle-knob"></span>
                      </label>
                    </div>
                  </Sec>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Canvas + Controls ─────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Format tabs */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => setFmt(f)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    background: fmt.id === f.id ? "#fff" : "rgba(255,255,255,0.04)",
                    color: fmt.id === f.id ? "#000" : "rgba(255,255,255,0.45)",
                    border: "1px solid " + (fmt.id === f.id ? "#fff" : "rgba(255,255,255,0.08)"),
                    transition: "all .15s",
                  }}>
                  {f.label}
                  <span style={{ fontWeight: 400, fontSize: 10, opacity: 0.5 }}>{f.sub}</span>
                </button>
              ))}
            </div>

            {/* Canvas preview */}
            <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 380 }}>
              <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 24px 72px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)" }}>
                <canvas ref={canvasRef} style={{ display: "block", maxHeight: 520, maxWidth: "100%", width: "auto", height: "auto" }} />
              </div>
            </div>

            {/* Download */}
            <div style={cardStyle}>
              <p style={{ fontSize: 10, letterSpacing: "0.16em", fontWeight: 600, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 10 }}>
                Download as
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {FORMATS.map(f => (
                  <button key={f.id} className="dl-btn" onClick={() => download(f)}>
                    <span>↓ {f.label}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>{f.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick preview chips */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Quick theme:</span>
              {THEMES.slice(0, 6).map((t, i) => (
                <button key={i} onClick={() => setTheme(t)} title={t.name}
                  style={{
                    width: 20, height: 20, borderRadius: "50%", cursor: "pointer",
                    background: `linear-gradient(135deg,${t.bg[1]},${t.bg[2]})`,
                    border: theme === t ? "2px solid #fff" : "2px solid transparent",
                    transition: "all .15s", flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
