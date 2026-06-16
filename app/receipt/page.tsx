import ReceiptGenerator from "@/components/ReceiptGenerator";

export const metadata = {
  title: "Receipt Generator | TemplateStudio",
  description: "Generate, print and download professional receipts as PDF or Excel sheet.",
};

export default function ReceiptPage() {
  return <ReceiptGenerator />;
}
