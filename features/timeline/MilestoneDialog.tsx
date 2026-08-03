"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { TimelineMilestone } from "@/types";
import { useTimelineStore } from "@/store/useTimelineStore";
import toast from "react-hot-toast";

const categories: TimelineMilestone["category"][] = ["Education", "Career", "Research", "Personal", "Milestone"];

const blank = {
  title: "",
  date: "",
  description: "",
  category: "Milestone" as TimelineMilestone["category"],
  done: false,
};

export function MilestoneDialog({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: TimelineMilestone | null;
}) {
  const add = useTimelineStore((s) => s.add);
  const update = useTimelineStore((s) => s.update);
  const remove = useTimelineStore((s) => s.remove);
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title,
        date: item.date.slice(0, 10),
        description: item.description,
        category: item.category,
        done: item.done,
      });
    } else {
      setForm(blank);
    }
  }, [item, open]);

  function handleSave() {
    if (!form.title.trim() || !form.date) {
      toast.error("Title and date are required.");
      return;
    }
    const payload = { ...form, date: new Date(form.date).toISOString() };
    if (item) {
      update(item.id, payload);
      toast.success("Milestone updated");
    } else {
      add(payload);
      toast.success("Milestone added");
    }
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: "var(--font-playfair), serif" }}>
        {item ? "Edit Milestone" : "New Milestone"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth autoFocus />
          <TextField
            type="date"
            label="Date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TimelineMilestone["category"] })} fullWidth>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
          <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline minRows={2} />
          <FormControlLabel
            control={<Checkbox checked={form.done} onChange={(e) => setForm({ ...form, done: e.target.checked })} />}
            label="Achieved"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {item && (
          <IconButton onClick={() => { remove(item.id); toast.success("Removed"); onClose(); }} sx={{ mr: "auto" }} color="error">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
