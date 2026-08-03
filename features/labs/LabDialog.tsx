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
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Lab, LabStatus } from "@/types";
import { useLabsStore } from "@/store/useLabsStore";
import toast from "react-hot-toast";

const statuses: LabStatus[] = ["Dream", "Applying", "Contacted", "Rejected", "Accepted"];

const blank = {
  professor: "",
  university: "",
  researchArea: "",
  country: "",
  funding: "",
  website: "",
  email: "",
  applicationDeadline: "",
  currentProjects: "",
  interestingPapers: "",
  personalNotes: "",
  status: "Dream" as LabStatus,
};

export function LabDialog({ open, onClose, lab }: { open: boolean; onClose: () => void; lab: Lab | null }) {
  const add = useLabsStore((s) => s.add);
  const update = useLabsStore((s) => s.update);
  const remove = useLabsStore((s) => s.remove);
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (lab) {
      const { professor, university, researchArea, country, funding, website, email, applicationDeadline, currentProjects, interestingPapers, personalNotes, status } = lab;
      setForm({
        professor, university, researchArea, country, funding, website: website ?? "", email: email ?? "",
        applicationDeadline: applicationDeadline?.slice(0, 10) ?? "", currentProjects, interestingPapers, personalNotes, status,
      });
    } else {
      setForm(blank);
    }
  }, [lab, open]);

  function handleSave() {
    if (!form.professor.trim() || !form.university.trim()) {
      toast.error("Professor and university are required.");
      return;
    }
    const payload = {
      ...form,
      applicationDeadline: form.applicationDeadline ? new Date(form.applicationDeadline).toISOString() : undefined,
    };
    if (lab) {
      update(lab.id, payload);
      toast.success("Lab updated");
    } else {
      add(payload);
      toast.success("Lab added");
    }
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "var(--font-playfair), serif" }}>
        {lab ? "Edit Lab" : "New Lab"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Professor" value={form.professor} onChange={(e) => setForm({ ...form, professor: e.target.value })} fullWidth autoFocus />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="University" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} fullWidth />
          </Grid>
          <Grid size={12}>
            <TextField label="Research area" value={form.researchArea} onChange={(e) => setForm({ ...form, researchArea: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Funding" value={form.funding} onChange={(e) => setForm({ ...form, funding: e.target.value })} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="date"
              label="Application deadline"
              value={form.applicationDeadline}
              onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LabStatus })} fullWidth>
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <TextField label="Current projects" value={form.currentProjects} onChange={(e) => setForm({ ...form, currentProjects: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={12}>
            <TextField label="Interesting papers from this lab" value={form.interestingPapers} onChange={(e) => setForm({ ...form, interestingPapers: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={12}>
            <TextField label="Personal notes" value={form.personalNotes} onChange={(e) => setForm({ ...form, personalNotes: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {lab && (
          <IconButton onClick={() => { remove(lab.id); toast.success("Removed"); onClose(); }} sx={{ mr: "auto" }} color="error">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
