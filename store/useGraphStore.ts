import { create } from "zustand";
import { GraphNode, GraphEdge } from "@/types";
import { graphNodesSeed, graphEdgesSeed } from "@/lib/seedData";
import { createId } from "@/utils/id";
import { useSyncStore } from "./useSyncStore";
import { supabase } from "@/lib/supabase/client";
import { toRow, fromRow } from "@/utils/caseConvert";
import toast from "react-hot-toast";

interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  hydrated: boolean;
  loading: boolean;
  fetch: () => Promise<void>;
  addNode: (node: Omit<GraphNode, "id">) => void;
  addEdge: (edge: Omit<GraphEdge, "id">) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  /** Local-only, called continuously while dragging — no network write. */
  updateNodePosition: (id: string, x: number, y: number) => void;
  /** Persists the current position — call once on drag end. */
  commitNodePosition: (id: string, x: number, y: number) => void;
}

export const useGraphStore = create<GraphState>()((set, get) => ({
  nodes: [],
  edges: [],
  hydrated: false,
  loading: false,

  fetch: async () => {
    if (get().hydrated || get().loading) return;
    set({ loading: true });
    const [{ data: nodeRows, error: nodeError }, { data: edgeRows, error: edgeError }] =
      await Promise.all([
        supabase.from("graph_nodes").select("*"),
        supabase.from("graph_edges").select("*"),
      ]);

    if (nodeError || edgeError) {
      set({ loading: false });
      toast.error(`Couldn't load Knowledge Graph: ${(nodeError ?? edgeError)?.message}`);
      return;
    }

    if (nodeRows.length === 0 && graphNodesSeed.length > 0) {
      const [{ error: seedNodeError }, { error: seedEdgeError }] = await Promise.all([
        supabase.from("graph_nodes").insert(graphNodesSeed.map(toRow)),
        supabase.from("graph_edges").insert(graphEdgesSeed.map(toRow)),
      ]);
      if (seedNodeError || seedEdgeError) {
        set({ loading: false });
        toast.error(`Couldn't seed Knowledge Graph: ${(seedNodeError ?? seedEdgeError)?.message}`);
        return;
      }
      set({ nodes: graphNodesSeed, edges: graphEdgesSeed, hydrated: true, loading: false });
      return;
    }

    set({
      nodes: nodeRows.map((row) => fromRow<GraphNode>(row)),
      edges: edgeRows.map((row) => fromRow<GraphEdge>(row)),
      hydrated: true,
      loading: false,
    });
  },

  addNode: (node) => {
    const entity = { ...node, id: createId() };
    set({ nodes: [...get().nodes, entity] });
    useSyncStore.getState().pulse();

    supabase
      .from("graph_nodes")
      .insert(toRow(entity))
      .then(({ error }) => {
        if (error) {
          set({ nodes: get().nodes.filter((n) => n.id !== entity.id) });
          toast.error(`Couldn't save node: ${error.message}`);
        }
      });
  },

  addEdge: (edge) => {
    const entity = { ...edge, id: createId() };
    set({ edges: [...get().edges, entity] });
    useSyncStore.getState().pulse();

    supabase
      .from("graph_edges")
      .insert(toRow(entity))
      .then(({ error }) => {
        if (error) {
          set({ edges: get().edges.filter((e) => e.id !== entity.id) });
          toast.error(`Couldn't save connection: ${error.message}`);
        }
      });
  },

  removeNode: (id) => {
    const previousNodes = get().nodes;
    const previousEdges = get().edges;
    set({
      nodes: previousNodes.filter((n) => n.id !== id),
      edges: previousEdges.filter((e) => e.source !== id && e.target !== id),
    });
    useSyncStore.getState().pulse();

    supabase
      .from("graph_nodes")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          set({ nodes: previousNodes, edges: previousEdges });
          toast.error(`Couldn't delete node: ${error.message}`);
        }
      });
  },

  removeEdge: (id) => {
    const previous = get().edges;
    set({ edges: previous.filter((e) => e.id !== id) });
    useSyncStore.getState().pulse();

    supabase
      .from("graph_edges")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          set({ edges: previous });
          toast.error(`Couldn't delete connection: ${error.message}`);
        }
      });
  },

  updateNodePosition: (id, x, y) => {
    set({
      nodes: get().nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    });
  },

  commitNodePosition: (id, x, y) => {
    supabase
      .from("graph_nodes")
      .update({ x, y })
      .eq("id", id)
      .then(({ error }) => {
        if (error) toast.error(`Couldn't save node position: ${error.message}`);
      });
  },
}));
