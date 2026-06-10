"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Transform = { scale: number; x: number; y: number; rotate: number };

interface RenderOpts {
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

// ─── Constants ───────────────────────────────────────────────────────────────

const AWARD_TYPES = [
  "Top Performer",
  "Employee of the Month",
  "Employee of the Week",
  "Employee of the Year",
  "Star Performer",
  "Best in Team",
  "Outstanding Achievement",
  "Most Valuable Player",
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const WEEKS = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);

const COLOR_PRESETS = [
  { name: "AIBI Blue",    primary: "#3B4FE8", secondary: "#8B5CF6", bg: "#f4f6ff", txt: "#111827" },
  { name: "Bold Red",     primary: "#DC2626", secondary: "#F97316", bg: "#160000", txt: "#ffffff" },
  { name: "Deep Ocean",   primary: "#0284C7", secondary: "#38BDF8", bg: "#061422", txt: "#ffffff" },
  { name: "Sunset Gold",  primary: "#D97706", secondary: "#FCD34D", bg: "#130f00", txt: "#ffffff" },
  { name: "Forest",       primary: "#15803D", secondary: "#4ADE80", bg: "#051108", txt: "#ffffff" },
  { name: "Cosmos",       primary: "#9333EA", secondary: "#EC4899", bg: "#0c0120", txt: "#ffffff" },
  { name: "Charcoal",     primary: "#6B7280", secondary: "#D1D5DB", bg: "#09090b", txt: "#ffffff" },
  { name: "Rose",         primary: "#E11D48", secondary: "#FB7185", bg: "#160010", txt: "#ffffff" },
];

const TEMPLATES = [
  { id: "layered",     name: "Modern Stack",   desc: "Clean stacked card layout with bold footer" },
  { id: "bold_side",   name: "Minimal Split",  desc: "Stylish split layout with dark left band" },
  { id: "glow_frame",  name: "Glow Frame",     desc: "Tech portrait with glowing border frame" },
  { id: "arc_minimal", name: "Elegant Classic", desc: "Classic asymmetrical layout with clean lines" },
];

// ─── Canvas Utilities ────────────────────────────────────────────────────────

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawPhoto(
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

function autoFit(ctx: CanvasRenderingContext2D, text: string, maxW: number, baseSz: number, minSz = 14): number {
  let sz = baseSz;
  ctx.font = `900 ${sz}px Inter,system-ui`;
  while (ctx.measureText(text).width > maxW && sz > minSz) {
    sz -= 1;
    ctx.font = `900 ${sz}px Inter,system-ui`;
  }
  return sz;
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 0xff) + amt);
  const b = clamp((n & 0xff) + amt);
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function wrapAwardText(ctx: CanvasRenderingContext2D, text: string, maxW: number, baseSz: number): { lines: string[]; sz: number } {
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

// ─── Template 1: Modern Stack (AIBI-style) ──────────────────────────────────

function tLayered(ctx: CanvasRenderingContext2D, W: number, H: number, o: RenderOpts) {
  const { photo, logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt } = o;
  const light = txt !== "#ffffff";
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.fillStyle = primary + "1e";
  for (let x = 28; x < W; x += 28) for (let y = 28; y < H; y += 28) {
    ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  const cX = W / 2;
  const cardW = W * 0.76;
  const cardH = H * 0.57;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.06)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  rrect(ctx, cX - cardW / 2, H * 0.22, cardW, cardH, 28);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
  const accentW = cardW - 48;
  const accentH = H * 0.29;
  ctx.save();
  ctx.shadowColor = primary + "28";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  rrect(ctx, cX - accentW / 2, H * 0.52, accentW, accentH, 20);
  ctx.fillStyle = primary;
  ctx.fill();
  ctx.restore();
  const pR = W * 0.125, pCx = cX, pCy = H * 0.23;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.14)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  ctx.beginPath();
  ctx.arc(pCx, pCy, pR + 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
  drawPhoto(ctx, photo, pCx, pCy, pR, pR, tf, "circle");
  if (logoImg) {
    ctx.save();
    const lw = Math.round(W * 0.13), lh = logoImg.naturalHeight * (lw / logoImg.naturalWidth);
    ctx.drawImage(logoImg, cX - lw / 2, 190, lw, lh);
    ctx.restore();
  } else if (orgName) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `800 ${Math.round(W * 0.024)}px Inter,system-ui`;
    ctx.fillStyle = "rgba(17,24,39,0.4)";
    ctx.fillText(orgName.toUpperCase(), cX, 210);
    ctx.restore();
  }
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const nBaseSz = Math.round(W * 0.045);
  const nFsz = autoFit(ctx, name || "Your Name", cardW * 0.78, nBaseSz, 20);
  ctx.font = `700 ${nFsz}px Inter,system-ui`;
  ctx.fillStyle = "#111827";
  ctx.fillText(name || "Your Name", cX, H * 0.395);
  ctx.font = `400 ${Math.round(W * 0.022)}px Inter,system-ui`;
  ctx.fillStyle = "rgba(17,24,39,0.5)";
  ctx.fillText(role || "Department · Role", cX, H * 0.395 + nFsz + 6);
  ctx.restore();
  const aText = awardType.toUpperCase();
  const { lines: aLines, sz: aFsz } = wrapAwardText(ctx, aText, accentW * 0.88, Math.round(W * 0.052));
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 6;
  ctx.font = `900 ${aFsz}px Inter,system-ui`;
  const aStartY = aLines.length === 1 ? H * 0.60 : H * 0.565;
  aLines.forEach((line, i) => ctx.fillText(line, cX, aStartY + i * (aFsz + 4)));
  ctx.restore();
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `600 italic ${Math.round(W * 0.024)}px Georgia,serif`;
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(periodLabel || "", cX, H * 0.77);
  ctx.restore();
  if (tagline) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `400 ${Math.round(W * 0.021)}px Inter,system-ui`;
    ctx.fillStyle = light ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
    ctx.fillText(tagline, cX, H * 0.92);
    ctx.restore();
  }
}

// ─── Template 2: Minimal Split ──────────────────────────────────────────────

function tBoldSide(ctx: CanvasRenderingContext2D, W: number, H: number, o: RenderOpts) {
  const { photo, logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt } = o;
  const light = txt !== "#ffffff";
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.fillStyle = primary + "1e";
  for (let x = 28; x < W; x += 28) for (let y = 28; y < H; y += 28) {
    ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.06)";
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  rrect(ctx, 100, 140, 600, 540, 24);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
  ctx.save();
  rrect(ctx, 100, 140, 600, 540, 24);
  ctx.clip();
  const grad = ctx.createLinearGradient(100, 140, 320, 680);
  grad.addColorStop(0, primary);
  grad.addColorStop(1, secondary || shade(primary, -40));
  ctx.fillStyle = grad;
  ctx.fillRect(100, 140, 220, 540);
  ctx.restore();
  if (logoImg) {
    ctx.save();
    const lw = Math.round(W * 0.11), lh = logoImg.naturalHeight * (lw / logoImg.naturalWidth);
    ctx.drawImage(logoImg, 210 - lw / 2, 180, lw, lh);
    ctx.restore();
  } else if (orgName) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `800 ${Math.round(W * 0.022)}px Inter,system-ui`;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(orgName.toUpperCase(), 210, 200);
    ctx.restore();
  }
  const pR = 75;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.14)";
  ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.arc(210, 330, pR + 5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.restore();
  drawPhoto(ctx, photo, 210, 330, pR, pR, tf, "circle");
  if (periodLabel) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `600 italic ${Math.round(W * 0.022)}px Georgia,serif`;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(periodLabel, 210, 460);
    ctx.restore();
  }
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = primary;
  const aText = awardType.toUpperCase();
  const { lines: aLines, sz: aFsz } = wrapAwardText(ctx, aText, 330, Math.round(W * 0.046));
  ctx.font = `900 ${aFsz}px Inter,system-ui`;
  aLines.forEach((line, i) => ctx.fillText(line, 350, 200 + i * (aFsz + 6)));
  ctx.restore();
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#111827";
  const nBaseSz = Math.round(W * 0.045);
  const nFsz = autoFit(ctx, name || "Your Name", 330, nBaseSz, 20);
  ctx.font = `700 ${nFsz}px Inter,system-ui`;
  ctx.fillText(name || "Your Name", 350, 360);
  ctx.font = `400 ${Math.round(W * 0.022)}px Inter,system-ui`;
  ctx.fillStyle = "rgba(17,24,39,0.5)";
  ctx.fillText(role || "Department · Role", 350, 360 + nFsz + 8);
  ctx.restore();
  if (orgName) {
    ctx.save();
    ctx.textAlign = "left";
    ctx.font = `700 ${Math.round(W * 0.022)}px Inter,system-ui`;
    ctx.fillStyle = "rgba(17,24,39,0.3)";
    ctx.fillText(orgName, 350, 610);
    ctx.restore();
  }
  if (tagline) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `400 ${Math.round(W * 0.021)}px Inter,system-ui`;
    ctx.fillStyle = light ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
    ctx.fillText(tagline, W / 2, H * 0.92);
    ctx.restore();
  }
}

// ─── Template 3: Glow Frame ─────────────────────────────────────────────────

function tGlowFrame(ctx: CanvasRenderingContext2D, W: number, H: number, o: RenderOpts) {
  const { photo, logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt } = o;
  const light = txt !== "#ffffff";
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, shade(bg, 18));
  bgGrad.addColorStop(1, bg);
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);
  const cardW = 600;
  const cardH = 540;
  const cX = W / 2;
  ctx.save();
  ctx.shadowColor = primary;
  ctx.shadowBlur = 24;
  rrect(ctx, cX - cardW / 2, 140, cardW, cardH, 24);
  ctx.fillStyle = "#0c0d14";
  ctx.fill();
  ctx.strokeStyle = primary;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  if (logoImg) {
    ctx.save();
    const lw = Math.round(W * 0.12), lh = logoImg.naturalHeight * (lw / logoImg.naturalWidth);
    ctx.drawImage(logoImg, cX - lw / 2, 175, lw, lh);
    ctx.restore();
  } else if (orgName) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `800 ${Math.round(W * 0.024)}px Inter,system-ui`;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(orgName.toUpperCase(), cX, 195);
    ctx.restore();
  }
  const pW = 150, pH = 190;
  ctx.save();
  ctx.shadowColor = primary + "88";
  ctx.shadowBlur = 16;
  rrect(ctx, cX - pW / 2 - 4, 330 - pH / 2 - 4, pW + 8, pH + 8, 16);
  ctx.strokeStyle = primary; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  drawPhoto(ctx, photo, cX, 330, pW / 2, pH / 2, tf, "rrect");
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  const nBaseSz = Math.round(W * 0.045);
  const nFsz = autoFit(ctx, name || "Your Name", cardW * 0.8, nBaseSz, 20);
  ctx.font = `700 ${nFsz}px Inter,system-ui`;
  ctx.fillText(name || "Your Name", cX, 475);
  ctx.font = `500 ${Math.round(W * 0.022)}px Inter,system-ui`;
  ctx.fillStyle = primary;
  ctx.fillText(role || "Department · Role", cX, 475 + nFsz + 8);
  ctx.restore();
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = secondary || "#ffffff";
  const aText = awardType.toUpperCase();
  const { lines: aLines, sz: aFsz } = wrapAwardText(ctx, aText, cardW * 0.88, Math.round(W * 0.046));
  ctx.font = `900 ${aFsz}px Inter,system-ui`;
  aLines.forEach((line, i) => ctx.fillText(line, cX, 585 + i * (aFsz + 4)));
  ctx.restore();
  if (periodLabel) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `600 italic ${Math.round(W * 0.022)}px Georgia,serif`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(periodLabel, cX, 635);
    ctx.restore();
  }
  if (tagline) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `400 ${Math.round(W * 0.021)}px Inter,system-ui`;
    ctx.fillStyle = light ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
    ctx.fillText(tagline, cX, H * 0.92);
    ctx.restore();
  }
}

// ─── Template 4: Elegant Classic ────────────────────────────────────────────

function tArcMinimal(ctx: CanvasRenderingContext2D, W: number, H: number, o: RenderOpts) {
  const { photo, logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt } = o;
  const light = txt !== "#ffffff";
  ctx.fillStyle = "#f6f7fb"; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.fillStyle = primary + "1a";
  for (let x = 20; x < W; x += 20) for (let y = 20; y < H; y += 20) {
    ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  const cardW = 620;
  const cardH = 540;
  const cX = W / 2;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.05)";
  ctx.shadowBlur = 28;
  rrect(ctx, cX - cardW / 2, 140, cardW, cardH, 24);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  if (logoImg) {
    ctx.save();
    const lw = Math.round(W * 0.12), lh = logoImg.naturalHeight * (lw / logoImg.naturalWidth);
    ctx.drawImage(logoImg, 150, 180, lw, lh);
    ctx.restore();
  } else if (orgName) {
    ctx.save();
    ctx.textAlign = "left";
    ctx.font = `800 ${Math.round(W * 0.024)}px Inter,system-ui`;
    ctx.fillStyle = "rgba(17,24,39,0.7)";
    ctx.fillText(orgName.toUpperCase(), 150, 195);
    ctx.restore();
  }
  const pR = 95;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 24;
  ctx.beginPath(); ctx.arc(530, 390, pR + 6, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.restore();
  drawPhoto(ctx, photo, 530, 390, pR, pR, tf, "circle");
  ctx.save();
  ctx.strokeStyle = primary;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(530, 390, pR + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = primary;
  const aText = awardType.toUpperCase();
  const { lines: aLines, sz: aFsz } = wrapAwardText(ctx, aText, 250, Math.round(W * 0.046));
  ctx.font = `900 ${aFsz}px Inter,system-ui`;
  aLines.forEach((line, i) => ctx.fillText(line, 150, 270 + i * (aFsz + 6)));
  ctx.restore();
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#111827";
  const nBaseSz = Math.round(W * 0.045);
  const nFsz = autoFit(ctx, name || "Your Name", 250, nBaseSz, 20);
  ctx.font = `700 ${nFsz}px Inter,system-ui`;
  ctx.fillText(name || "Your Name", 150, 400);
  ctx.font = `400 ${Math.round(W * 0.022)}px Inter,system-ui`;
  ctx.fillStyle = "rgba(17,24,39,0.5)";
  ctx.fillText(role || "Department · Role", 150, 400 + nFsz + 8);
  ctx.restore();
  if (periodLabel) {
    ctx.save();
    ctx.textAlign = "left";
    ctx.font = `600 italic ${Math.round(W * 0.022)}px Georgia,serif`;
    ctx.fillStyle = secondary || primary;
    ctx.fillText(periodLabel, 150, 510);
    ctx.restore();
  }
  if (tagline) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `400 ${Math.round(W * 0.021)}px Inter,system-ui`;
    ctx.fillStyle = light ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
    ctx.fillText(tagline, cX, H * 0.92);
    ctx.restore();
  }
}

// ─── Render Dispatchers ─────────────────────────────────────────────────────

function renderCard(canvas: HTMLCanvasElement, template: string, opts: RenderOpts) {
  canvas.width = 800; canvas.height = 800;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  (ctx as any).imageSmoothingQuality = "high";
  switch (template) {
    case "layered":     tLayered(ctx, 800, 800, opts); break;
    case "bold_side":   tBoldSide(ctx, 800, 800, opts); break;
    case "glow_frame":  tGlowFrame(ctx, 800, 800, opts); break;
    case "arc_minimal": tArcMinimal(ctx, 800, 800, opts); break;
  }
}

function renderProfilePic(canvas: HTMLCanvasElement, opts: RenderOpts) {
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

function renderLandscapeCard(canvas: HTMLCanvasElement, template: string, opts: RenderOpts) {
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

function Sec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 10, letterSpacing: "0.18em", fontWeight: 600, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", marginBottom: 10 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

function Sep() { return <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }} />; }

function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input style={{
      width: "100%", boxSizing: "border-box",
      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 10, padding: "8px 11px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "inherit",
    }} {...props} />
  );
}

function Lbl({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{text}</label>
      {children}
    </div>
  );
}

function SlRow({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TopPerformerCardMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [imgVersion, setImgVersion] = useState(0); // forces redraw on upload
  const [tab, setTab] = useState<"template" | "info" | "style" | "photo">("template");

  // Card state
  const [template, setTemplate] = useState("layered");
  const [awardType, setAwardType] = useState("Employee of the Month");
  const [periodType, setPeriodType] = useState<"week" | "month" | "year" | "custom">("month");
  const [periodLabel, setPeriodLabel] = useState(MONTHS[new Date().getMonth()]);
  const [name, setName] = useState("Sanjeev Kumar");
  const [role, setRole] = useState("Digital Marketing Trainer");
  const [tagline, setTagline] = useState("Thank you for your passion and impact!");
  const [orgName, setOrgName] = useState("TemplateStudio");
  const [tf, setTf] = useState<Transform>({ scale: 1, x: 0, y: 0, rotate: 0 });

  // Style state
  const [preset, setPreset] = useState(COLOR_PRESETS[0]);
  const [primary, setPrimary] = useState(COLOR_PRESETS[0].primary);
  const [secondary, setSecondary] = useState(COLOR_PRESETS[0].secondary);
  const [bg, setBg] = useState(COLOR_PRESETS[0].bg);
  const [txt, setTxt] = useState(COLOR_PRESETS[0].txt);

  // Load logo on mount
  useEffect(() => {
    const img = new Image();
    img.src = "/aibi_logo.png";
    img.onload = () => setLogoImg(img);
  }, []);

  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    renderCard(canvasRef.current, template, {
      photo: photoRef.current, logoImg, tf, name, role, awardType,
      periodLabel, tagline, orgName, primary, secondary, bg, txt,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt, imgVersion]);

  useEffect(() => { draw(); }, [draw]);

  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const img = new Image();
    img.onload = () => {
      photoRef.current = img;
      setTf({ scale: 1, x: 0, y: 0, rotate: 0 });
      setHasPhoto(true);
      setImgVersion(v => v + 1);
    };
    img.src = URL.createObjectURL(f);
  }

  function downloadCard() {
    const tmp = document.createElement("canvas");
    renderCard(tmp, template, {
      photo: photoRef.current, logoImg, tf, name, role, awardType,
      periodLabel, tagline, orgName, primary, secondary, bg, txt,
    });
    const a = document.createElement("a");
    a.download = `${(name || "performer").replace(/\s+/g, "-").toLowerCase()}-award.png`;
    a.href = tmp.toDataURL("image/png"); a.click();
  }

  function downloadProfile() {
    const tmp = document.createElement("canvas");
    renderProfilePic(tmp, {
      photo: photoRef.current, logoImg, tf, name, role, awardType,
      periodLabel, tagline, orgName, primary, secondary, bg, txt,
    });
    const a = document.createElement("a");
    a.download = `${(name || "performer").replace(/\s+/g, "-").toLowerCase()}-avatar.png`;
    a.href = tmp.toDataURL("image/png"); a.click();
  }

  function downloadLandscape() {
    const tmp = document.createElement("canvas");
    renderLandscapeCard(tmp, template, {
      photo: photoRef.current, logoImg, tf, name, role, awardType,
      periodLabel, tagline, orgName, primary, secondary, bg, txt,
    });
    const a = document.createElement("a");
    a.download = `${(name || "performer").replace(/\s+/g, "-").toLowerCase()}-banner.png`;
    a.href = tmp.toDataURL("image/png"); a.click();
  }

  function applyPreset(p: typeof COLOR_PRESETS[0]) {
    setPreset(p); setPrimary(p.primary); setSecondary(p.secondary); setBg(p.bg); setTxt(p.txt);
  }

  // ── Styles ──────────────────────────────────────────────────────────────────

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.025)", backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20, padding: 20,
  };

  function TabBtn({ id, label }: { id: string; label: string }) {
    const active = tab === id;
    return (
      <button onClick={() => setTab(id as any)} style={{
        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
        background: active ? "#ffffff" : "rgba(255,255,255,0.04)",
        color: active ? "#000" : "rgba(255,255,255,0.45)",
        border: "1px solid " + (active ? "#ffffff" : "rgba(255,255,255,0.08)"),
        transition: "all .15s",
      }}>{label}</button>
    );
  }

  function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
      <button onClick={onClick} style={{
        padding: "5px 11px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
        background: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)",
        color: active ? "#fff" : "rgba(255,255,255,0.5)",
        border: "1px solid " + (active ? "rgba(255,255,255,0.38)" : "rgba(255,255,255,0.08)"),
        transition: "all .14s",
      }}>{label}</button>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: "radial-gradient(ellipse at 50% 0%, #14142a 0%, #040406 65%)", minHeight: "100vh", color: "#fff", fontFamily: "Inter,system-ui,sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; cursor: pointer; box-shadow: 0 0 8px rgba(255,255,255,0.4); }
        input[type=range]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #fff; border: none; cursor: pointer; }
        select option { background: #1a1a2e; color: #fff; }
      `}</style>

      <div style={{ maxWidth: 1130, margin: "0 auto", padding: "28px 16px 48px" }}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "5px 16px", marginBottom: 12 }}>
            <span>🏆</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em" }}>Top Performer Card Maker</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", margin: 0, background: "linear-gradient(to right, #fff 30%, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Celebrate Your Star Performers
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginTop: 7 }}>
            Create beautiful award cards for Week · Month · Year
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Tab switcher */}
            <div style={{ ...card, padding: "8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              <TabBtn id="template" label="Template" />
              <TabBtn id="info" label="Info" />
              <TabBtn id="style" label="Style" />
              <TabBtn id="photo" label="Photo" />
            </div>

            <div style={card}>

              {/* TEMPLATE TAB */}
              {tab === "template" && (
                <Sec label="Template">
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                        padding: "10px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                        background: template === t.id ? "rgba(255,255,255,0.1)" : "transparent",
                        border: "1px solid " + (template === t.id ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)"),
                        color: template === t.id ? "#fff" : "rgba(255,255,255,0.5)",
                        fontSize: 13, fontWeight: template === t.id ? 600 : 400,
                        transition: "all .15s",
                      }}>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </Sec>
              )}

              {/* INFO TAB */}
              {tab === "info" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Sec label="Award">
                    <Lbl text="Award Type">
                      <select value={awardType} onChange={e => setAwardType(e.target.value)} style={{
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: 10, padding: "8px 11px", color: "#fff", fontSize: 13, outline: "none",
                        fontFamily: "inherit", cursor: "pointer",
                      }}>
                        {AWARD_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </Lbl>

                    <Lbl text="Period">
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {(["week", "month", "year", "custom"] as const).map(p => (
                          <Pill key={p} active={periodType === p} onClick={() => setPeriodType(p)} label={p.charAt(0).toUpperCase() + p.slice(1)} />
                        ))}
                      </div>
                    </Lbl>

                    {periodType === "month" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                        {MONTHS.map(m => <Pill key={m} active={periodLabel === m} onClick={() => setPeriodLabel(m)} label={m} />)}
                      </div>
                    )}
                    {periodType === "week" && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {WEEKS.map(w => <Pill key={w} active={periodLabel === w} onClick={() => setPeriodLabel(w)} label={w} />)}
                      </div>
                    )}
                    {periodType === "year" && (
                      <div style={{ display: "flex", gap: 5 }}>
                        {["2024", "2025", "2026"].map(y => <Pill key={y} active={periodLabel === y} onClick={() => setPeriodLabel(y)} label={y} />)}
                      </div>
                    )}
                    {periodType === "custom" && (
                      <Inp value={periodLabel} onChange={e => setPeriodLabel(e.target.value)} placeholder="e.g. Q1 2025" />
                    )}
                  </Sec>

                  <Sep />

                  <Sec label="Person">
                    <Lbl text="Full Name"><Inp value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" /></Lbl>
                    <Lbl text="Role / Department"><Inp value={role} onChange={e => setRole(e.target.value)} placeholder="Role / Department" /></Lbl>
                    <Lbl text="Tagline"><Inp value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Thank you for your passion..." /></Lbl>
                    <Lbl text="Organisation Name"><Inp value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Org Name" /></Lbl>
                  </Sec>
                </div>
              )}

              {/* STYLE TAB */}
              {tab === "style" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Sec label="Color Presets">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7 }}>
                      {COLOR_PRESETS.map((p, i) => (
                        <button key={i} title={p.name} onClick={() => applyPreset(p)} style={{
                          aspectRatio: "1", borderRadius: 10, cursor: "pointer",
                          background: `linear-gradient(135deg, ${p.bg}, ${p.primary})`,
                          border: preset === p ? "2.5px solid rgba(255,255,255,0.9)" : "2px solid rgba(255,255,255,0.08)",
                          boxShadow: preset === p ? `0 0 14px ${p.primary}77` : "none",
                          transform: preset === p ? "scale(1.08)" : "scale(1)",
                          transition: "all .15s",
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "4px 0 0" }}>Active: {preset.name}</p>
                  </Sec>

                  <Sep />

                  <Sec label="Custom Colors">
                    {[
                      { lbl: "Primary colour", val: primary, set: setPrimary },
                      { lbl: "Secondary / gradient", val: secondary, set: setSecondary },
                      { lbl: "Background", val: bg, set: setBg },
                    ].map(({ lbl, val, set }) => (
                      <div key={lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{lbl}</span>
                        <input type="color" value={val} onChange={e => set(e.target.value)}
                          style={{ width: 32, height: 24, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", padding: 2, cursor: "pointer" }} />
                      </div>
                    ))}
                  </Sec>
                </div>
              )}

              {/* PHOTO TAB */}
              {tab === "photo" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <Sec label="Upload Photo">
                    <label style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      borderRadius: 12, padding: "16px 0", cursor: "pointer",
                      border: "1.5px dashed rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.03)",
                      color: "rgba(255,255,255,0.5)", fontSize: 13, transition: "all .2s",
                    }}>
                      <span style={{ fontSize: 20 }}>↑</span>
                      <span>{hasPhoto ? "Replace photo" : "Upload photo"}</span>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={upload} />
                    </label>
                    {!hasPhoto && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0, textAlign: "center" }}>PNG or JPG works best. Landscape or portrait.</p>}
                  </Sec>

                  {hasPhoto && (
                    <>
                      <Sep />
                      <Sec label="Adjust Image">
                        <SlRow label="Zoom" min={0.5} max={3} step={0.01} value={tf.scale} onChange={v => setTf(p => ({ ...p, scale: v }))} />
                        <SlRow label="Pan X" min={-250} max={250} step={1} value={tf.x} onChange={v => setTf(p => ({ ...p, x: v }))} />
                        <SlRow label="Pan Y" min={-250} max={250} step={1} value={tf.y} onChange={v => setTf(p => ({ ...p, y: v }))} />
                        <SlRow label="Rotate" min={-180} max={180} step={1} value={tf.rotate} onChange={v => setTf(p => ({ ...p, rotate: v }))} />
                        <button onClick={() => setTf({ scale: 1, x: 0, y: 0, rotate: 0 })}
                          style={{ color: "rgba(255,255,255,0.28)", background: "none", border: "none", cursor: "pointer", fontSize: 11, textAlign: "left", padding: 0, marginTop: 2 }}>
                          ↺ Reset adjustments
                        </button>
                      </Sec>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Canvas Preview ──────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Canvas */}
            <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, padding: 28 }}>
              <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 28px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.05)" }}>
                <canvas ref={canvasRef} style={{ display: "block", maxWidth: "100%", maxHeight: 580, width: "auto", height: "auto" }} />
              </div>
            </div>

            {/* Download Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "4px 0 2px" }}>Download Formats</p>
              
              <button onClick={downloadCard} style={{
                width: "100%", padding: "12px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: "linear-gradient(135deg, " + primary + ", " + (secondary || primary) + ")", color: "#fff",
                border: "none", transition: "all .2s",
                boxShadow: "0 4px 12px " + primary + "33",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = "none"; }}
              >
                🎴 Download Square Award Card (PNG)
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={downloadProfile} style={{
                  padding: "11px 0", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)", transition: "all .2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)"; }}
                >
                  👤 Profile Avatar
                </button>

                <button onClick={downloadLandscape} style={{
                  padding: "11px 0", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)", transition: "all .2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)"; }}
                >
                  🖥️ Landscape Banner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
