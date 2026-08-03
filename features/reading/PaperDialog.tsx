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
  Autocomplete,
  IconButton,
  Grid,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Paper, Difficulty, ReadingStatus } from "@/types";
import { usePapersStore } from "@/store/usePapersStore";
import { useProjectsStore } from "@/store/useProjectsStore";
import toast from "react-hot-toast";

const difficulties: Difficulty[] = ["Approachable", "Moderate", "Hard", "Frontier"];
const statuses: ReadingStatus[] = ["To Read", "Reading", "Read", "Reference"];

const blank = {
  title: "",
  authors: [] as string[],
  pdfLink: "",
  arxivId: "",
  doi: "",
  category: "",
  difficulty: "Moderate" as Difficulty,
  status: "To Read" as ReadingStatus,
  summary: "",
  keyInsight: "",
  questions: "",
  critique: "",
  ideasGenerated: "",
  relatedProjectIds: [] as string[],
  knowledgeTags: [] as string[],
  hoursRead: 0,
};

export function PaperDialog({
  open,
  onClose,
  paper,
}: {
  open: boolean;
  onClose: () => void;
  paper: Paper | null;
}) {
  const add = usePapersStore((s) => s.add);
  const update = usePapersStore((s) => s.update);
  const remove = usePapersStore((s) => s.remove);
  const projects = useProjectsStore((s) => s.items);
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (paper) {
      const {
        title, authors, pdfLink, arxivId, doi, category, difficulty, status,
        summary, keyInsight, questions, critique, ideasGenerated, relatedProjectIds, knowledgeTags, hoursRead,
      } = paper;
      setForm({
        title, authors, pdfLink: pdfLink ?? "", arxivId: arxivId ?? "", doi: doi ?? "", category, difficulty,
        status, summary, keyInsight, questions, critique, ideasGenerated, relatedProjectIds, knowledgeTags, hoursRead,
      });
    } else {
      setForm(blank);
    }
  }, [paper, open]);

  function handleSave() {
    if (!form.title.trim()) {
      toast.error("Give this paper a title.");
      return;
    }
    if (paper) {
      update(paper.id, form);
      toast.success("Paper updated");
    } else {
      add(form);
      toast.success("Paper added to reading list");
    }
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: "var(--font-playfair), serif" }}>
        {paper ? "Edit Paper" : "Add Paper"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
              autoFocus
            />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={form.authors}
              onChange={(_, v) => setForm({ ...form, authors: v as string[] })}
              renderInput={(params) => <TextField {...params} label="Authors" placeholder="Type and press enter" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="arXiv ID" value={form.arxivId} onChange={(e) => setForm({ ...form, arxivId: e.target.value })} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="DOI" value={form.doi} onChange={(e) => setForm({ ...form, doi: e.target.value })} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="PDF link" value={form.pdfLink} onChange={(e) => setForm({ ...form, pdfLink: e.target.value })} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })} fullWidth>
              {difficulties.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ReadingStatus })} fullWidth>
              {statuses.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <TextField
              type="number"
              label="Hours read"
              value={form.hoursRead}
              onChange={(e) => setForm({ ...form, hoursRead: Number(e.target.value) })}
              sx={{ width: 160 }}
              slotProps={{ htmlInput: { step: 0.5, min: 0 } }}
            />
          </Grid>
          <Grid size={12}>
            <TextField label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={12}>
            <TextField label="Key insight" value={form.keyInsight} onChange={(e) => setForm({ ...form, keyInsight: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Questions raised" value={form.questions} onChange={(e) => setForm({ ...form, questions: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Critique" value={form.critique} onChange={(e) => setForm({ ...form, critique: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={12}>
            <TextField label="Ideas generated" value={form.ideasGenerated} onChange={(e) => setForm({ ...form, ideasGenerated: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={form.knowledgeTags}
              onChange={(_, v) => setForm({ ...form, knowledgeTags: v as string[] })}
              renderInput={(params) => <TextField {...params} label="Knowledge tags" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              multiple
              options={projects.map((p) => p.id)}
              getOptionLabel={(id) => projects.find((p) => p.id === id)?.title ?? id}
              value={form.relatedProjectIds}
              onChange={(_, v) => setForm({ ...form, relatedProjectIds: v })}
              renderInput={(params) => <TextField {...params} label="Related projects" />}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {paper && (
          <IconButton onClick={() => { remove(paper.id); toast.success("Removed"); onClose(); }} sx={{ mr: "auto" }} color="error">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
