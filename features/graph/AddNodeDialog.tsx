"use client";

import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack } from "@mui/material";
import { GraphNodeType } from "@/types";
import { nodeTypeLabel } from "./graphStyles";
import { useGraphStore } from "@/store/useGraphStore";
import toast from "react-hot-toast";

const types: GraphNodeType[] = ["paper", "project", "idea", "problem", "lab", "researcher"];

export function AddNodeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addNode = useGraphStore((s) => s.addNode);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<GraphNodeType>("idea");

  function handleSave() {
    if (!label.trim()) {
      toast.error("Give this node a label.");
      return;
    }
    addNode({ label, type, x: 200 + Math.random() * 300, y: 100 + Math.random() * 300 });
    toast.success("Node added");
    setLabel("");
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: "var(--font-playfair), serif" }}>New Node</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <TextField label="Label" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus fullWidth />
          <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value as GraphNodeType)} fullWidth>
            {types.map((t) => (
              <MenuItem key={t} value={t}>{nodeTypeLabel[t]}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
  );
}
