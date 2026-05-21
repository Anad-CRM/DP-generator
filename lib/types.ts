export type CanvasSize = "square" | "portrait" | "banner";

export type LayerKind = "text" | "image" | "shape" | "ring" | "qr";

export type StudioLayer = {
  id: string;
  kind: LayerKind;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked?: boolean;
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  color?: string;
  align?: "left" | "center" | "right";
  src?: string;
  fit?: "cover" | "contain";
  radius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  shadow?: string;
  glow?: boolean;
  shape?: "circle" | "rect" | "arrow" | "star";
};

export type StudioTemplate = {
  id: string;
  name: string;
  category: string;
  background: string;
  accent: string;
  secondary: string;
  logoText: string;
  posterText: string;
  layers: StudioLayer[];
};

export type StudioProject = {
  id: string;
  name: string;
  updatedAt: string;
  templateId: string;
  background: string;
  accent: string;
  size: CanvasSize;
  layers: StudioLayer[];
};
