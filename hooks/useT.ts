import { useCallback } from "react";
import { useLocaleStore } from "@/store/useLocaleStore";
import { dictionary, DictionaryShape } from "@/lib/i18n/dictionary";

type Section = keyof DictionaryShape;

/**
 * Translates static UI chrome only (nav, headers, buttons, empty states).
 * User-authored content (papers, notes, journal text, etc.) never passes
 * through this — it is stored and rendered verbatim regardless of locale.
 */
export function useT(section: Section) {
  const locale = useLocaleStore((s) => s.locale);

  return useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const sectionDict = dictionary[locale][section] as Record<string, string>;
      const fallbackDict = dictionary.en[section] as Record<string, string>;
      let text = sectionDict?.[key] ?? fallbackDict?.[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [locale, section]
  );
}
