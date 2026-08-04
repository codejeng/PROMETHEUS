// UI-chrome translations only. Nothing a user types (papers, notes, journal
// entries, project text, etc.) is ever routed through this dictionary — it
// covers navigation, headers, buttons, and static microcopy exclusively.
//
// The actual strings live in lib/i18n/locales/en.json and th.json — edit
// those directly to change wording (Thai included) without touching any
// TypeScript. Both files must have exactly the same keys; useT.ts falls
// back to the English string if a Thai key is ever missing.

import en from "./locales/en.json";
import th from "./locales/th.json";

export const dictionary = { en, th } as const;

export type Locale = keyof typeof dictionary;
export type DictionaryShape = typeof dictionary.en;
