import { GraphNodeType, GraphEdgeType } from "@/types";

export const nodeTypeColor: Record<GraphNodeType, string> = {
  paper: "#8FB2C9",
  project: "#7FB77E",
  idea: "#E0B15C",
  problem: "#D97C6B",
  lab: "#B39DDB",
  researcher: "#F48FB1",
};

export const nodeTypeLabel: Record<GraphNodeType, string> = {
  paper: "Paper",
  project: "Project",
  idea: "Idea",
  problem: "Problem",
  lab: "Lab",
  researcher: "Researcher",
};

export const edgeTypeLabel: Record<GraphEdgeType, string> = {
  inspired_by: "inspired by",
  supports: "supports",
  uses: "uses",
  contradicts: "contradicts",
  references: "references",
};

export const edgeTypeColor: Record<GraphEdgeType, string> = {
  inspired_by: "#E0B15C",
  supports: "#7FB77E",
  uses: "#8FB2C9",
  contradicts: "#D97C6B",
  references: "rgba(255,255,255,0.4)",
};
