"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  NodeChange,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Box, Button, Stack, Chip, Typography, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { PageHeader } from "@/components/common/PageHeader";
import { useGraphStore } from "@/store/useGraphStore";
import { CustomGraphNode } from "./GraphNode";
import { AddNodeDialog } from "./AddNodeDialog";
import { nodeTypeColor, nodeTypeLabel, edgeTypeColor, edgeTypeLabel } from "./graphStyles";
import { GraphNodeType } from "@/types";
import toast from "react-hot-toast";
import { useT } from "@/hooks/useT";

const nodeTypes = { custom: CustomGraphNode };

export function GraphPage() {
  const tr = useT("graph");
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const storeNodes = useGraphStore((s) => s.nodes);
  const storeEdges = useGraphStore((s) => s.edges);
  const addEdge = useGraphStore((s) => s.addEdge);
  const updateNodePosition = useGraphStore((s) => s.updateNodePosition);
  const removeNode = useGraphStore((s) => s.removeNode);
  const [dialogOpen, setDialogOpen] = useState(false);

  const nodes: Node[] = useMemo(
    () =>
      storeNodes.map((n) => ({
        id: n.id,
        type: "custom",
        position: { x: n.x ?? 0, y: n.y ?? 0 },
        data: { label: n.label, type: n.type },
      })),
    [storeNodes]
  );

  const edges: Edge[] = useMemo(
    () =>
      storeEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: edgeTypeLabel[e.type],
        labelStyle: { fill: theme.palette.text.secondary, fontSize: 10 },
        labelBgStyle: { fill: theme.palette.background.paper, opacity: 0.85 },
        style: { stroke: edgeTypeColor[e.type], strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeTypeColor[e.type] },
        animated: e.type === "supports",
      })),
    [storeEdges, theme]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((c) => {
        if (c.type === "position" && c.position) {
          updateNodePosition(c.id, c.position.x, c.position.y);
        }
      });
    },
    [updateNodePosition]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      addEdge({ source: connection.source, target: connection.target, type: "references" });
      toast.success("Connected — edit type from the legend if needed");
    },
    [addEdge]
  );

  function onNodeDoubleClick(_: unknown, node: Node) {
    if (confirm(`Remove "${node.data.label}" and its connections?`)) {
      removeNode(node.id);
    }
  }

  const types: GraphNodeType[] = ["paper", "project", "idea", "problem", "lab", "researcher"];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      <PageHeader
        eyebrow={tr("eyebrow")}
        title={tr("title")}
        subtitle={tr("subtitle")}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            {tr("newNode")}
          </Button>
        }
      />
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {types.map((t) => (
          <Chip
            key={t}
            size="small"
            label={nodeTypeLabel[t]}
            sx={{ bgcolor: `${nodeTypeColor[t]}22`, color: nodeTypeColor[t], fontWeight: 600 }}
          />
        ))}
      </Stack>
      <Box sx={{ flex: 1, border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color={theme.palette.divider} gap={20} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(n) => nodeTypeColor[(n.data?.type as GraphNodeType) ?? "idea"]}
            maskColor={isDark ? "rgba(17,17,17,0.7)" : "rgba(250,249,246,0.7)"}
            style={{ background: theme.palette.background.paper }}
          />
        </ReactFlow>
      </Box>
      {nodes.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
          {tr("emptyState")}
        </Typography>
      )}
      <AddNodeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
