import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/ai/copilot";
import { CopilotChatMessage } from "@/lib/ai/claudeProvider";

export const dynamic = "force-dynamic";

/**
 * Copilot chat endpoint. Accepts { messages: [{role, content}, ...] } and answers the
 * latest user message grounded in live simulation + forecast + optimization data.
 * Engine: Claude (when ANTHROPIC_API_KEY is set server-side) with a deterministic
 * rule-based fallback. Responds { reply, mode: "claude" | "rules" }.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = (body as { messages?: { role?: string; content?: string }[] })?.messages;
  const history: CopilotChatMessage[] = Array.isArray(raw)
    ? raw
        .filter(
          (m): m is { role: "user" | "assistant"; content: string } =>
            (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string"
        )
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  const lastUser = [...history].reverse().find((m) => m.role === "user");
  if (!lastUser?.content.trim()) {
    return NextResponse.json({ error: "No user message provided" }, { status: 400 });
  }

  const { reply, mode } = await answerQuestion(lastUser.content, history);
  return NextResponse.json({ reply, mode });
}
