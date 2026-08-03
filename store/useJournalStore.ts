import { createEntityStore } from "./createEntityStore";
import { JournalEntry } from "@/types";
import { journalSeed } from "@/lib/seedData";

export const useJournalStore = createEntityStore<JournalEntry>("journal", journalSeed);
