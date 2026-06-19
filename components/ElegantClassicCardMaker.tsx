"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { 
  Transform, RenderOpts, AWARD_TYPES, MONTHS, WEEKS, COLOR_PRESETS,
  rrect, drawPhoto, autoFit, shade, wrapAwardText, renderProfilePic, renderLandscapeCard,
  Sec, Sep, Inp, Lbl, SlRow
} from "./TopPerformerShared";

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

function renderCard(canvas: HTMLCanvasElement, opts: RenderOpts) {
  canvas.width = 800; canvas.height = 800;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  (ctx as any).imageSmoothingQuality = "high";
  tArcMinimal(ctx, 800, 800, opts);
}

export default function ElegantClassicCardMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [imgVersion, setImgVersion] = useState(0); 
  const [tab, setTab] = useState<"info" | "style" | "photo">("info");

  // Card state
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

  useEffect(() => {
    const img = new Image();
    img.src = "/aibi_logo.png";
    img.onload = () => setLogoImg(img);
  }, []);

  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    renderCard(canvasRef.current, {
      photo: photoRef.current, logoImg, tf, name, role, awardType,
      periodLabel, tagline, orgName, primary, secondary, bg, txt,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoImg, tf, name, role, awardType, periodLabel, tagline, orgName, primary, secondary, bg, txt, imgVersion]);

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
    renderCard(tmp, {
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
    renderLandscapeCard(tmp, {
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
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "5px 16px", marginBottom: 12 }}>
            <span>🏆</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em" }}>Elegant Classic Template</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", margin: 0, background: "linear-gradient(to right, #fff 30%, #a1a1aa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Celebrate Your Star Performers
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ ...card, padding: "8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              <TabBtn id="info" label="Info" />
              <TabBtn id="style" label="Style" />
              <TabBtn id="photo" label="Photo" />
            </div>

            <div style={card}>
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

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, padding: 28 }}>
              <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 28px 80px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.05)" }}>
                <canvas ref={canvasRef} style={{ display: "block", maxWidth: "100%", maxHeight: 580, width: "auto", height: "auto" }} />
              </div>
            </div>

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
