import { create, StoreApi, UseBoundStore } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "@/utils/id";
import { nowISO } from "@/utils/date";
import { useSyncStore } from "./useSyncStore";
import { BaseEntity } from "@/types";

export interface EntityState<T extends BaseEntity> {
  items: T[];
  add: (item: Partial<T>) => T;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  getById: (id: string) => T | undefined;
}

/**
 * Factory for a persisted Zustand CRUD store keyed by BaseEntity.id.
 * Every feature store (problems, papers, projects, labs, ...) is a thin
 * call to this — new entities should not hand-roll add/update/remove.
 */
export function createEntityStore<T extends BaseEntity>(
  name: string,
  seed: T[]
): UseBoundStore<StoreApi<EntityState<T>>> {
  return create<EntityState<T>>()(
    persist(
      (set, get) => ({
        items: seed,
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
          return entity;
        },
        update: (id, patch) => {
          set({
            items: get().items.map((it) =>
              it.id === id ? { ...it, ...patch, updatedAt: nowISO() } : it
            ),
          });
          useSyncStore.getState().pulse();
        },
        remove: (id) => {
          set({ items: get().items.filter((it) => it.id !== id) });
          useSyncStore.getState().pulse();
        },
        getById: (id) => get().items.find((it) => it.id === id),
      }),
      { name: `prometheus-${name}` }
    )
  );
}
