import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { apiKey, baseURL, model } = await req.json();
  if (!apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "Missing API key" }, { status: 400 });
  }
  if (!baseURL || typeof baseURL !== "string") {
    return NextResponse.json({ error: "Missing base URL" }, { status: 400 });
  }
  if (!model || typeof model !== "string") {
    return NextResponse.json({ error: "Missing model" }, { status: 400 });
  }

  const client = new OpenAI({ apiKey, baseURL });

  // The real test is a minimal chat completion on the actual model — this
  // is the exact capability the app depends on. Some gateways leave
  // /models open with lax or no auth, so treating a successful models.list()
  // as proof the key works is unreliable and can report "connected" for a
  // bad key. A 1-output-token completion costs nothing meaningful and
  // verifies both the key and the chosen model in one round trip.
  try {
    await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: "Say OK." }],
      max_tokens: 5,
      stream: false,
    });
    return NextResponse.json({ connected: true });
  } catch (err) {
    return NextResponse.json({ connected: false, error: describeError(err) }, { status: 502 });
  }
}

function describeError(err: unknown): string {
  if (err instanceof OpenAI.APIError) {
    return err.message || `Request failed (${err.status ?? "unknown status"})`;
  }
  if (err instanceof Error) return err.message;
  return "Could not reach the AI provider.";
}
