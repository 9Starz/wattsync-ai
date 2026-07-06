import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/ai/copilot";

export const dynamic = "force-dynamic";

/**
 * Copilot chat endpoint. Accepts { messages: [{role, content}, ...] } and answers the
 * latest user message grounded in live simulation + forecast + recommendation data.
 * The answer engine behind this route is swappable (rule-based today, LLM later).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = (body as { messages?: { role?: string; content?: string }[] })?.messages;
  const lastUser = Array.isArray(messages)
    ? [...messages].reverse().find((m) => m?.role === "user" && typeof m?.content === "string")
    : undefined;

  if (!lastUser?.content?.trim()) {
    return NextResponse.json({ error: "No user message provided" }, { status: 400 });
  }

  const reply = answerQuestion(lastUser.content);
  return NextResponse.json({ reply });
}
