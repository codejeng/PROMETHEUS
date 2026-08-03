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
  Grid,
  IconButton,
  Stack,
  Checkbox,
  Typography,
  Autocomplete,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { Scholarship, ScholarshipStatus, ChecklistItem } from "@/types";
import { useScholarshipsStore } from "@/store/useScholarshipsStore";
import { createId } from "@/utils/id";
import toast from "react-hot-toast";

const statuses: ScholarshipStatus[] = ["Researching", "Preparing", "Applied", "Interview", "Accepted", "Rejected"];

const blank = {
  name: "",
  university: "",
  country: "",
  funding: "",
  requirements: "",
  deadline: "",
  status: "Researching" as ScholarshipStatus,
  documents: [] as string[],
  checklist: [] as ChecklistItem[],
};

export function ScholarshipDialog({ open, onClose, item }: { open: boolean; onClose: () => void; item: Scholarship | null }) {
  const add = useScholarshipsStore((s) => s.add);
  const update = useScholarshipsStore((s) => s.update);
  const remove = useScholarshipsStore((s) => s.remove);
  const [form, setForm] = useState(blank);
  const [newChecklist, setNewChecklist] = useState("");

  useEffect(() => {
    if (item) {
      const { name, university, country, funding, requirements, deadline, status, documents, checklist } = item;
      setForm({ name, university, country, funding, requirements, deadline: deadline?.slice(0, 10) ?? "", status, documents, checklist });
    } else {
      setForm(blank);
    }
  }, [item, open]);

  function handleSave() {
    if (!form.name.trim() || !form.deadline) {
      toast.error("Name and deadline are required.");
      return;
    }
    const payload = { ...form, deadline: new Date(form.deadline).toISOString() };
    if (item) {
      update(item.id, payload);
      toast.success("Scholarship updated");
    } else {
      add(payload);
      toast.success("Scholarship added");
    }
    onClose();
  }

  function addChecklistItem() {
    if (!newChecklist.trim()) return;
    setForm({ ...form, checklist: [...form.checklist, { id: createId(), label: newChecklist, done: false }] });
    setNewChecklist("");
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "var(--font-playfair), serif" }}>
        {item ? "Edit Scholarship" : "New Scholarship"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth autoFocus />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="University" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Funding" value={form.funding} onChange={(e) => setForm({ ...form, funding: e.target.value })} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="date"
              label="Deadline"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={12}>
            <TextField label="Requirements" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ScholarshipStatus })} fullWidth>
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={form.documents}
              onChange={(_, v) => setForm({ ...form, documents: v as string[] })}
              renderInput={(params) => <TextField {...params} label="Documents needed" />}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Checklist</Typography>
            <Stack spacing={1}>
              {form.checklist.map((c) => (
                <Stack key={c.id} direction="row" alignItems="center" spacing={1}>
                  <Checkbox
                    size="small"
                    checked={c.done}
                    onChange={() =>
                      setForm({ ...form, checklist: form.checklist.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)) })
                    }
                  />
                  <Typography variant="body2" sx={{ flex: 1, textDecoration: c.done ? "line-through" : "none", color: c.done ? "text.disabled" : "text.primary" }}>
                    {c.label}
                  </Typography>
                  <IconButton size="small" onClick={() => setForm({ ...form, checklist: form.checklist.filter((x) => x.id !== c.id) })}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Add checklist item…"
                  value={newChecklist}
                  onChange={(e) => setNewChecklist(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
                  fullWidth
                />
                <IconButton onClick={addChecklistItem}><AddIcon fontSize="small" /></IconButton>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
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
