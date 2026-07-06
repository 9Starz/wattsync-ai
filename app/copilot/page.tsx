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
      <div className="min-h-0 flex-1">
        <CopilotChat />
      </div>
    </div>
  );
}
