"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Download,
  FileSpreadsheet,
  Printer,
  Plus,
  Trash2,
  Receipt,
  ArrowRight,
  Copy,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

interface SavedItem {
  id: string;
  description: string;
  unitPrice: number;
}

interface AddressBlock {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface ReceiptData {
  receiptNumber: string;
  date: string;
  billTo: AddressBlock;
  shipTo: AddressBlock;
  items: LineItem[];
  discount: number;
  taxIncluded: boolean;
  shipping: number;
  remarks: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatINR(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${d.getFullYear()}`;
}

/** Read current counter without incrementing */
async function currentReceiptNumber(): Promise<string> {
  if (typeof window === "undefined") return "REC/DIG/001";
  try {
    const res = await fetch("/api/receipt-number");
    if (!res.ok) throw new Error();
    const json = await res.json();
    return json.receiptNumber;
  } catch (err) {
    const stored = localStorage.getItem("receipt_counter");
    const num = stored ? parseInt(stored, 10) : 713;
    return `REC/DIG/${String(num).padStart(3, "0")}`;
  }
}

/** Increment counter and return new number */
async function nextReceiptNumber(currentNumber?: string): Promise<string> {
  if (typeof window === "undefined") return "REC/DIG/001";
  try {
    const res = await fetch("/api/receipt-number", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentNumber })
    });
    if (!res.ok) throw new Error();
    const json = await res.json();
    return json.receiptNumber;
  } catch (err) {
    let num = 714;
    let prefix = "REC/DIG/";
    let padLength = 3;

    if (currentNumber) {
      const match = currentNumber.match(/^(.*?)(\d+)$/);
      if (match) {
        prefix = match[1];
        const numStr = match[2];
        padLength = numStr.length;
        num = parseInt(numStr, 10) + 1;
      } else {
        const stored = localStorage.getItem("receipt_counter");
        num = stored ? parseInt(stored, 10) + 1 : 714;
      }
    } else {
      const stored = localStorage.getItem("receipt_counter");
      num = stored ? parseInt(stored, 10) + 1 : 714;
    }

    localStorage.setItem("receipt_counter", String(num));
    return `${prefix}${String(num).padStart(padLength, "0")}`;
  }
}

const EMPTY_ADDRESS: AddressBlock = { name: "", phone: "", email: "", address: "" };
const DEFAULT_ITEMS: LineItem[] = [
  { id: uid(), description: "", qty: 1, unitPrice: 0 },
];

// ─── Saved Items Library ──────────────────────────────────────────────────────
const PRESET_SAVED_ITEMS: SavedItem[] = [
  { id: "p1", description: "Digital Marketing Course", unitPrice: 15000 },
  { id: "p2", description: "AI & ML Bootcamp", unitPrice: 25000 },
  { id: "p3", description: "Business Innovation Workshop", unitPrice: 8000 },
  { id: "p4", description: "One-on-One Mentorship Session", unitPrice: 3500 },
  { id: "p5", description: "Campus Registration Fee", unitPrice: 1000 },
  { id: "p6", description: "Certificate Program – Full Stack", unitPrice: 35000 },
  { id: "p7", description: "Study Material & Resources", unitPrice: 2500 },
  { id: "p8", description: "Placement Assistance Package", unitPrice: 5000 },
];

const LS_SAVED_KEY = "receipt_saved_items";

function loadSavedItems(): SavedItem[] {
  if (typeof window === "undefined") return PRESET_SAVED_ITEMS;
  try {
    const raw = localStorage.getItem(LS_SAVED_KEY);
    if (raw) return JSON.parse(raw) as SavedItem[];
    localStorage.setItem(LS_SAVED_KEY, JSON.stringify(PRESET_SAVED_ITEMS));
    return PRESET_SAVED_ITEMS;
  } catch {
    return PRESET_SAVED_ITEMS;
  }
}

function persistSavedItems(items: SavedItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_SAVED_KEY, JSON.stringify(items));
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ReceiptGenerator() {
  const [data, setData] = useState<ReceiptData>({
    receiptNumber: "REC/DIG/713",
    date: todayStr(),
    billTo: { ...EMPTY_ADDRESS },
    shipTo: { ...EMPTY_ADDRESS },
    items: DEFAULT_ITEMS,
    discount: 0,
    taxIncluded: true,
    shipping: 0,
    remarks: "",
  });

  const [initialized, setInitialized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [xlsxLoading, setXlsxLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Pre-load libraries so clicks are instant
  useEffect(() => {
    import("html2canvas");
    import("jspdf");
    import("xlsx");
  }, []);

  // ── Saved items library state ────────────────────────────────────────
  const [savedItems, setSavedItems] = useState<SavedItem[]>(PRESET_SAVED_ITEMS);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // Initialize receipt number + saved items from localStorage on first mount
  React.useEffect(() => {
    if (!initialized) {
      currentReceiptNumber().then((num) => {
        setData((d) => ({ ...d, receiptNumber: num }));
      });
      setSavedItems(loadSavedItems());
      setInitialized(true);
    }
  }, [initialized]);

  // ── Derived Totals ────────────────────────────────────────────────────────
  const subtotal = data.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const discountAmt = data.discount;
  const subtotalLessDiscount = subtotal - discountAmt;
  const total = subtotalLessDiscount + data.shipping;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const set = useCallback(
    <K extends keyof ReceiptData>(key: K, val: ReceiptData[K]) =>
      setData((d) => ({ ...d, [key]: val })),
    []
  );

  const setBillTo = (field: keyof AddressBlock, val: string) =>
    setData((d) => ({ ...d, billTo: { ...d.billTo, [field]: val } }));

  const setShipTo = (field: keyof AddressBlock, val: string) =>
    setData((d) => ({ ...d, shipTo: { ...d.shipTo, [field]: val } }));

  /** Copy Bill To → Ship To */
  const copyBillToShip = () => {
    setData((d) => ({ ...d, shipTo: { ...d.billTo } }));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // ── Saved-items handlers ────────────────────────────────────────────────────
  /** Insert a saved item as a new line in the receipt */
  const addFromLibrary = useCallback((s: SavedItem) => {
    setData((d) => ({
      ...d,
      items: [
        ...d.items,
        { id: uid(), description: s.description, qty: 1, unitPrice: s.unitPrice },
      ],
    }));
  }, []);

  /** Save a line-item row into the library */
  const saveRowToLibrary = useCallback((item: LineItem) => {
    if (!item.description.trim()) return;
    setSavedItems((prev) => {
      const already = prev.some(
        (s) => s.description.toLowerCase() === item.description.toLowerCase()
      );
      if (already) return prev;
      const next = [
        ...prev,
        { id: uid(), description: item.description, unitPrice: item.unitPrice },
      ];
      persistSavedItems(next);
      return next;
    });
    setSavedFlash(item.id);
    setTimeout(() => setSavedFlash(null), 1500);
  }, []);

  /** Add a brand-new item to the library from the inline form */
  const addNewToLibrary = () => {
    const desc = newDesc.trim();
    const price = parseFloat(newPrice) || 0;
    if (!desc) return;
    setSavedItems((prev) => {
      const next = [...prev, { id: uid(), description: desc, unitPrice: price }];
      persistSavedItems(next);
      return next;
    });
    setNewDesc("");
    setNewPrice("");
    setShowAddForm(false);
  };

  /** Remove an item from the library */
  const removeFromLibrary = (id: string) => {
    setSavedItems((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persistSavedItems(next);
      return next;
    });
  };

  const addItem = () =>
    setData((d) => ({
      ...d,
      items: [
        ...d.items,
        { id: uid(), description: "", qty: 1, unitPrice: 0 },
      ],
    }));

  const removeItem = (id: string) =>
    setData((d) => ({
      ...d,
      items: d.items.filter((i) => i.id !== id),
    }));

  const updateItem = (
    id: string,
    field: keyof Omit<LineItem, "id">,
    val: string | number
  ) =>
    setData((d) => ({
      ...d,
      items: d.items.map((i) => (i.id === id ? { ...i, [field]: val } : i)),
    }));

  const newReceipt = async () => {
    const next = await nextReceiptNumber(data.receiptNumber);
    setData({
      receiptNumber: next,
      date: todayStr(),
      billTo: { ...EMPTY_ADDRESS },
      shipTo: { ...EMPTY_ADDRESS },
      items: [{ id: uid(), description: "", qty: 1, unitPrice: 0 }],
      discount: 0,
      taxIncluded: true,
      shipping: 0,
      remarks: "",
    });
  };

  // ── PDF Download (High Quality Native Selectable Vector PDF) ──────────────
  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const W = doc.internal.pageSize.getWidth();

      // 1. Top accent bar
      doc.setFillColor(13, 27, 77); // #0D1B4D
      doc.rect(0, 0, W, 8, "F");

      // 2. Logo image (placed right aligned, optimized/compressed to reduce PDF size)
      try {
        const img = new window.Image();
        img.src = "/Aibi_Primary Logo_Gradient.png";
        await new Promise((res) => { img.onload = res; });
        const maxCanvasWidth = 400;
        const scale = Math.min(1, maxCanvasWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        const logoW = 48; // width in mm
        const logoH = (img.height / img.width) * logoW;
        doc.addImage(dataUrl, "PNG", W - 14 - logoW, 14, logoW, logoH);
      } catch (_) { }

      // 3. "RECEIPT" title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 27, 77); // #0D1B4D
      doc.text("RECEIPT", 14, 25);

      // 4. Company info
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 17, 17); // #111
      doc.text("INFERA AIBI CAMPUS PVT LTD", 14, 36);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(102, 102, 102); // #666
      doc.text("Edappally, Kochi, Ernakulam", 14, 41);
      doc.text("Kerala 682024", 14, 45);
      doc.text("+91 9746067949", 14, 49);

      doc.setTextColor(37, 99, 235); // #2563eb
      doc.text("hr@aibicampus.com", 14, 53);

      // 5. Date & receipt number (right-aligned)
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(204, 0, 0); // #c00
      doc.text(data.date, W - 14, 36, { align: "right" });

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(136, 136, 136); // #888
      doc.text("Receipt No.", W - 14, 42, { align: "right" });

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 27, 77); // #0D1B4D
      doc.text(data.receiptNumber, W - 14, 47, { align: "right" });

      // 6. Divider line
      doc.setDrawColor(233, 234, 239);
      doc.setLineWidth(0.3);
      doc.line(14, 56, W - 14, 56);

      // 7. Bill To / Ship To headings and lines
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 27, 77);
      doc.text("BILL TO", 14, 63);
      doc.text("SHIP TO", W / 2 + 3, 63);

      doc.setDrawColor(13, 27, 77);
      doc.setLineWidth(0.4);
      doc.line(14, 64.5, W / 2 - 5, 64.5);
      doc.line(W / 2 + 3, 64.5, W - 14, 64.5);

      // Helper to render address blocks
      const renderAddr = (block: AddressBlock, x: number, startY: number) => {
        let y = startY;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(17, 17, 17);
        doc.text(block.name || "—", x, y);
        y += 4.5;

        doc.setFont("helvetica", "normal");
        if (block.phone) {
          doc.setTextColor(37, 99, 235); // Blue
          doc.text(block.phone, x, y);
          y += 4.5;
        }
        if (block.email) {
          doc.setTextColor(85, 85, 85); // Grey
          doc.text(block.email, x, y);
          y += 4.5;
        }
        if (block.address) {
          doc.setTextColor(119, 119, 119); // Light Grey
          const splitAddr = doc.splitTextToSize(block.address, 80);
          doc.text(splitAddr, x, y);
        }
      };

      renderAddr(data.billTo, 14, 69);
      renderAddr(data.shipTo, W / 2 + 3, 69);

      // 8. Line Items Table (with autotable)
      const tableRows = data.items.map((i) => [
        i.description || "",
        String(i.qty),
        `Rs. ${formatINR(i.unitPrice)}`,
        `Rs. ${formatINR(i.qty * i.unitPrice)}`,
      ]);

      autoTable(doc, {
        startY: 92,
        head: [["DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"]],
        body: tableRows,
        theme: "grid",
        styles: {
          lineColor: [234, 235, 240],
          lineWidth: 0.15,
          cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
          fontSize: 8,
          font: "helvetica",
          textColor: [50, 50, 50],
        },
        headStyles: {
          fillColor: [13, 27, 77],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7.5,
        },
        columnStyles: {
          0: { halign: "left", cellWidth: 100 },
          1: { halign: "right", cellWidth: 20 },
          2: { halign: "right", cellWidth: 32 },
          3: { halign: "right", cellWidth: 30 },
        },
        alternateRowStyles: { fillColor: [247, 247, 252] },
        margin: { left: 14, right: 14 },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 8;

      // 9. Totals Section (right-aligned)
      const totalsList: [string, string][] = [
        ["SUBTOTAL", `Rs. ${formatINR(subtotal)}`],
        ["DISCOUNT", `- Rs. ${formatINR(discountAmt)}`],
        ["SUBTOTAL LESS DISCOUNT", `Rs. ${formatINR(subtotalLessDiscount)}`],
        ["TAX RATE", data.taxIncluded ? "Included" : "0%"],
        ["TOTAL TAX", data.taxIncluded ? "Included" : "Rs. 0.00"],
        ["SHIPPING/HANDLING", `Rs. ${formatINR(data.shipping)}`],
      ];

      let ty = finalY;
      doc.setFontSize(8);
      totalsList.forEach(([label, val]) => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(102, 102, 102); // #666
        doc.text(label, W - 72, ty);

        doc.setFont("helvetica", label.includes("LESS") ? "bold" : "normal");
        doc.setTextColor(34, 34, 34); // #222
        doc.text(val, W - 14, ty, { align: "right" });

        doc.setDrawColor(234, 235, 240);
        doc.setLineWidth(0.15);
        doc.line(W - 72, ty + 1.5, W - 14, ty + 1.5);

        ty += 5.5;
      });

      // 10. Paid Box (centered text alignment)
      doc.setFillColor(13, 27, 77); // Navy blue: #0D1B4D
      doc.roundedRect(W - 72, ty + 1.5, 58, 10, 1.5, 1.5, "F");

      // "PAID" tag
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(180, 185, 205); // white opacity
      doc.text("Paid", W - 67, ty + 8.2);

      // Amount
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text(`Rs. ${formatINR(total)}`, W - 19, ty + 8.2, { align: "right" });

      // 11. Remarks / Notes
      if (data.remarks) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(153, 153, 153); // #aaa
        const splitRemarks = doc.splitTextToSize(data.remarks, 100);
        doc.text(splitRemarks, 14, finalY + 2);
      }

      // 12. Footer
      const footerY = doc.internal.pageSize.getHeight() - 16;
      doc.setFillColor(0, 180, 216); // light blue line: #00b4d8
      doc.rect(0, footerY - 2, W, 1, "F");
      doc.setFillColor(13, 27, 77); // dark blue background: #0D1B4D
      doc.rect(0, footerY - 1, W, 17, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(
        "Note : This is a computer-generated receipt and does not require a physical signature.",
        W / 2,
        footerY + 6,
        { align: "center" }
      );

      doc.save(`${data.receiptNumber.replace(/\//g, "-")}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Excel/Sheet Download ──────────────────────────────────────────────────
  const downloadSheet = async () => {
    setXlsxLoading(true);
    const XLSX = await import("xlsx");
    const ws_data: (string | number)[][] = [
      ["RECEIPT"],
      [],
      ["INFERA AIBI CAMPUS PVT LTD", "", "", "", "Date:", data.date],
      [
        "Edappally, Kochi, Ernakulam",
        "",
        "",
        "",
        "Receipt No.:",
        data.receiptNumber,
      ],
      ["Kerala 682024"],
      ["+91 9746067949"],
      ["hr@aibicampus.com"],
      [],
      ["BILL TO", "", "SHIP TO"],
      [data.billTo.name, "", data.shipTo.name],
      [data.billTo.phone, "", data.shipTo.phone],
      [data.billTo.email, "", data.shipTo.email],
      [data.billTo.address, "", data.shipTo.address],
      [],
      ["DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"],
      ...data.items.map((i) => [i.description, i.qty, i.unitPrice, i.qty * i.unitPrice]),
      [],
      ["", "", "SUBTOTAL", subtotal],
      ["", "", "DISCOUNT", discountAmt],
      ["", "", "SUBTOTAL LESS DISCOUNT", subtotalLessDiscount],
      ["", "", "TAX", data.taxIncluded ? "INCLUDED" : 0],
      ["", "", "SHIPPING/HANDLING", data.shipping],
      ["", "", "PAID TOTAL (₹)", total],
      [],
      ["Remarks:", data.remarks],
      [],
      ["Note: This is a computer-generated receipt."],
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws["!cols"] = [
      { wch: 42 },
      { wch: 8 },
      { wch: 18 },
      { wch: 16 },
      { wch: 14 },
      { wch: 20 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipt");
    XLSX.writeFile(wb, `${data.receiptNumber.replace(/\//g, "-")}.xlsx`);
    setXlsxLoading(false);
  };

  const handlePrint = () => window.print();

  // ── Shared input className ────────────────────────────────────────────────
  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-violet-400/60 focus:outline-none transition";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* ── Page heading ─────────────────────────────────────────────── */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-fuchsia-400">
              Document Generator
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold text-white">
              Receipt Generator
            </h1>
            <p className="mt-0.5 text-sm text-white/40">
              Fill in the details below, then download as PDF or Excel.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={newReceipt}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <Receipt size={13} />
              New Receipt
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-500/10 px-3.5 py-2 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20"
            >
              <Printer size={13} />
              Print
            </button>
            <button
              onClick={downloadSheet}
              disabled={xlsxLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-60"
            >
              <FileSpreadsheet size={13} />
              {xlsxLoading ? "Generating…" : "Excel"}
            </button>
            <button
              onClick={downloadPDF}
              disabled={pdfLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-bold text-white shadow-[0_4px_18px_rgba(139,92,246,0.4)] transition hover:scale-[1.02] disabled:opacity-60 disabled:cursor-wait"
            >
              <Download size={13} />
              {pdfLoading ? "Capturing…" : "Download PDF"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
          {/* ── LEFT: Form ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Receipt Info */}
            <div className="glass rounded-2xl p-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">
                Receipt Info
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-white/40">
                    Receipt No.
                  </label>
                  <input
                    value={data.receiptNumber}
                    onChange={(e) => set("receiptNumber", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-white/40">
                    Date
                  </label>
                  <input
                    value={data.date}
                    onChange={(e) => set("date", e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="glass rounded-2xl p-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">
                Bill To
              </h2>
              <div className="flex flex-col gap-2">
                {(
                  [
                    { field: "name" as const, placeholder: "Full name" },
                    { field: "phone" as const, placeholder: "+91 XXXXXXXXXX" },
                    { field: "email" as const, placeholder: "email@example.com" },
                    { field: "address" as const, placeholder: "Address" },
                  ] as const
                ).map(({ field, placeholder }) => (
                  <input
                    key={field}
                    value={data.billTo[field]}
                    onChange={(e) => setBillTo(field, e.target.value)}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                ))}
              </div>
            </div>

            {/* Ship To */}
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-white/50">
                  Ship To
                </h2>
                <button
                  onClick={copyBillToShip}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${copied
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "border border-violet-400/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
                    }`}
                >
                  <Copy size={11} />
                  {copied ? "Copied!" : "Copy from Bill To"}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {(
                  [
                    { field: "name" as const, placeholder: "Full name" },
                    { field: "phone" as const, placeholder: "+91 XXXXXXXXXX" },
                    { field: "email" as const, placeholder: "email@example.com" },
                    { field: "address" as const, placeholder: "Address" },
                  ] as const
                ).map(({ field, placeholder }) => (
                  <input
                    key={field}
                    value={data.shipTo[field]}
                    onChange={(e) => setShipTo(field, e.target.value)}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                ))}
              </div>
            </div>

            {/* Line Items */}
            <div className="glass rounded-2xl p-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">
                Line Items
              </h2>

              {/* ── Saved Items Library ─────────────────────────────────── */}
              <div className="mb-4 overflow-hidden rounded-xl border border-white/8 bg-white/3">
                {/* Toggle header */}
                <button
                  onClick={() => setLibraryOpen((o) => !o)}
                  className="flex w-full items-center justify-between px-3.5 py-2.5 text-left transition hover:bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <Bookmark size={12} className="text-violet-400" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                      Saved Items Library
                    </span>
                    <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-bold text-violet-300">
                      {savedItems.length}
                    </span>
                  </div>
                  {libraryOpen ? (
                    <ChevronUp size={12} className="text-white/25" />
                  ) : (
                    <ChevronDown size={12} className="text-white/25" />
                  )}
                </button>

                {libraryOpen && (
                  <div className="border-t border-white/8 px-3.5 pb-3.5 pt-2.5">
                    {/* Quick-add chips */}
                    {savedItems.length === 0 ? (
                      <p className="py-2 text-center text-[11px] italic text-white/25">
                        No saved items yet — use the bookmark icon on any row to save it.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {savedItems.map((s) => (
                          <div
                            key={s.id}
                            className="group flex items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 transition hover:border-violet-400/40 hover:bg-violet-500/10"
                          >
                            <button
                              onClick={() => addFromLibrary(s)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5"
                              title={`Add to receipt — ₹${formatINR(s.unitPrice)}`}
                            >
                              <span className="max-w-[150px] truncate text-[11px] font-medium text-white/65">
                                {s.description}
                              </span>
                              <span className="shrink-0 text-[10px] font-bold text-emerald-400">
                                ₹{formatINR(s.unitPrice)}
                              </span>
                            </button>
                            <button
                              onClick={() => removeFromLibrary(s.id)}
                              title="Remove from library"
                              className="hidden h-full items-center pr-1.5 text-white/20 hover:text-red-400 group-hover:flex"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add to library form */}
                    {showAddForm ? (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <input
                          autoFocus
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addNewToLibrary()}
                          placeholder="Description"
                          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] text-white placeholder-white/25 focus:border-violet-400/60 focus:outline-none"
                        />
                        <input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addNewToLibrary()}
                          placeholder="₹ Price"
                          className="w-20 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-right text-[11px] text-white placeholder-white/25 focus:border-violet-400/60 focus:outline-none"
                        />
                        <button
                          onClick={addNewToLibrary}
                          className="rounded-lg bg-violet-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-violet-500"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setShowAddForm(false); setNewDesc(""); setNewPrice(""); }}
                          className="rounded-lg px-2 py-1.5 text-[11px] text-white/30 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] text-violet-400/60 hover:text-violet-300"
                      >
                        <Plus size={11} />
                        Add new item to library
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ── Active line items ────────────────────────────────────── */}
              <div className="mb-2 grid grid-cols-[1fr_50px_86px_70px_26px_26px] gap-2 text-[10px] font-bold uppercase text-white/30">
                <span>Description</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Unit Price</span>
                <span className="text-right">Total</span>
                <span title="Save to library" className="text-center">
                  <Bookmark size={10} className="mx-auto opacity-50" />
                </span>
                <span />
              </div>

              <div className="flex flex-col gap-2">
                {data.items.map((item) => {
                  const rowTotal = item.qty * item.unitPrice;
                  const isSaved = savedItems.some(
                    (s) =>
                      s.description.toLowerCase() === item.description.toLowerCase()
                  );
                  const isFlashing = savedFlash === item.id;
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_50px_86px_70px_26px_26px] items-center gap-2"
                    >
                      <input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        placeholder="Item description…"
                        className={inputCls}
                      />
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(item.id, "qty", parseFloat(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center text-sm text-white focus:border-violet-400/60 focus:outline-none transition"
                      />
                      <input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-right text-sm text-white focus:border-violet-400/60 focus:outline-none transition"
                      />
                      <span className="text-right text-xs font-semibold text-emerald-300">
                        {formatINR(rowTotal)}
                      </span>
                      {/* Save to library */}
                      <button
                        onClick={() => saveRowToLibrary(item)}
                        disabled={!item.description.trim() || isSaved}
                        title={isSaved ? "Already in library" : "Save to library"}
                        className={`grid h-6 w-6 place-items-center rounded-md transition ${isFlashing
                          ? "bg-emerald-500/25 text-emerald-300"
                          : isSaved
                            ? "cursor-default text-violet-400/40"
                            : "text-white/20 hover:bg-violet-500/20 hover:text-violet-300 disabled:opacity-20"
                          }`}
                      >
                        {isFlashing || isSaved ? (
                          <BookmarkCheck size={12} />
                        ) : (
                          <Bookmark size={12} />
                        )}
                      </button>
                      {/* Delete row */}
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={data.items.length === 1}
                        className="grid h-6 w-6 place-items-center rounded-md text-white/20 transition hover:bg-red-500/20 hover:text-red-400 disabled:opacity-20"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={addItem}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-white/15 px-3 py-1.5 text-xs text-white/35 transition hover:border-violet-400/50 hover:text-violet-300"
              >
                <Plus size={12} />
                Add blank item
              </button>
            </div>


            {/* Charges & Notes */}
            <div className="glass rounded-2xl p-5">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">
                Charges &amp; Notes
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-white/40">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={data.discount}
                    onChange={(e) => set("discount", parseFloat(e.target.value) || 0)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-white/40">
                    Shipping / Handling (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={data.shipping}
                    onChange={(e) => set("shipping", parseFloat(e.target.value) || 0)}
                    className={inputCls}
                  />
                </div>
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-white/50">
                <input
                  type="checkbox"
                  checked={data.taxIncluded}
                  onChange={(e) => set("taxIncluded", e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-violet-500"
                />
                Tax included in price
              </label>
              <div className="mt-3">
                <label className="mb-1 block text-[11px] font-semibold text-white/40">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={data.remarks}
                  onChange={(e) => set("remarks", e.target.value)}
                  placeholder="Any notes or remarks…"
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-violet-400/60 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Preview ──────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-white/25">
              Live Preview
            </p>

            {/* Receipt card */}
            <div
              ref={printRef}
              id="receipt-preview"
              className="receipt-print-area overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            >
              {/* Top accent bar */}
              <div style={{ background: "#0D1B4D", height: 8 }} />

              {/* Header: RECEIPT title + Logo */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "20px 24px 10px",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "#0D1B4D",
                    letterSpacing: 4,
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  RECEIPT
                </div>
                {/* Real logo */}
                <img
                  src="/Aibi_Primary Logo_Gradient.png"
                  alt="Aibi Campus Logo"
                  style={{
                    width: "130px",
                    height: "52px",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Company info + date/receipt# */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "0 24px 14px",
                  borderBottom: "1px solid #e9eaef",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 10.5, color: "#111" }}>
                    INFERA AIBI CAMPUS PVT LTD
                  </div>
                  <div style={{ fontSize: 9, color: "#666", marginTop: 2, lineHeight: 1.6 }}>
                    Edappally, Kochi, Ernakulam<br />
                    Kerala 682024<br />
                    +91 9746067949
                  </div>
                  <div style={{ fontSize: 9, color: "#2563eb" }}>hr@aibicampus.com</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: "#c00", fontWeight: 700 }}>
                    {data.date}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 8, color: "#888" }}>
                    Receipt No.
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#0D1B4D" }}>
                    {data.receiptNumber}
                  </div>
                </div>
              </div>

              {/* Bill To / Ship To */}
              <div
                style={{
                  display: "flex",
                  padding: "12px 24px",
                  gap: 16,
                  borderBottom: "1px solid #e9eaef",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {(["billTo", "shipTo"] as const).map((k) => (
                  <div key={k} style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 7.5,
                        fontWeight: 800,
                        color: "#0D1B4D",
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        borderBottom: "1.5px solid #0D1B4D",
                        paddingBottom: 3,
                        marginBottom: 5,
                      }}
                    >
                      {k === "billTo" ? "Bill To" : "Ship To"}
                    </div>
                    <div style={{ fontSize: 9.5, lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 700, color: "#111" }}>
                        {data[k].name || <span style={{ color: "#ccc" }}>—</span>}
                      </div>
                      {data[k].phone && (
                        <div style={{ color: "#2563eb" }}>{data[k].phone}</div>
                      )}
                      {data[k].email && (
                        <div style={{ color: "#555" }}>{data[k].email}</div>
                      )}
                      {data[k].address && (
                        <div style={{ color: "#777" }}>{data[k].address}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Items table */}
              <div style={{ padding: "0 24px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontFamily: "Arial, sans-serif",
                    fontSize: 8.5,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#0D1B4D", color: "#fff" }}>
                      {["DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "6px 8px",
                            textAlign: h === "DESCRIPTION" ? "left" : "right",
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            fontSize: 8,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{
                          background: idx % 2 === 0 ? "#fff" : "#f7f7fc",
                          borderBottom: "1px solid #eaebf0",
                        }}
                      >
                        <td style={{ padding: "5px 8px", color: "#1a1a1a" }}>
                          {item.description || ""}
                        </td>
                        <td style={{ padding: "5px 8px", textAlign: "right", color: "#555" }}>
                          {item.qty}
                        </td>
                        <td style={{ padding: "5px 8px", textAlign: "right", color: "#555" }}>
                          ₹ {formatINR(item.unitPrice)}
                        </td>
                        <td style={{ padding: "5px 8px", textAlign: "right", color: "#111", fontWeight: 600 }}>
                          ₹ {formatINR(item.qty * item.unitPrice)}
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>

              {/* Totals + Remarks row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  padding: "12px 24px 6px",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {/* Remarks */}
                <div
                  style={{
                    fontSize: 8,
                    color: "#aaa",
                    maxWidth: 160,
                    fontStyle: "italic",
                    lineHeight: 1.5,
                  }}
                >
                  {data.remarks}
                </div>

                {/* Totals */}
                <div style={{ minWidth: 210 }}>
                  {[
                    ["SUBTOTAL", `Rs. ${formatINR(subtotal)}`],
                    ["DISCOUNT", `- Rs. ${formatINR(discountAmt)}`],
                    ["SUBTOTAL LESS DISCOUNT", `Rs. ${formatINR(subtotalLessDiscount)}`],
                    ["TAX RATE", data.taxIncluded ? "Included" : "0%"],
                    ["TOTAL TAX", data.taxIncluded ? "Included" : "Rs. 0.00"],
                    ["SHIPPING/HANDLING", `Rs. ${formatINR(data.shipping)}`],
                  ].map(([lbl, val]) => (
                    <div
                      key={lbl}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #eaebf0",
                        padding: "2.5px 0",
                        fontSize: 8.5,
                        color: "#666",
                      }}
                    >
                      <span style={{ fontWeight: lbl.includes("LESS") ? 600 : 400 }}>{lbl}</span>
                      <span style={{ color: "#222", fontWeight: 500 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paid total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  padding: "8px 24px 14px",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                <div
                  style={{
                    background: "#0D1B4D",
                    borderRadius: 8,
                    padding: "7px 16px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    minWidth: 210,
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: 1 }}>
                    Paid
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>
                    Rs. {formatINR(total)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  background: "#0D1B4D",
                  borderTop: "3px solid #00b4d8",
                  padding: "8px 24px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 7.5,
                    color: "rgba(255,255,255,0.65)",
                    textAlign: "center",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  Note : This is a computer-generated receipt and does not require a physical signature.
                </p>
              </div>
            </div>

            {/* Action buttons below preview */}
            <div className="mt-4 flex justify-center gap-2.5">
              <button
                onClick={downloadPDF}
                disabled={pdfLoading}
                className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-xs font-bold text-white shadow-[0_4px_18px_rgba(139,92,246,0.35)] transition hover:scale-[1.02] disabled:opacity-60 disabled:cursor-wait"
              >
                <Download size={13} />
                {pdfLoading ? "Capturing…" : "PDF"}
                <ArrowRight
                  size={11}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
              <button
                onClick={downloadSheet}
                disabled={xlsxLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-60"
              >
                <FileSpreadsheet size={13} />
                {xlsxLoading ? "Generating…" : "Excel"}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-500/10 px-5 py-2.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20"
              >
                <Printer size={13} />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .receipt-print-area { display: block !important; }
          #receipt-preview {
            display: block !important;
            position: fixed;
            top: 0; left: 0;
            width: 100vw;
            box-shadow: none;
            border-radius: 0;
          }
        }
      `}</style>
    </AppShell>
  );
}
