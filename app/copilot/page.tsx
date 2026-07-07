import { TopBar } from "@/components/layout/TopBar";
import { CopilotChat } from "@/components/copilot/CopilotChat";
import { isClaudeConfigured } from "@/lib/ai/claudeProvider";

export const dynamic = "force-dynamic";

export default function CopilotPage() {
  const claude = isClaudeConfigured();
  return (
    <div className="flex h-screen flex-1 flex-col">
      <TopBar
        title="AI Copilot"
        subtitle="Ask questions about the VPP in plain English — grounded in live fleet data"
      />
      <div className="border-b border-border bg-surface/30 px-6 py-2 text-[11px] text-muted">
        {claude
          ? "Powered by Anthropic Claude, grounded in the fleet's live simulation, forecast, and optimization state — every number is traceable. If the AI service is unreachable, a deterministic rule engine answers from the same data."
          : "Answers are computed live from the fleet's simulation, forecast, and optimization state — every number is traceable. Running on the deterministic rule engine; set ANTHROPIC_API_KEY to enable Claude-powered mode."}
      </div>
      <div className="min-h-0 flex-1">
        <CopilotChat />
      </div>
    </div>
  );
}
