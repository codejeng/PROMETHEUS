// Suggested model IDs shown in the connection form's autocomplete. This is
// not authoritative — the field accepts any free-typed model ID, since
// every OpenAI-compatible gateway (OpenAI itself, university/enterprise
// proxies, OpenRouter, self-hosted vLLM, ...) exposes a different catalog.

export interface ModelOption {
  id: string;
  provider: string;
}

export const suggestedModels: ModelOption[] = [
  { id: "gpt-5-mini", provider: "OpenAI" },
  { id: "gpt-5", provider: "OpenAI" },
  { id: "gpt-5-nano", provider: "OpenAI" },
  { id: "claude-sonnet-5", provider: "Claude" },
  { id: "claude-haiku-4.5", provider: "Claude" },
  { id: "claude-sonnet-4.6", provider: "Claude" },
  { id: "gemini-2.5-flash", provider: "Gemini" },
  { id: "gemini-2.5-pro", provider: "Gemini" },
  { id: "deepseek-v3.2", provider: "Deepseek" },
  { id: "llama-4-scout", provider: "Meta AI" },
  { id: "qwen3-coder", provider: "Qwen" },
  { id: "mistral-medium-3", provider: "Mistral" },
  { id: "grok-4.1-fast", provider: "xAI" },
];
