import { TopBar } from "@/components/layout/TopBar";
import { CopilotChat } from "@/components/copilot/CopilotChat";

export const dynamic = "force-dynamic";

export default function CopilotPage() {
  return (
    <div className="flex h-screen flex-1 flex-col">
      <TopBar
        title="AI Copilot"
        subtitle="Ask questions about the VPP in plain English — grounded in live fleet data"
      />
      <div className="border-b border-border bg-surface/30 px-6 py-2 text-[11px] text-muted">
        Answers are computed live from the fleet's simulation, forecast, and optimization state — every number is
        traceable. Runs on a deterministic reasoning engine today, with a drop-in seam for Claude/GPT/Gemini.
      </div>
      <div className="min-h-0 flex-1">
        <CopilotChat />
      </div>
    </div>
  );
}
