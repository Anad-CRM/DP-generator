import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TemplateStudio Studio",
  description: "AI-powered branded profile picture and social poster generator for teams, campuses, creators, and communities."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
