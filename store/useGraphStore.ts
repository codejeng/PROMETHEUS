import { create } from "zustand";
import { persist } from "zustand/middleware";
import { GraphNode, GraphEdge } from "@/types";
import { graphNodesSeed, graphEdgesSeed } from "@/lib/seedData";
import { createId } from "@/utils/id";
import { useSyncStore } from "./useSyncStore";

interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  addNode: (node: Omit<GraphNode, "id">) => void;
  addEdge: (edge: Omit<GraphEdge, "id">) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
}

export const useGraphStore = create<GraphState>()(
  persist(
    (set, get) => ({
      nodes: graphNodesSeed,
      edges: graphEdgesSeed,
      addNode: (node) => {
        set({ nodes: [...get().nodes, { ...node, id: createId() }] });
        useSyncStore.getState().pulse();
      },
      addEdge: (edge) => {
        set({ edges: [...get().edges, { ...edge, id: createId() }] });
        useSyncStore.getState().pulse();
      },
      removeNode: (id) => {
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.source !== id && e.target !== id),
        });
        useSyncStore.getState().pulse();
      },
      removeEdge: (id) => {
        set({ edges: get().edges.filter((e) => e.id !== id) });
        useSyncStore.getState().pulse();
      },
      updateNodePosition: (id, x, y) => {
        set({
          nodes: get().nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
        });
      },
    }),
    { name: "prometheus-graph" }
  )
);
