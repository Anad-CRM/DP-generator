"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Transform, RenderOpts, AWARD_TYPES, MONTHS, WEEKS, COLOR_PRESETS,
  rrect, drawPhoto, autoFit, shade, wrapAwardText, renderProfilePic, renderLandscapeCard,
  Sec, Sep, Inp, Lbl, SlRow
} from "./TopPerformerShared";

// ─── Canvas Renderers ─────────────────────────────────────────────────────────

function tModernStack(ctx: CanvasRenderingContext2D, W: number, H: number, o: RenderOpts) {
  const { photo, logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt } = o;
  const light = txt !== "#ffffff";

  // Dynamic Background: Soft gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, shade(bg, -15));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle modern grid pattern
  ctx.save(); ctx.strokeStyle = primary + "0d"; ctx.lineWidth = 1;
  for (let x = 40; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 40; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();

  const cX = W / 2, cardW = W * 0.8, cardH = H * 0.65;

  // Main Card
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.08)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20;
  rrect(ctx, cX - cardW / 2, H * 0.2, cardW, cardH, 32);
  ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.restore();

  // Subtle top accent line
  ctx.save();
  rrect(ctx, cX - cardW / 2, H * 0.24, cardW, 8, 32);
  ctx.fillStyle = primary; ctx.fill();
  ctx.restore();

  // Profile Picture
  const pR = W * 0.18, pCx = cX, pCy = H * 0.30;
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.12)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12;
  ctx.beginPath(); ctx.arc(pCx, pCy, pR + 8, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill(); ctx.restore();
  drawPhoto(ctx, photo, pCx, pCy, pR, pR, tf, "circle");

  // Logo / Org
  if (logoImg) {
    ctx.save();
    const lw = Math.round(W * 0.22), lh = logoImg.naturalHeight * (lw / logoImg.naturalWidth);
    ctx.drawImage(logoImg, cX - lw / 2, 30, lw, lh); ctx.restore();
  } else if (orgName) {
    ctx.save(); ctx.textAlign = "center"; ctx.font = `800 ${Math.round(W * 0.026)}px Inter,system-ui`;
    ctx.fillStyle = "rgba(17,24,39,0.4)"; ctx.fillText(orgName.toUpperCase(), cX, 50); ctx.restore();
  }

  // Typography
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "top";

  const nFsz = autoFit(ctx, name || "Your Name", cardW * 0.85, Math.round(W * 0.055), 24);
  ctx.font = `800 ${nFsz}px Inter,system-ui`; ctx.fillStyle = "#111827";
  ctx.fillText(name || "Your Name", cX, H * 0.53);

  ctx.font = `600 ${Math.round(W * 0.024)}px Inter,system-ui`; ctx.fillStyle = primary;
  ctx.fillText((role || "Department · Role").toUpperCase(), cX, H * 0.53 + nFsz + 12);

  if (periodLabel) {
    ctx.font = `600 ${Math.round(W * 0.02)}px Inter,system-ui`;
    ctx.fillStyle = "rgba(17,24,39,0.35)";
    ctx.fillText(periodLabel.toUpperCase(), cX, H * 0.53 + nFsz + 65);
  }
  ctx.restore();

  if (awardType) {
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const { lines: aLines, sz: aFsz } = wrapAwardText(ctx, awardType.toUpperCase(), cardW * 0.85, Math.round(W * 0.04));
    ctx.font = `900 ${aFsz}px Inter,system-ui`;
    ctx.fillStyle = primary; // Explicitly blue
    const aStartY = aLines.length === 1 ? H * 0.72 : H * 0.70;
    aLines.forEach((line, i) => ctx.fillText(line, cX, aStartY + i * (aFsz + 4)));
    ctx.restore();
  }

  if (tagline) {
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const { lines: tLines, sz: tFsz } = wrapAwardText(ctx, tagline, cardW * 0.85, Math.round(W * 0.024));
    // Re-apply the non-bold font since wrapAwardText modifies it to 900
    ctx.font = `italic 400 ${tFsz}px Inter,system-ui`;
    ctx.fillStyle = "rgba(17,24,39,0.6)";
    tLines.forEach((line, i) => ctx.fillText(line, cX, H * 0.80 + i * (tFsz + 6)));
    ctx.restore();
  }
}

function tMinimalSplit(ctx: CanvasRenderingContext2D, W: number, H: number, o: RenderOpts) {
  const { photo, logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt } = o;
  const light = txt !== "#ffffff";
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.fillStyle = primary + "1e";
  for (let x = 28; x < W; x += 28) for (let y = 28; y < H; y += 28) {
    ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.06)"; ctx.shadowBlur = 32; ctx.shadowOffsetY = 12;
  rrect(ctx, 100, 140, 600, 540, 24); ctx.fillStyle = "#ffffff"; ctx.fill(); ctx.restore();
  ctx.save(); rrect(ctx, 100, 140, 600, 540, 24); ctx.clip();
  const grad = ctx.createLinearGradient(100, 140, 320, 680);
  grad.addColorStop(0, primary); grad.addColorStop(1, secondary || shade(primary, -40));
  ctx.fillStyle = grad; ctx.fillRect(100, 140, 220, 540); ctx.restore();
  if (logoImg) {
    ctx.save(); const lw = Math.round(W * 0.11), lh = logoImg.naturalHeight * (lw / logoImg.naturalWidth);
    ctx.drawImage(logoImg, 210 - lw / 2, 180, lw, lh); ctx.restore();
  } else if (orgName) {
    ctx.save(); ctx.textAlign = "center"; ctx.font = `800 ${Math.round(W * 0.022)}px Inter,system-ui`;
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillText(orgName.toUpperCase(), 210, 200); ctx.restore();
  }
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.14)"; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.arc(210, 330, 80, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill(); ctx.restore();
  drawPhoto(ctx, photo, 210, 330, 75, 75, tf, "circle");
  if (periodLabel) {
    ctx.save(); ctx.textAlign = "center"; ctx.font = `600 italic ${Math.round(W * 0.022)}px Georgia,serif`;
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillText(periodLabel, 210, 460); ctx.restore();
  }
  ctx.save(); ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillStyle = primary;
  const { lines: aLines, sz: aFsz } = wrapAwardText(ctx, awardType.toUpperCase(), 330, Math.round(W * 0.046));
  ctx.font = `900 ${aFsz}px Inter,system-ui`; aLines.forEach((line, i) => ctx.fillText(line, 350, 200 + i * (aFsz + 6))); ctx.restore();
  ctx.save(); ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillStyle = "#111827";
  const nFsz = autoFit(ctx, name || "Your Name", 330, Math.round(W * 0.045), 20);
  ctx.font = `700 ${nFsz}px Inter,system-ui`; ctx.fillText(name || "Your Name", 350, 360);
  ctx.font = `400 ${Math.round(W * 0.022)}px Inter,system-ui`; ctx.fillStyle = "rgba(17,24,39,0.5)";
  ctx.fillText(role || "Department · Role", 350, 360 + nFsz + 8); ctx.restore();
  if (orgName) {
    ctx.save(); ctx.textAlign = "left"; ctx.font = `700 ${Math.round(W * 0.022)}px Inter,system-ui`;
    ctx.fillStyle = "rgba(17,24,39,0.3)"; ctx.fillText(orgName, 350, 610); ctx.restore();
  }
  if (tagline) {
    ctx.save(); ctx.textAlign = "center"; ctx.font = `400 ${Math.round(W * 0.021)}px Inter,system-ui`;
    ctx.fillStyle = light ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)"; ctx.fillText(tagline, W / 2, H * 0.92); ctx.restore();
  }
}

function tGlowFrame(ctx: CanvasRenderingContext2D, W: number, H: number, o: RenderOpts) {
  const { photo, logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt } = o;
  const light = txt !== "#ffffff";
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, shade(bg, 18)); bgGrad.addColorStop(1, bg);
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);
  const cX = W / 2, cardW = 600, cardH = 540;
  ctx.save(); ctx.shadowColor = primary; ctx.shadowBlur = 24;
  rrect(ctx, cX - cardW / 2, 140, cardW, cardH, 24); ctx.fillStyle = "#0c0d14"; ctx.fill();
  ctx.strokeStyle = primary; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  if (logoImg) {
    ctx.save(); const lw = Math.round(W * 0.12), lh = logoImg.naturalHeight * (lw / logoImg.naturalWidth);
    ctx.drawImage(logoImg, cX - lw / 2, 175, lw, lh); ctx.restore();
  } else if (orgName) {
    ctx.save(); ctx.textAlign = "center"; ctx.font = `800 ${Math.round(W * 0.024)}px Inter,system-ui`;
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.fillText(orgName.toUpperCase(), cX, 195); ctx.restore();
  }
  const pW = 150, pH = 190;
  ctx.save(); ctx.shadowColor = primary + "88"; ctx.shadowBlur = 16;
  rrect(ctx, cX - pW / 2 - 4, 330 - pH / 2 - 4, pW + 8, pH + 8, 16);
  ctx.strokeStyle = primary; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  drawPhoto(ctx, photo, cX, 330, pW / 2, pH / 2, tf, "rrect");
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillStyle = "#ffffff";
  const nFsz = autoFit(ctx, name || "Your Name", cardW * 0.8, Math.round(W * 0.045), 20);
  ctx.font = `700 ${nFsz}px Inter,system-ui`; ctx.fillText(name || "Your Name", cX, 475);
  ctx.font = `500 ${Math.round(W * 0.022)}px Inter,system-ui`; ctx.fillStyle = primary;
  ctx.fillText(role || "Department · Role", cX, 475 + nFsz + 8); ctx.restore();
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillStyle = secondary || "#ffffff";
  const { lines: aLines, sz: aFsz } = wrapAwardText(ctx, awardType.toUpperCase(), cardW * 0.88, Math.round(W * 0.046));
  ctx.font = `900 ${aFsz}px Inter,system-ui`; aLines.forEach((line, i) => ctx.fillText(line, cX, 585 + i * (aFsz + 4))); ctx.restore();
  if (periodLabel) {
    ctx.save(); ctx.textAlign = "center"; ctx.font = `600 italic ${Math.round(W * 0.022)}px Georgia,serif`;
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fillText(periodLabel, cX, 635); ctx.restore();
  }
  if (tagline) {
    ctx.save(); ctx.textAlign = "center"; ctx.font = `400 ${Math.round(W * 0.021)}px Inter,system-ui`;
    ctx.fillStyle = light ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)"; ctx.fillText(tagline, cX, H * 0.92); ctx.restore();
  }
}

function tElegantClassic(ctx: CanvasRenderingContext2D, W: number, H: number, o: RenderOpts) {
  const { photo, logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt } = o;
  const light = txt !== "#ffffff";
  ctx.fillStyle = "#f6f7fb"; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.fillStyle = primary + "1a";
  for (let x = 20; x < W; x += 20) for (let y = 20; y < H; y += 20) {
    ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  const cX = W / 2, cardW = 620, cardH = 540;
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.05)"; ctx.shadowBlur = 28;
  rrect(ctx, cX - cardW / 2, 140, cardW, cardH, 24); ctx.fillStyle = "#ffffff"; ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  if (logoImg) {
    ctx.save(); const lw = Math.round(W * 0.12), lh = logoImg.naturalHeight * (lw / logoImg.naturalWidth);
    ctx.drawImage(logoImg, 150, 180, lw, lh); ctx.restore();
  } else if (orgName) {
    ctx.save(); ctx.textAlign = "left"; ctx.font = `800 ${Math.round(W * 0.024)}px Inter,system-ui`;
    ctx.fillStyle = "rgba(17,24,39,0.7)"; ctx.fillText(orgName.toUpperCase(), 150, 195); ctx.restore();
  }
  const pR = 95;
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 24;
  ctx.beginPath(); ctx.arc(530, 390, pR + 6, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill(); ctx.restore();
  drawPhoto(ctx, photo, 530, 390, pR, pR, tf, "circle");
  ctx.save(); ctx.strokeStyle = primary; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(530, 390, pR + 6, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillStyle = primary;
  const { lines: aLines, sz: aFsz } = wrapAwardText(ctx, awardType.toUpperCase(), 250, Math.round(W * 0.046));
  ctx.font = `900 ${aFsz}px Inter,system-ui`; aLines.forEach((line, i) => ctx.fillText(line, 150, 270 + i * (aFsz + 6))); ctx.restore();
  ctx.save(); ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillStyle = "#111827";
  const nFsz = autoFit(ctx, name || "Your Name", 250, Math.round(W * 0.045), 20);
  ctx.font = `700 ${nFsz}px Inter,system-ui`; ctx.fillText(name || "Your Name", 150, 400);
  ctx.font = `400 ${Math.round(W * 0.022)}px Inter,system-ui`; ctx.fillStyle = "rgba(17,24,39,0.5)";
  ctx.fillText(role || "Department · Role", 150, 400 + nFsz + 8); ctx.restore();
  if (periodLabel) {
    ctx.save(); ctx.textAlign = "left"; ctx.font = `600 italic ${Math.round(W * 0.022)}px Georgia,serif`;
    ctx.fillStyle = secondary || primary; ctx.fillText(periodLabel, 150, 510); ctx.restore();
  }
  if (tagline) {
    ctx.save(); ctx.textAlign = "center"; ctx.font = `400 ${Math.round(W * 0.021)}px Inter,system-ui`;
    ctx.fillStyle = light ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)"; ctx.fillText(tagline, cX, H * 0.92); ctx.restore();
  }
}

// ─── Template Registry ────────────────────────────────────────────────────────

type TemplateId = "modern-stack" | "minimal-split" | "glow-frame" | "elegant-classic";

const TEMPLATES: { id: TemplateId; name: string; desc: string; emoji: string }[] = [
  { id: "modern-stack", name: "Modern Stack", desc: "Bold centered layout", emoji: "🎴" },
  { id: "minimal-split", name: "Minimal Split", desc: "Clean left-band design", emoji: "⬛" },
  { id: "glow-frame", name: "Glow Frame", desc: "Neon-lit dark card", emoji: "✨" },
  { id: "elegant-classic", name: "Elegant Classic", desc: "Clean asymmetric style", emoji: "🏅" },
];

function renderTemplate(id: TemplateId, canvas: HTMLCanvasElement, opts: RenderOpts) {
  canvas.width = 800; canvas.height = 800;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  (ctx as any).imageSmoothingQuality = "high";
  if (id === "modern-stack") tModernStack(ctx, 800, 800, opts);
  if (id === "minimal-split") tMinimalSplit(ctx, 800, 800, opts);
  if (id === "glow-frame") tGlowFrame(ctx, 800, 800, opts);
  if (id === "elegant-classic") tElegantClassic(ctx, 800, 800, opts);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TopPerformerCardMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [imgVersion, setImgVersion] = useState(0);
  const [tab, setTab] = useState<"template" | "content" | "style">("template");
  const [templateId, setTemplateId] = useState<TemplateId>("modern-stack");

  const [awardType, setAwardType] = useState("Employee of the Month");
  const [periodType, setPeriodType] = useState<"week" | "month" | "year" | "custom">("month");
  const [periodLabel, setPeriodLabel] = useState(MONTHS[new Date().getMonth()]);
  const [name, setName] = useState("John Doe");
  const [role, setRole] = useState("Digital Marketing");
  const [tagline, setTagline] = useState("Thank you for your passion and impact!");
  const [orgName, setOrgName] = useState("TemplateStudio");
  const [tf, setTf] = useState<Transform>({ scale: 1, x: 0, y: 0, rotate: 0 });

  const [preset, setPreset] = useState(COLOR_PRESETS[0]);
  const [primary, setPrimary] = useState(COLOR_PRESETS[0].primary);
  const [secondary, setSecondary] = useState(COLOR_PRESETS[0].secondary);
  const [bg, setBg] = useState(COLOR_PRESETS[0].bg);
  const [txt, setTxt] = useState(COLOR_PRESETS[0].txt);

  useEffect(() => {
    const img = new Image(); img.src = "/Aibi_Primary Logo_Gradient.png";
    img.onload = () => setLogoImg(img);
  }, []);

  const opts: RenderOpts = { photo: photoRef.current, logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt };

  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    renderTemplate(templateId, canvasRef.current, opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt, imgVersion]);

  useEffect(() => { draw(); }, [draw]);

  function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const img = new Image();
    img.onload = () => { photoRef.current = img; setTf({ scale: 1, x: 0, y: 0, rotate: 0 }); setHasPhoto(true); setImgVersion(v => v + 1); };
    img.src = URL.createObjectURL(f);
  }

  function dl(filename: string, renderFn: (c: HTMLCanvasElement) => void) {
    const tmp = document.createElement("canvas");
    renderFn(tmp);
    const a = document.createElement("a");
    a.download = filename; a.href = tmp.toDataURL("image/png"); a.click();
  }

  function applyPreset(p: typeof COLOR_PRESETS[0]) {
    setPreset(p); setPrimary(p.primary); setSecondary(p.secondary); setBg(p.bg); setTxt(p.txt);
  }

  const slug = (name || "performer").replace(/\s+/g, "-").toLowerCase();
  const currentTemplate = TEMPLATES.find(t => t.id === templateId)!;

  // ── Shared style tokens ──
  const panel: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
  };

  function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
      <button onClick={onClick} style={{
        padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: "pointer",
        background: active ? primary : "rgba(255,255,255,0.05)",
        color: active ? "#fff" : "rgba(255,255,255,0.45)",
        border: "1px solid " + (active ? primary : "rgba(255,255,255,0.07)"),
        transition: "all .14s",
      }}>{label}</button>
    );
  }

  return (
    <div style={{ background: "linear-gradient(135deg, #0a0a14 0%, #0e0e1e 50%, #080810 100%)", minHeight: "100vh", color: "#fff", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; outline: none; cursor: pointer; width: 100%; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 13px; height: 13px; border-radius: 50%; background: #fff; cursor: pointer; box-shadow: 0 0 6px rgba(255,255,255,0.35); }
        input[type=range]::-moz-range-thumb { width: 13px; height: 13px; border-radius: 50%; background: #fff; border: none; cursor: pointer; }
        select option { background: #12121e; color: #fff; }
        .tab-btn { padding: 7px 0; flex: 1; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; border: none; font-family: inherit; }
        .tab-btn.active { background: rgba(255,255,255,0.12); color: #fff; }
        .tab-btn.inactive { background: transparent; color: rgba(255,255,255,0.35); }
        .tab-btn:hover { color: rgba(255,255,255,0.8); }
        .dl-btn { width: 100%; padding: 11px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 7px; }
        .dl-btn-secondary { padding: 10px; border-radius: 11px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid rgba(255,255,255,0.09); font-family: inherit; transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 6px; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.65); }
        .dl-btn-secondary:hover { background: rgba(255,255,255,0.09); color: #fff; border-color: rgba(255,255,255,0.18); }
        .tmpl-card { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 12px; cursor: pointer; border: 1px solid transparent; transition: all .15s; font-family: inherit; text-align: left; width: 100%; }
        .tmpl-card.active { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.18); }
        .tmpl-card.inactive { background: transparent; color: rgba(255,255,255,0.5); }
        .tmpl-card:hover { background: rgba(255,255,255,0.06); color: #fff; border-color: rgba(255,255,255,0.12); }
        .field-inp { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 9px 12px; color: #fff; font-size: 13px; outline: none; font-family: inherit; transition: border-color .15s; }
        .field-inp:focus { border-color: rgba(255,255,255,0.2); }
        .upload-zone { display: flex; align-items: center; justify-content: center; gap: 10px; border-radius: 12px; padding: 18px; cursor: pointer; border: 1.5px dashed rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); color: rgba(255,255,255,0.4); font-size: 13px; font-weight: 500; transition: all .2s; font-family: inherit; width: 100%; }
        .upload-zone:hover { border-color: rgba(255,255,255,0.22); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); }
      `}</style>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 100, padding: "4px 14px 4px 10px", marginBottom: 14 }}>
            <span style={{ fontSize: 14 }}>{currentTemplate.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{currentTemplate.name}</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.6px", lineHeight: 1.15, background: "linear-gradient(135deg, #030303ff 30%, rgba(255,255,255,0.45))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Top Performer Card Maker
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginTop: 8, fontWeight: 400 }}>Design and download professional award cards in seconds</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 16, alignItems: "start" }}>

          {/* ── Left Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

            {/* Tab Nav */}
            <div style={{ ...panel, padding: 6, display: "flex", gap: 4 }}>
              {(["template", "content", "style"] as const).map(t => (
                <button key={t} className={`tab-btn ${tab === t ? "active" : "inactive"}`} onClick={() => setTab(t)}>
                  {t === "template" ? "Template" : t === "content" ? "Content" : "Style"}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div style={{ ...panel, padding: 16 }}>

              {/* ── Template Tab ── */}
              {tab === "template" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.15em", fontWeight: 700, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 8 }}>Choose a Layout</p>
                  {TEMPLATES.map(t => (
                    <button key={t.id} className={`tmpl-card ${templateId === t.id ? "active" : "inactive"}`} onClick={() => setTemplateId(t.id)}>
                      <span style={{ fontSize: 22, lineHeight: 1 }}>{t.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: templateId === t.id ? "#fff" : "rgba(255,255,255,0.6)" }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{t.desc}</div>
                      </div>
                      {templateId === t.id && (
                        <span style={{ fontSize: 10, background: primary + "33", color: primary, borderRadius: 6, padding: "2px 8px", fontWeight: 700, border: `1px solid ${primary}44`, whiteSpace: "nowrap" }}>Active</span>
                      )}
                    </button>
                  ))}
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", marginTop: 8, lineHeight: 1.5 }}>
                    Your edits are preserved when switching.
                  </p>
                </div>
              )}

              {/* ── Content Tab ── */}
              {tab === "content" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                  {/* Photo Upload */}
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: "0.15em", fontWeight: 700, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 10 }}>Photo</p>
                    <label className="upload-zone" style={{ cursor: "pointer" }}>
                      <span style={{ fontSize: 18 }}>↑</span>
                      <span>{hasPhoto ? "Replace photo" : "Upload photo"}</span>
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={upload} />
                    </label>
                  </div>

                  {hasPhoto && (
                    <div>
                      <p style={{ fontSize: 10, letterSpacing: "0.15em", fontWeight: 700, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 10 }}>Adjust Image</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <SlRow label="Zoom" min={0.5} max={3} step={0.01} value={tf.scale} onChange={v => setTf(p => ({ ...p, scale: v }))} />
                        <SlRow label="Pan X" min={-250} max={250} step={1} value={tf.x} onChange={v => setTf(p => ({ ...p, x: v }))} />
                        <SlRow label="Pan Y" min={-250} max={250} step={1} value={tf.y} onChange={v => setTf(p => ({ ...p, y: v }))} />
                        <SlRow label="Rotate" min={-180} max={180} step={1} value={tf.rotate} onChange={v => setTf(p => ({ ...p, rotate: v }))} />
                        <button onClick={() => setTf({ scale: 1, x: 0, y: 0, rotate: 0 })}
                          style={{ color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", fontSize: 11, textAlign: "left", padding: 0, fontFamily: "inherit" }}>
                          ↺ Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Text Fields */}
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: "0.15em", fontWeight: 700, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 10 }}>Award</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <select value={awardType} onChange={e => setAwardType(e.target.value)} className="field-inp" style={{ cursor: "pointer" }}>
                        {AWARD_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {(["week", "month", "year", "custom"] as const).map(p => (
                          <Pill key={p} active={periodType === p} onClick={() => setPeriodType(p)} label={p[0].toUpperCase() + p.slice(1)} />
                        ))}
                      </div>
                      {periodType === "month" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
                          {MONTHS.map(m => <Pill key={m} active={periodLabel === m} onClick={() => setPeriodLabel(m)} label={m.slice(0, 3)} />)}
                        </div>
                      )}
                      {periodType === "week" && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {WEEKS.map(w => <Pill key={w} active={periodLabel === w} onClick={() => setPeriodLabel(w)} label={w} />)}
                        </div>
                      )}
                      {periodType === "year" && (
                        <div style={{ display: "flex", gap: 4 }}>
                          {["2024", "2025", "2026"].map(y => <Pill key={y} active={periodLabel === y} onClick={() => setPeriodLabel(y)} label={y} />)}
                        </div>
                      )}
                      {periodType === "custom" && (
                        <input className="field-inp" value={periodLabel} onChange={e => setPeriodLabel(e.target.value)} placeholder="e.g. Q1 2025" />
                      )}
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 10, letterSpacing: "0.15em", fontWeight: 700, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 10 }}>Person</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {[
                        { label: "Full Name", val: name, set: setName },
                        { label: "Role / Department", val: role, set: setRole },
                        { label: "Tagline", val: tagline, set: setTagline },
                        { label: "Organisation", val: orgName, set: setOrgName },
                      ].map(({ label, val, set }) => (
                        <div key={label}>
                          <label style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", display: "block", marginBottom: 4, fontWeight: 600 }}>{label}</label>
                          <input className="field-inp" value={val} onChange={e => set(e.target.value)} placeholder={label} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Style Tab ── */}
              {tab === "style" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: "0.15em", fontWeight: 700, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 10 }}>Color Theme</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                      {COLOR_PRESETS.map((p, i) => (
                        <button key={i} title={p.name} onClick={() => applyPreset(p)} style={{
                          aspectRatio: "1", borderRadius: 10, cursor: "pointer",
                          background: `linear-gradient(135deg, ${p.bg}, ${p.primary})`,
                          border: preset === p ? `2px solid ${p.primary}` : "2px solid rgba(255,255,255,0.06)",
                          boxShadow: preset === p ? `0 0 12px ${p.primary}55` : "none",
                          transform: preset === p ? "scale(1.1)" : "scale(1)",
                          transition: "all .15s", outline: "none",
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 8 }}>Active: {preset.name}</p>
                  </div>

                  <div>
                    <p style={{ fontSize: 10, letterSpacing: "0.15em", fontWeight: 700, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 10 }}>Custom Colors</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { label: "Primary", val: primary, set: setPrimary },
                        { label: "Secondary", val: secondary, set: setSecondary },
                        { label: "Background", val: bg, set: setBg },
                      ].map(({ label, val, set }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: val }} />
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{label}</span>
                          </div>
                          <input type="color" value={val} onChange={e => set(e.target.value)}
                            style={{ width: 28, height: 22, borderRadius: 6, border: "none", background: "none", cursor: "pointer", padding: 0 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Canvas */}
            <div style={{ ...panel, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, minHeight: 420 }}>
              <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 24px 72px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)" }}>
                <canvas ref={canvasRef} style={{ display: "block", maxWidth: "100%", maxHeight: 560, width: "auto", height: "auto" }} />
              </div>
            </div>

            {/* Downloads */}
            <div style={{ ...panel, padding: 16 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.15em", fontWeight: 700, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", marginBottom: 12 }}>Export</p>

              <button className="dl-btn" onClick={() => dl(`${slug}-award.png`, c => renderTemplate(templateId, c, opts))} style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary || primary})`, color: "#fff",
                boxShadow: `0 4px 14px ${primary}44`, marginBottom: 8,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = "none"; }}
              >
                <span>↓</span> Square Award Card (800×800)
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button className="dl-btn-secondary" onClick={() => dl(`${slug}-avatar.png`, c => renderProfilePic(c, opts))}>
                  <span>👤</span> Profile Avatar
                </button>
                <button className="dl-btn-secondary" onClick={() => dl(`${slug}-banner.png`, c => renderLandscapeCard(c, opts))}>
                  <span>🖥</span> Landscape Banner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
