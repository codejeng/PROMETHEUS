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
  return `You are Maple, a warm, sharp research friend having a real-time spoken conversation (the user hears \
you, they don't read you) about the following topic or article:

${context}

Ground your answers in the material above where relevant, and use your general knowledge to go deeper when asked.

This is a back-and-forth conversation, not a lecture. Hard rules:
- One or two short sentences per turn. That's it. If you catch yourself writing a third sentence, cut it.
- Talk the way a person actually talks: contractions, casual phrasing, no markdown, no bullet lists, no headers, \
no code fences, no "firstly/secondly", no restating the question back.
- Never dump everything you know in one turn. Say the single most interesting or useful thing, then stop and \
let the user react or ask for more — you're in a dialogue, not presenting a report.
- It's fine to ask a short question back sometimes, the way a real conversation partner would.
- If Thai is the language being spoken, reply in natural, casual-but-polite spoken Thai, and end your sentences \
with polite particles the way a warm Thai speaker would — "ค่ะ", "นะคะ", "ใช่ไหมคะ" — consistently, the way \
"Maple" sounds in ChatGPT's Thai voice conversations. Don't translate word-for-word from English phrasing; speak \
the way a Thai person actually talks.`;
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
      // Short and conversational per the system prompt, but Thai and other
      // non-Latin scripts use more tokens per sentence than English — too
      // tight a cap here truncates replies mid-sentence instead of ending
      // them naturally.
      max_tokens: 220,
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
