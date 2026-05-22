import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import StudioEditor from "@/components/studio-editor";

export default function EditorPage() {
  return (
    <AppShell compact>
      <Suspense fallback={<div className="p-8 text-white/70">Loading editor...</div>}>
        <StudioEditor />
      </Suspense>
    </AppShell>
  );
}
