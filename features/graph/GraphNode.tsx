import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Box, Typography } from "@mui/material";
import { GraphNodeType } from "@/types";
import { nodeTypeColor, nodeTypeLabel } from "./graphStyles";

export const CustomGraphNode = memo(function CustomGraphNode({ data, selected }: NodeProps<{ label: string; type: GraphNodeType }>) {
  const color = nodeTypeColor[data.type];
  return (
    <Box
      sx={(theme) => ({
        px: 2,
        py: 1.25,
        borderRadius: 2.5,
        minWidth: 160,
        maxWidth: 220,
        bgcolor: "background.paper",
        border: "1.5px solid",
        borderColor: selected ? color : theme.palette.divider,
        boxShadow: selected ? `0 0 0 3px ${color}33` : "none",
      })}
    >
      <Handle type="target" position={Position.Left} style={{ background: color, width: 8, height: 8 }} />
      <Typography
        variant="caption"
        sx={{ color, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.6rem" }}
      >
        {nodeTypeLabel[data.type]}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.25, lineHeight: 1.3, color: "text.primary" }}>
        {data.label}
      </Typography>
      <Handle type="source" position={Position.Right} style={{ background: color, width: 8, height: 8 }} />
    </Box>
  );
});
