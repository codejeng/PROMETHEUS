import { createSupabaseEntityStore } from "./createSupabaseEntityStore";
import { JournalEntry } from "@/types";
import { journalSeed } from "@/lib/seedData";

export const useJournalStore = createSupabaseEntityStore<JournalEntry>(
  "journal_entries",
  journalSeed
);
