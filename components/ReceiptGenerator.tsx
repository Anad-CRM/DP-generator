"use client";

import React, { useState, useRef, useCallback } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Download,
  FileSpreadsheet,
  Printer,
  Plus,
  Trash2,
  Receipt,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

interface ReceiptData {
  receiptNumber: string;
  date: string;
  billTo: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  shipTo: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
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
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

// Load persisted receipt counter from localStorage
function getNextReceiptNumber(): string {
  if (typeof window === "undefined") return "REC/DIG/712";
  const stored = localStorage.getItem("receipt_counter");
  const num = stored ? parseInt(stored, 10) + 1 : 713;
  localStorage.setItem("receipt_counter", String(num));
  return `REC/DIG/${num}`;
}

const DEFAULT_ITEMS: LineItem[] = [
  { id: uid(), description: "", qty: 1, unitPrice: 0 },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ReceiptGenerator() {
  const [data, setData] = useState<ReceiptData>({
    receiptNumber: "REC/DIG/713",
    date: todayStr(),
    billTo: { name: "", phone: "", email: "", address: "" },
    shipTo: { name: "", phone: "", email: "", address: "" },
    items: DEFAULT_ITEMS,
    discount: 0,
    taxIncluded: true,
    shipping: 0,
    remarks: "Remarks, notes....",
  });

  const [initialized, setInitialized] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Initialize receipt number from localStorage on first mount
  React.useEffect(() => {
    if (!initialized) {
      const stored = localStorage.getItem("receipt_counter");
      const num = stored ? parseInt(stored, 10) : 712;
      setData((d) => ({ ...d, receiptNumber: `REC/DIG/${num}` }));
      setInitialized(true);
    }
  }, [initialized]);

  // ── Derived Totals ────────────────────────────────────────────────────────
  const subtotal = data.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const discountAmt = data.discount;
  const subtotalLessDiscount = subtotal - discountAmt;
  const totalTax = data.taxIncluded ? 0 : 0; // extend if needed
  const total = subtotalLessDiscount + data.shipping;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const set = useCallback(
    <K extends keyof ReceiptData>(key: K, val: ReceiptData[K]) =>
      setData((d) => ({ ...d, [key]: val })),
    []
  );

  const setBillTo = (field: keyof ReceiptData["billTo"], val: string) =>
    setData((d) => ({ ...d, billTo: { ...d.billTo, [field]: val } }));

  const setShipTo = (field: keyof ReceiptData["shipTo"], val: string) =>
    setData((d) => ({ ...d, shipTo: { ...d.shipTo, [field]: val } }));

  const addItem = () =>
    setData((d) => ({
      ...d,
      items: [...d.items, { id: uid(), description: "", qty: 1, unitPrice: 0 }],
    }));

  const removeItem = (id: string) =>
    setData((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));

  const updateItem = (id: string, field: keyof Omit<LineItem, "id">, val: string | number) =>
    setData((d) => ({
      ...d,
      items: d.items.map((i) => (i.id === id ? { ...i, [field]: val } : i)),
    }));

  // Increment receipt number for next receipt
  const newReceipt = () => {
    const next = getNextReceiptNumber();
    setData((d) => ({
      ...d,
      receiptNumber: next,
      date: todayStr(),
      billTo: { name: "", phone: "", email: "", address: "" },
      shipTo: { name: "", phone: "", email: "", address: "" },
      items: [{ id: uid(), description: "", qty: 1, unitPrice: 0 }],
      discount: 0,
      shipping: 0,
      remarks: "Remarks, notes....",
    }));
  };

  // ── PDF Download ──────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();

    // Header bar
    doc.setFillColor(13, 27, 77);
    doc.rect(0, 0, W, 10, "F");

    // Company info
    doc.setFontSize(13);
    doc.setTextColor(13, 27, 77);
    doc.setFont("helvetica", "bold");
    doc.text("RECEIPT", 14, 30);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("INFERA AIBI CAMPUS PVT LTD", 14, 42);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("Edappally,Kochi,Ernakulam", 14, 47);
    doc.text("Kerala 682024", 14, 52);
    doc.text("+91 9746067949", 14, 57);
    doc.setTextColor(0, 112, 192);
    doc.text("hr@aibicampus.com", 14, 62);

    // Date & receipt number
    doc.setTextColor(200, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(data.date, W - 14, 42, { align: "right" });
    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.text("Receipt No. :", W - 55, 48);
    doc.setTextColor(13, 27, 77);
    doc.setFont("helvetica", "bold");
    doc.text(data.receiptNumber, W - 14, 48, { align: "right" });

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 68, W - 14, 68);

    // Bill To / Ship To
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(13, 27, 77);
    doc.text("BILL TO", 14, 76);
    doc.text("SHIP TO", W / 2 + 6, 76);

    doc.setDrawColor(13, 27, 77);
    doc.line(14, 77, W / 2 - 6, 77);
    doc.line(W / 2 + 6, 77, W - 14, 77);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(data.billTo.name || "—", 14, 83);
    doc.text(data.shipTo.name || "—", W / 2 + 6, 83);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 112, 192);
    doc.text(data.billTo.phone || "", 14, 88);
    doc.text(data.shipTo.phone || "", W / 2 + 6, 88);

    doc.setTextColor(80, 80, 80);
    doc.text(data.billTo.email || "", 14, 93);
    doc.text(data.shipTo.email || "", W / 2 + 6, 93);

    if (data.billTo.address) doc.text(data.billTo.address, 14, 98);
    if (data.shipTo.address) doc.text(data.shipTo.address, W / 2 + 6, 98);

    // Items table
    const tableRows = data.items.map((i) => [
      i.description,
      String(i.qty),
      formatINR(i.unitPrice),
      formatINR(i.qty * i.unitPrice),
    ]);

    autoTable(doc, {
      startY: 106,
      head: [["DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"]],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [13, 27, 77],
        textColor: [255, 255, 255],
        fontSize: 8,
        halign: "center",
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

    // Totals
    const totals = [
      ["SUBTOTAL", formatINR(subtotal)],
      ["DISCOUNT", formatINR(discountAmt)],
      ["SUBTOTAL LESS DISCOUNT", formatINR(subtotalLessDiscount)],
      ["TAX RATE", data.taxIncluded ? "INCLUDED" : "0.00"],
      ["TOTAL TAX", data.taxIncluded ? "INCLUDED" : "0.00"],
      ["SHIPPING/HANDLING", formatINR(data.shipping)],
    ];

    let ty = finalY;
    doc.setFontSize(8);
    totals.forEach(([label, val]) => {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(label, W - 60, ty);
      doc.setTextColor(30, 30, 30);
      doc.text(val, W - 14, ty, { align: "right" });
      doc.setDrawColor(220, 220, 220);
      doc.line(W - 65, ty + 1, W - 14, ty + 1);
      ty += 7;
    });

    // Paid total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(13, 27, 77);
    doc.text(`Paid  ₹  ${formatINR(total)}`, W - 14, ty + 3, { align: "right" });

    // Remarks
    if (data.remarks) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(data.remarks, 14, ty + 3);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 14;
    doc.setFillColor(13, 27, 77);
    doc.rect(0, footerY - 4, W, 18, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(
      "Note : This is a computer-generated receipt and does not require a physical signature.",
      W / 2,
      footerY + 4,
      { align: "center" }
    );

    // Footer separator bar
    doc.setFillColor(0, 174, 239);
    doc.rect(0, footerY - 5, W, 1, "F");

    doc.save(`${data.receiptNumber.replace(/\//g, "-")}.pdf`);
  };

  // ── Excel/Sheet Download ──────────────────────────────────────────────────
  const downloadSheet = async () => {
    const XLSX = await import("xlsx");

    const ws_data: (string | number)[][] = [
      ["RECEIPT"],
      [],
      ["INFERA AIBI CAMPUS PVT LTD", "", "", "", "Date:", data.date],
      ["Edappally, Kochi, Ernakulam", "", "", "", "Receipt No.:", data.receiptNumber],
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
      ...data.items.map((i) => [
        i.description,
        i.qty,
        i.unitPrice,
        i.qty * i.unitPrice,
      ]),
      [],
      ["", "", "SUBTOTAL", subtotal],
      ["", "", "DISCOUNT", discountAmt],
      ["", "", "SUBTOTAL LESS DISCOUNT", subtotalLessDiscount],
      ["", "", "TAX RATE", data.taxIncluded ? "INCLUDED" : 0],
      ["", "", "TOTAL TAX", data.taxIncluded ? "INCLUDED" : 0],
      ["", "", "SHIPPING/HANDLING", data.shipping],
      ["", "", "PAID TOTAL (₹)", total],
      [],
      ["Remarks:", data.remarks],
      [],
      ["Note: This is a computer-generated receipt."],
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws["!cols"] = [{ wch: 42 }, { wch: 8 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 20 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipt");
    XLSX.writeFile(wb, `${data.receiptNumber.replace(/\//g, "-")}.xlsx`);
  };

  // ── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-400">
              Document Generator
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-white">
              Receipt Generator
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Fill in the details, preview, then download as PDF or Excel.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={newReceipt}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Receipt size={15} />
              New Receipt
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
            >
              <Printer size={15} />
              Print
            </button>
            <button
              onClick={downloadSheet}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
            >
              <FileSpreadsheet size={15} />
              Excel (.xlsx)
            </button>
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition hover:scale-[1.02]"
            >
              <Download size={15} />
              Download PDF
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* ── LEFT: Form ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Receipt meta */}
            <div className="glass rounded-2xl p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">
                Receipt Info
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/50">
                    Receipt No.
                  </label>
                  <input
                    value={data.receiptNumber}
                    onChange={(e) => set("receiptNumber", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-violet-400/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/50">
                    Date
                  </label>
                  <input
                    value={data.date}
                    onChange={(e) => set("date", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-violet-400/60 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bill To / Ship To */}
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  { label: "Bill To", key: "billTo" as const },
                  { label: "Ship To", key: "shipTo" as const },
                ] as const
              ).map(({ label, key }) => (
                <div key={key} className="glass rounded-2xl p-5">
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">
                    {label}
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
                        value={key === "billTo" ? data.billTo[field] : data.shipTo[field]}
                        onChange={(e) =>
                          key === "billTo"
                            ? setBillTo(field, e.target.value)
                            : setShipTo(field, e.target.value)
                        }
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-violet-400/60 focus:outline-none"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Line Items */}
            <div className="glass rounded-2xl p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">
                Line Items
              </h2>
              <div className="mb-2 grid grid-cols-[1fr_56px_88px_80px_32px] gap-2 text-xs font-semibold uppercase text-white/40">
                <span>Description</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Unit Price</span>
                <span className="text-right">Total</span>
                <span />
              </div>
              <div className="flex flex-col gap-2">
                {data.items.map((item) => {
                  const rowTotal = item.qty * item.unitPrice;
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_56px_88px_80px_32px] items-center gap-2"
                    >
                      <input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        placeholder="Description…"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-violet-400/60 focus:outline-none"
                      />
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(item.id, "qty", parseFloat(e.target.value) || 0)
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center text-sm text-white focus:border-violet-400/60 focus:outline-none"
                      />
                      <input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-right text-sm text-white focus:border-violet-400/60 focus:outline-none"
                      />
                      <span className="text-right text-sm font-semibold text-emerald-300">
                        {formatINR(rowTotal)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={data.items.length === 1}
                        className="grid h-8 w-8 place-items-center rounded-lg text-white/30 transition hover:bg-red-500/20 hover:text-red-400 disabled:opacity-20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={addItem}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-2 text-sm text-white/40 transition hover:border-violet-400/50 hover:text-violet-300"
              >
                <Plus size={14} />
                Add item
              </button>
            </div>

            {/* Charges & Notes */}
            <div className="glass rounded-2xl p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/60">
                Charges &amp; Notes
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/50">
                    Discount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={data.discount}
                    onChange={(e) => set("discount", parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-400/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-white/50">
                    Shipping / Handling (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={data.shipping}
                    onChange={(e) => set("shipping", parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-400/60 focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60">
                  <input
                    type="checkbox"
                    checked={data.taxIncluded}
                    onChange={(e) => set("taxIncluded", e.target.checked)}
                    className="h-4 w-4 rounded accent-violet-500"
                  />
                  Tax included in price
                </label>
              </div>
              <div className="mt-3">
                <label className="mb-1 block text-xs font-semibold text-white/50">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={data.remarks}
                  onChange={(e) => set("remarks", e.target.value)}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/20 focus:border-violet-400/60 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Receipt Preview ──────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-white/30">
              Live Preview
            </p>
            <div
              ref={printRef}
              id="receipt-preview"
              className="receipt-print-area overflow-hidden rounded-2xl bg-white shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
            >
              {/* Top navy bar */}
              <div style={{ background: "#0D1B4D", height: 12 }} />

              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "24px 28px 12px",
                  background: "#fff",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#888",
                      letterSpacing: 3,
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    RECEIPT
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {/* AIBI Logo placeholder */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        background: "linear-gradient(135deg,#00b4d8,#7b2ff7)",
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: 18,
                        color: "#fff",
                        fontFamily: "Arial, sans-serif",
                        letterSpacing: -1,
                      }}
                    >
                      ai<span style={{ color: "#a5f3fc" }}>bi</span>
                    </div>
                    <div style={{ lineHeight: 1.2 }}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#0D1B4D",
                          fontFamily: "Arial, sans-serif",
                        }}
                      >
                        Ai &amp; Business
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#0D1B4D",
                          fontFamily: "Arial, sans-serif",
                        }}
                      >
                        Innovation
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#0D1B4D",
                          fontFamily: "Arial, sans-serif",
                        }}
                      >
                        Campus
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company info + Date */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 28px 16px",
                  background: "#fff",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div style={{ fontFamily: "Arial, sans-serif" }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: "#111" }}>
                    INFERA AIBI CAMPUS PVT LTD
                  </div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
                    Edappally,Kochi,Ernakulam
                  </div>
                  <div style={{ fontSize: 10, color: "#555" }}>Kerala 682024</div>
                  <div style={{ fontSize: 10, color: "#555" }}>+91 9746067949</div>
                  <div style={{ fontSize: 10, color: "#2563eb" }}>hr@aibicampus.com</div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  <div style={{ fontSize: 10, color: "#c00", fontWeight: 700 }}>
                    {data.date}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    <span style={{ fontSize: 9, color: "#555" }}>Receipt No. :</span>
                    <span
                      style={{ fontSize: 10, fontWeight: 700, color: "#0D1B4D" }}
                    >
                      {data.receiptNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bill To / Ship To */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0,
                  padding: "16px 28px",
                  background: "#fff",
                }}
              >
                {(["billTo", "shipTo"] as const).map((k) => (
                  <div key={k} style={{ paddingRight: k === "billTo" ? 16 : 0 }}>
                    <div
                      style={{
                        fontSize: 8,
                        fontWeight: 700,
                        color: "#0D1B4D",
                        letterSpacing: 1,
                        fontFamily: "Arial, sans-serif",
                        textTransform: "uppercase",
                        borderBottom: "1.5px solid #0D1B4D",
                        paddingBottom: 3,
                        marginBottom: 6,
                      }}
                    >
                      {k === "billTo" ? "Bill To" : "Ship To"}
                    </div>
                    <div
                      style={{ fontFamily: "Arial, sans-serif", fontSize: 10 }}
                    >
                      <div style={{ fontWeight: 700, color: "#111" }}>
                        {data[k].name || <span style={{ color: "#ccc" }}>—</span>}
                      </div>
                      <div style={{ color: "#2563eb" }}>{data[k].phone}</div>
                      <div style={{ color: "#555" }}>{data[k].email}</div>
                      {data[k].address && (
                        <div style={{ color: "#555" }}>{data[k].address}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Items table */}
              <div style={{ padding: "0 28px 0" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontFamily: "Arial, sans-serif",
                    fontSize: 9,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#0D1B4D", color: "#fff" }}>
                      {["DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "6px 8px",
                              textAlign: h === "DESCRIPTION" ? "left" : "right",
                              fontWeight: 700,
                              letterSpacing: 0.5,
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item, idx) => (
                      <tr
                        key={item.id}
                        style={{
                          background: idx % 2 === 0 ? "#fff" : "#f5f5fa",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <td style={{ padding: "5px 8px", color: "#222" }}>
                          {item.description || ""}
                        </td>
                        <td
                          style={{
                            padding: "5px 8px",
                            textAlign: "right",
                            color: "#555",
                          }}
                        >
                          {item.qty}
                        </td>
                        <td
                          style={{
                            padding: "5px 8px",
                            textAlign: "right",
                            color: "#555",
                          }}
                        >
                          {formatINR(item.unitPrice)}
                        </td>
                        <td
                          style={{
                            padding: "5px 8px",
                            textAlign: "right",
                            color: "#222",
                            fontWeight: 600,
                          }}
                        >
                          {formatINR(item.qty * item.unitPrice)}
                        </td>
                      </tr>
                    ))}
                    {/* Padding rows up to 10 */}
                    {Array.from({
                      length: Math.max(0, 10 - data.items.length),
                    }).map((_, i) => (
                      <tr
                        key={`pad-${i}`}
                        style={{
                          background:
                            (data.items.length + i) % 2 === 0 ? "#fff" : "#f5f5fa",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <td style={{ padding: "5px 8px" }}>&nbsp;</td>
                        <td style={{ padding: "5px 8px" }} />
                        <td style={{ padding: "5px 8px" }} />
                        <td
                          style={{
                            padding: "5px 8px",
                            textAlign: "right",
                            color: "#aaa",
                            fontSize: 8,
                          }}
                        >
                          0.00
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals + remarks */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  padding: "14px 28px 8px",
                  background: "#fff",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                <div style={{ fontSize: 9, color: "#888", maxWidth: 200 }}>
                  {data.remarks}
                </div>
                <div style={{ minWidth: 220 }}>
                  {[
                    ["SUBTOTAL", formatINR(subtotal)],
                    ["DISCOUNT", formatINR(discountAmt)],
                    ["SUBTOTAL LESS DISCOUNT", formatINR(subtotalLessDiscount)],
                    ["TAX RATE", data.taxIncluded ? "INCLUDED" : "0.00"],
                    ["TOTAL TAX", data.taxIncluded ? "INCLUDED" : "0.00"],
                    ["SHIPPING/HANDLING", formatINR(data.shipping)],
                  ].map(([lbl, val]) => (
                    <div
                      key={lbl}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #e5e7eb",
                        padding: "3px 0",
                        fontSize: 9,
                        color: "#555",
                      }}
                    >
                      <span>{lbl}</span>
                      <span style={{ color: "#222" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paid total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  padding: "6px 28px 14px",
                  background: "#fff",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minWidth: 220,
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#0D1B4D" }}
                  >
                    Paid ₹
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      color: "#0D1B4D",
                      marginLeft: "auto",
                    }}
                  >
                    {formatINR(total)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  background: "#0D1B4D",
                  padding: "10px 28px",
                  borderTop: "3px solid #00b4d8",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 8,
                    color: "#fff",
                    textAlign: "center",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  Note : This is a computer-generated receipt and does not require a
                  physical signature.
                </p>
              </div>
            </div>

            {/* Action row below preview */}
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={downloadPDF}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition hover:scale-[1.02]"
              >
                <Download size={15} />
                PDF
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
              <button
                onClick={downloadSheet}
                className="group inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
              >
                <FileSpreadsheet size={15} />
                Excel
              </button>
              <button
                onClick={handlePrint}
                className="group inline-flex items-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-6 py-2.5 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
              >
                <Printer size={15} />
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
