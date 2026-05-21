"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Download,
  ImageUp,
  Palette,
  RefreshCcw,
  Type,
  UploadCloud
} from "lucide-react";
import {
  Canvas,
  Circle,
  FabricImage,
  FabricObject,
  FabricText,
  Shadow,
  Gradient,
  Group,
  Path,
  Rect,
  Textbox
} from "fabric";

type TemplateId = "aibi-purple" | "neon-blue" | "corporate-violet" | "creator-pink" | "campus-green";

type SimpleTemplate = {
  id: TemplateId;
  name: string;
  logo: string;
  subtitle: string;
  nameText: string;
  background: [string, string, string];
  circle: string;
  accent: string;
  deep: string;
};

const CANVAS_SIZE = 1080;

const simpleTemplates: SimpleTemplate[] = [
  {
    id: "aibi-purple",
    name: "AIBI Purple",
    logo: "aibi",
    subtitle: "Ai & Business\nInnovation\nCampus",
    nameText: "Your Name",
    background: ["#7c2dff", "#bf32ff", "#5a21d8"],
    circle: "#6f35f3",
    accent: "#ff56f6",
    deep: "#2f0a82"
  },
  {
    id: "neon-blue",
    name: "Neon Blue",
    logo: "nova",
    subtitle: "Future Builders\nCommunity",
    nameText: "Your Name",
    background: ["#06182f", "#1262ff", "#28d6ff"],
    circle: "#1747d7",
    accent: "#60f3ff",
    deep: "#031026"
  },
  {
    id: "corporate-violet",
    name: "Corporate Violet",
    logo: "brand",
    subtitle: "Leadership\nProgram",
    nameText: "Your Name",
    background: ["#111827", "#4c1d95", "#8b5cf6"],
    circle: "#5b21b6",
    accent: "#c4b5fd",
    deep: "#0f1024"
  },
  {
    id: "creator-pink",
    name: "Creator Pink",
    logo: "studio",
    subtitle: "Creator\nCampaign",
    nameText: "Your Name",
    background: ["#3b0764", "#db2777", "#fb7185"],
    circle: "#be185d",
    accent: "#fdf2f8",
    deep: "#2b063c"
  },
  {
    id: "campus-green",
    name: "Campus Green",
    logo: "campus",
    subtitle: "Ambassador\nTeam",
    nameText: "Your Name",
    background: ["#042f2e", "#16a34a", "#a3e635"],
    circle: "#15803d",
    accent: "#ecfccb",
    deep: "#052e16"
  }
];

const fonts = ["Inter", "Arial", "Georgia", "Impact", "Verdana"];

export function StudioEditor() {
  const searchParams = useSearchParams();
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const photoRef = useRef<FabricImage | null>(null);
  const nameRef = useRef<Textbox | null>(null);
  const logoRef = useRef<Group | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<TemplateId>(() => normalizeTemplate(searchParams.get("template")));
  const [name, setName] = useState("Your Name");
  const [font, setFont] = useState("Inter");
  const [nameColor, setNameColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#ff56f6");
  const [photoScale, setPhotoScale] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const activeTemplate = useMemo(() => simpleTemplates.find((template) => template.id === activeTemplateId) ?? simpleTemplates[0], [activeTemplateId]);

  useEffect(() => {
    if (!canvasEl.current || fabricRef.current) return;
    const canvas = new Canvas(canvasEl.current, {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      backgroundColor: "#111827",
      preserveObjectStacking: true,
      selection: false
    });
    fabricRef.current = canvas;
    applyTemplateToCanvas(canvas, activeTemplate, nameColor, font, name, photoRef, nameRef, logoRef);
    setIsReady(true);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [activeTemplate, font, name, nameColor]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !isReady) return;
    applyTemplateToCanvas(canvas, activeTemplate, nameColor, font, name, photoRef, nameRef, logoRef, photoRef.current);
    setAccentColor(activeTemplate.accent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplate, isReady]);

  useEffect(() => {
    if (!nameRef.current || !fabricRef.current) return;
    nameRef.current.set({ text: name, fontFamily: font, fill: nameColor });
    fabricRef.current.requestRenderAll();
  }, [name, font, nameColor]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !isReady) return;
    updateAccentObjects(canvas, accentColor, nameRef.current);
  }, [accentColor, isReady]);

  useEffect(() => {
    if (!photoRef.current || !fabricRef.current) return;
    photoRef.current.scale(photoScale);
    fabricRef.current.requestRenderAll();
  }, [photoScale]);

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !fabricRef.current) return;
    const url = await fileToDataUrl(file);
    const img = await FabricImage.fromURL(url);
    addPhotoToCanvas(fabricRef.current, img, photoRef, nameRef, logoRef);
  }

  function resetTemplate() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    photoRef.current = null;
    applyTemplateToCanvas(canvas, activeTemplate, nameColor, font, name, photoRef, nameRef, logoRef);
    setPhotoScale(1);
  }

  function downloadPng() {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 2, quality: 1 });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${name.trim().replace(/\s+/g, "-").toLowerCase() || "profile"}-dp.png`;
    link.click();
  }

  function chooseTemplate(template: SimpleTemplate) {
    setActiveTemplateId(template.id);
    setAccentColor(template.accent);
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,.24),transparent_28rem),#070712]">
      <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr_300px]">
        <aside className="panel rounded-2xl p-4">
          <SectionTitle icon={Palette} label="Templates" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {simpleTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => chooseTemplate(template)}
                className={`focus-ring rounded-2xl border p-2 text-left transition hover:bg-white/10 ${
                  activeTemplateId === template.id ? "border-cyanGlow bg-white/12" : "border-white/10 bg-white/[.045]"
                }`}
              >
                <div
                  className="relative aspect-[16/10] overflow-hidden rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${template.background.join(",")})` }}
                >
                  <div className="absolute inset-x-5 top-8 aspect-square rounded-full opacity-70" style={{ background: template.circle }} />
                  <div className="absolute bottom-3 left-3 text-xl font-black italic text-white">name</div>
                </div>
                <div className="mt-2 text-sm font-bold text-white">{template.name}</div>
              </button>
            ))}
          </div>

          <SectionTitle icon={UploadCloud} label="Upload" className="mt-6" />
          <label className="focus-within:ring-2 focus-within:ring-cyanGlow flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[.055] px-4 py-5 text-sm font-semibold text-white/78">
            <ImageUp size={18} />
            Upload photo
            <input className="sr-only" type="file" accept="image/*" onChange={handlePhotoUpload} />
          </label>
          <p className="mt-3 text-xs leading-5 text-white/45">Drag the uploaded photo directly on the canvas. Use the corner handles to resize.</p>
        </aside>

        <section className="flex min-h-[72vh] items-center justify-center rounded-2xl border border-white/10 bg-white/[.035] p-4 shadow-panel">
          <div className="w-full" style={{ maxWidth: "min(520px, calc(100vh - 190px))" }}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-cyanGlow">Live preview</p>
                <h1 className="mt-1 text-xl font-extrabold text-white">Simple branded DP</h1>
              </div>
              <button onClick={downloadPng} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink shadow-neon">
                <Download size={16} />
                PNG
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/12 bg-black shadow-[0_32px_120px_rgba(0,0,0,.55)]">
              <canvas ref={canvasEl} className="h-auto w-full" />
            </div>
          </div>
        </section>

        <aside className="panel rounded-2xl p-4">
          <SectionTitle icon={Type} label="Customize" />
          <div className="space-y-4">
            <Field label="Name">
              <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-white outline-none focus:border-cyanGlow" />
            </Field>
            <Field label="Font">
              <select value={font} onChange={(event) => setFont(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-white outline-none focus:border-cyanGlow">
                {fonts.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Text">
                <input type="color" value={nameColor} onChange={(event) => setNameColor(event.target.value)} className="h-12 w-full rounded-xl border border-white/10 bg-white/10 p-1" />
              </Field>
              <Field label="Glow">
                <input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-12 w-full rounded-xl border border-white/10 bg-white/10 p-1" />
              </Field>
            </div>
            <Field label={`Photo size ${Math.round(photoScale * 100)}%`}>
              <input type="range" min="0.55" max="1.6" step="0.05" value={photoScale} onChange={(event) => setPhotoScale(Number(event.target.value))} className="w-full accent-cyanGlow" />
            </Field>
            <button onClick={resetTemplate} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[.065] px-4 py-3 font-semibold text-white transition hover:bg-white/12">
              <RefreshCcw size={16} />
              Reset design
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.045] p-4 text-sm leading-6 text-white/58">
            The logo and background design are fixed by the template. Edit only the photo, name, font, colors, and position for a fast beginner-friendly workflow.
          </div>
        </aside>
      </div>
    </main>
  );
}

function applyTemplateToCanvas(
  canvas: Canvas,
  template: SimpleTemplate,
  nameColor: string,
  font: string,
  name: string,
  photoRef: React.MutableRefObject<FabricImage | null>,
  nameRef: React.MutableRefObject<Textbox | null>,
  logoRef: React.MutableRefObject<Group | null>,
  existingPhoto?: FabricImage | null
) {
  canvas.clear();
  canvas.backgroundColor = template.deep;

  const background = new Rect({
    left: 0,
    top: 0,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    selectable: false,
    evented: false,
    fill: new Gradient({
      type: "linear",
      gradientUnits: "pixels",
      coords: { x1: 0, y1: 0, x2: CANVAS_SIZE, y2: CANVAS_SIZE },
      colorStops: [
        { offset: 0, color: template.background[0] },
        { offset: 0.48, color: template.background[1] },
        { offset: 1, color: template.background[2] }
      ]
    })
  });

  const noise = Array.from({ length: 70 }, (_, index) => new Circle({
    left: (index * 83) % CANVAS_SIZE,
    top: (index * 137) % CANVAS_SIZE,
    radius: 1.4 + (index % 4),
    fill: "rgba(255,255,255,.08)",
    selectable: false,
    evented: false
  }));

  const largeCircle = new Circle({
    left: -55,
    top: 180,
    radius: 590,
    fill: template.circle,
    opacity: 0.74,
    selectable: false,
    evented: false
  });

  const innerCircle = new Circle({
    left: 178,
    top: 318,
    radius: 370,
    fill: "rgba(255,255,255,.18)",
    selectable: false,
    evented: false
  });

  const giantLetter = new FabricText("B", {
    left: 300,
    top: 355,
    fontFamily: "Impact",
    fontSize: 500,
    fill: "rgba(255,255,255,.92)",
    opacity: 0.92,
    selectable: false,
    evented: false
  });

  const keep = new FabricText("KEEP", {
    left: 325,
    top: 355,
    fontFamily: "Inter",
    fontSize: 48,
    fontStyle: "italic",
    fontWeight: 900,
    fill: "#ffffff",
    selectable: false,
    evented: false
  });

  const nameText = new Textbox(name, {
    left: 88,
    top: 675,
    width: 940,
    fontFamily: font,
    fontSize: 150,
    fontStyle: "italic",
    fontWeight: 900,
    fill: nameColor,
    textAlign: "center",
    shadow: new Shadow({ color: template.accent, blur: 0, offsetX: 8, offsetY: 8 }),
    selectable: true,
    lockScalingY: true,
    cornerColor: "#22d3ee",
    borderColor: "#22d3ee",
    transparentCorners: false
  });
  nameRef.current = nameText;

  const arrowRight = new Path("M 0 45 C 60 0 130 0 150 62 M 150 62 L 123 50 M 150 62 L 140 30", {
    left: 760,
    top: 388,
    stroke: "#ffffff",
    strokeWidth: 16,
    fill: "",
    strokeLineCap: "round",
    strokeLineJoin: "round",
    selectable: false,
    evented: false
  });

  const arrowLeft = new Path("M 95 0 C 20 72 15 160 78 214 M 78 214 L 72 178 M 78 214 L 43 206", {
    left: 105,
    top: 735,
    stroke: "#ffffff",
    strokeWidth: 14,
    fill: "",
    strokeLineCap: "round",
    strokeLineJoin: "round",
    selectable: false,
    evented: false
  });

  const logo = createLogo(template);
  logoRef.current = logo;

  const barcode = createBarcode();

  canvas.add(background, ...noise, largeCircle, innerCircle, giantLetter, keep, nameText, arrowRight, arrowLeft, logo, barcode);

  if (existingPhoto) {
    addPhotoToCanvas(canvas, existingPhoto, photoRef, nameRef, logoRef);
  } else {
    const placeholder = new Circle({
      left: 325,
      top: 450,
      radius: 225,
      fill: "rgba(255,255,255,.16)",
      stroke: "rgba(255,255,255,.45)",
      strokeWidth: 3,
      selectable: false,
      evented: false
    });
    const prompt = new FabricText("Upload photo", {
      left: 418,
      top: 662,
      fontFamily: "Inter",
      fontSize: 28,
      fontWeight: 800,
      fill: "rgba(255,255,255,.75)",
      selectable: false,
      evented: false
    });
    canvas.add(placeholder, prompt);
  }

  canvas.requestRenderAll();
}

function addPhotoToCanvas(
  canvas: Canvas,
  img: FabricImage,
  photoRef: React.MutableRefObject<FabricImage | null>,
  nameRef: React.MutableRefObject<Textbox | null>,
  logoRef: React.MutableRefObject<Group | null>
) {
  photoRef.current = img;
  img.set({
    left: 275,
    top: 350,
    originX: "left",
    originY: "top",
    selectable: true,
    cornerColor: "#22d3ee",
    borderColor: "#22d3ee",
    transparentCorners: false,
    shadow: new Shadow({ color: "rgba(0,0,0,.35)", blur: 70, offsetX: 0, offsetY: 24 })
  });

  const scale = Math.max(520 / (img.width || 1), 620 / (img.height || 1));
  img.scale(scale);

  const oldPhoto = canvas.getObjects().find((item) => item.get("name") === "profile-photo");
  if (oldPhoto) canvas.remove(oldPhoto);

  img.set("name", "profile-photo");
  canvas.add(img);
  canvas.bringObjectForward(img);
  if (nameRef.current) canvas.bringObjectToFront(nameRef.current);
  if (logoRef.current) canvas.bringObjectToFront(logoRef.current);
  canvas.setActiveObject(img);
  canvas.requestRenderAll();
}

function createLogo(template: SimpleTemplate) {
  const word = new FabricText(template.logo, {
    left: 0,
    top: 0,
    fontFamily: "Inter",
    fontSize: 92,
    fontWeight: 900,
    fill: "#ffffff"
  });
  const subtitle = new Textbox(template.subtitle, {
    left: 178,
    top: 25,
    width: 250,
    fontFamily: "Inter",
    fontSize: 29,
    fontWeight: 700,
    fill: "#ffffff",
    lineHeight: 1.05
  });
  return new Group([word, subtitle], {
    left: 365,
    top: 95,
    selectable: false,
    evented: false
  });
}

function createBarcode() {
  const bars = Array.from({ length: 24 }, (_, index) => new Rect({
    left: index * 8,
    top: 0,
    width: index % 3 === 0 ? 5 : 3,
    height: 64,
    fill: "#ffffff"
  }));
  return new Group(bars, {
    left: 80,
    top: 960,
    selectable: false,
    evented: false
  });
}

function updateAccentObjects(canvas: Canvas, color: string, nameObject: Textbox | null) {
  canvas.getObjects().forEach((item: FabricObject) => {
    if (item.type === "textbox" && item === nameObject) {
      item.set("shadow", new Shadow({ color, blur: 0, offsetX: 8, offsetY: 8 }));
    }
  });
  canvas.requestRenderAll();
}

function normalizeTemplate(value: string | null): TemplateId {
  return simpleTemplates.some((template) => template.id === value) ? (value as TemplateId) : "aibi-purple";
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function SectionTitle({ icon: Icon, label, className = "" }: { icon: typeof Palette; label: string; className?: string }) {
  return (
    <div className={`mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[.16em] text-white/55 ${className}`}>
      <Icon size={16} className="text-cyanGlow" />
      {label}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[.16em] text-white/45">{label}</span>
      {children}
    </label>
  );
}
