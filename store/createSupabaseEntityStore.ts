import { create, StoreApi, UseBoundStore } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { createId } from "@/utils/id";
import { nowISO } from "@/utils/date";
import { toRow, fromRow } from "@/utils/caseConvert";
import { useSyncStore } from "./useSyncStore";
import { BaseEntity } from "@/types";
import toast from "react-hot-toast";

export interface SupabaseEntityState<T extends BaseEntity> {
  items: T[];
  loading: boolean;
  hydrated: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  add: (item: Partial<T>) => T;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  getById: (id: string) => T | undefined;
}

/**
 * Factory for a Supabase-backed CRUD store keyed by BaseEntity.id.
 *
 * Mirrors the API of the old localStorage-backed `createEntityStore` on
 * purpose: `add`/`update`/`remove` apply an optimistic local update
 * synchronously (so existing call sites that don't `await` keep working
 * unchanged) and persist to Supabase in the background, rolling the
 * local state back and toasting on failure. `fetchAll` hydrates `items`
 * from the DB once on app start, and seeds the table from `seed` the
 * very first time it finds the table empty.
 */
export function createSupabaseEntityStore<T extends BaseEntity>(
  table: string,
  seed: T[]
): UseBoundStore<StoreApi<SupabaseEntityState<T>>> {
  return create<SupabaseEntityState<T>>()((set, get) => ({
    items: [],
    loading: false,
    hydrated: false,
    error: null,

    fetchAll: async () => {
      if (get().hydrated || get().loading) return;
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        set({ loading: false, error: error.message });
        toast.error(`Couldn't load ${table}: ${error.message}`);
        return;
      }

      if (data.length === 0 && seed.length > 0) {
        const { error: seedError } = await supabase.from(table).insert(seed.map(toRow));
        if (seedError) {
          set({ loading: false, error: seedError.message, items: [] });
          toast.error(`Couldn't seed ${table}: ${seedError.message}`);
          return;
        }
        set({ items: seed, loading: false, hydrated: true });
        return;
      }

      set({ items: data.map((row) => fromRow<T>(row)), loading: false, hydrated: true });
    },

    add: (item) => {
      const now = nowISO();
      const entity = {
        ...item,
        id: item.id ?? createId(),
        createdAt: now,
        updatedAt: now,
      } as T;
      set({ items: [entity, ...get().items] });
      useSyncStore.getState().pulse();

      supabase
        .from(table)
        .insert(toRow(entity))
        .then(({ error }) => {
          if (error) {
            set({ items: get().items.filter((it) => it.id !== entity.id) });
            toast.error(`Couldn't save: ${error.message}`);
          }
        });

      return entity;
    },

    update: (id, patch) => {
      const previous = get().items;
      const next = previous.map((it) =>
        it.id === id ? { ...it, ...patch, updatedAt: nowISO() } : it
      );
      set({ items: next });
      useSyncStore.getState().pulse();

      const updated = next.find((it) => it.id === id);
      if (!updated) return;

      supabase
        .from(table)
        .update(toRow(updated))
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            set({ items: previous });
            toast.error(`Couldn't save changes: ${error.message}`);
          }
        });
    },

    remove: (id) => {
      const previous = get().items;
      set({ items: previous.filter((it) => it.id !== id) });
      useSyncStore.getState().pulse();

      supabase
        .from(table)
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            set({ items: previous });
            toast.error(`Couldn't delete: ${error.message}`);
          }
        });
    },

    getById: (id) => get().items.find((it) => it.id === id),
  }));
}
