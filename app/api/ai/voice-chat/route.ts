import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface VoiceChatRequestBody {
  apiKey: string;
  baseURL: string;
  model: string;
  context: string;
  messages: ChatMessage[];
}

function buildSystemPrompt(context: string): string {
  return `You are a knowledgeable research conversation partner, talking with the user out loud (this is a \
voice conversation, spoken and heard, not read). They want to discuss the following topic or article:

${context}

Ground your answers in the material above where relevant, and use your general knowledge to go deeper when \
asked. Keep replies conversational and spoken-style: 2-4 sentences per turn, no markdown, no bullet lists, no \
headers, no code fences — just plain talk, the way a knowledgeable colleague would explain something out loud. \
If a longer explanation is genuinely needed, give the short version first and offer to go deeper.`;
}

export async function POST(req: NextRequest) {
  const body: VoiceChatRequestBody = await req.json();
  const { apiKey, baseURL, model, context, messages } = body;

  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 });
  }
  if (!baseURL || !model) {
    return NextResponse.json({ error: "Missing provider base URL or model" }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Missing conversation messages" }, { status: 400 });
  }

  const client = new OpenAI({ apiKey, baseURL });

  try {
    const response = await client.chat.completions.create({
      model,
      max_tokens: 400,
      messages: [
        { role: "system", content: buildSystemPrompt(context ?? "") },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });
    const reply = response.choices[0]?.message?.content;
    if (!reply) {
      return NextResponse.json({ error: "No reply was returned." }, { status: 502 });
    }
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: describeError(err) }, { status: 502 });
  }
}

function describeError(err: unknown): string {
  if (err instanceof OpenAI.APIError) {
    return err.message || `Request failed (${err.status ?? "unknown status"})`;
  }
  if (err instanceof Error) return err.message;
  return "Could not reach the AI provider.";
}
