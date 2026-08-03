import { create } from "zustand";
import { persist } from "zustand/middleware";

// Holds the user's own AI provider connection details, client-side only.
// Values are sent to our own /api/ai/* routes per request and forwarded
// straight to the configured baseURL — never logged, never persisted
// server-side. This targets any OpenAI-compatible Chat Completions
// endpoint (OpenAI itself, a university/enterprise gateway, OpenRouter,
// vLLM, etc.) since that's the lowest common denominator across providers.

export type ConnectionStatus = "idle" | "checking" | "connected" | "error";

export const DEFAULT_BASE_URL = "https://api.openai.com/v1";
export const DEFAULT_MODEL = "gpt-5-mini";

interface AIState {
  apiKey: string;
  baseURL: string;
  model: string;
  status: ConnectionStatus;
  errorMessage: string | null;
  setApiKey: (key: string) => void;
  setBaseURL: (url: string) => void;
  setModel: (model: string) => void;
  clearConnection: () => void;
  setStatus: (status: ConnectionStatus, errorMessage?: string | null) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      apiKey: "",
      baseURL: DEFAULT_BASE_URL,
      model: DEFAULT_MODEL,
      status: "idle",
      errorMessage: null,
      setApiKey: (key) => set({ apiKey: key, status: "idle", errorMessage: null }),
      setBaseURL: (url) => set({ baseURL: url, status: "idle", errorMessage: null }),
      setModel: (model) => set({ model, status: "idle", errorMessage: null }),
      clearConnection: () => set({ apiKey: "", status: "idle", errorMessage: null }),
      setStatus: (status, errorMessage = null) => set({ status, errorMessage }),
    }),
    { name: "prometheus-ai" }
  )
);
