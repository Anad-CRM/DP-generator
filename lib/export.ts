import { toJpeg, toPng } from "html-to-image";

export async function exportNode(node: HTMLElement, format: "png" | "jpg") {
  const options = {
    cacheBust: true,
    pixelRatio: 2.5,
    backgroundColor: "#080711"
  };
  return format === "png" ? toPng(node, options) : toJpeg(node, { ...options, quality: .96 });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
