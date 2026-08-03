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
  Autocomplete,
  IconButton,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Problem, ProblemDomain } from "@/types";
import { useProblemsStore } from "@/store/useProblemsStore";
import { useProjectsStore } from "@/store/useProjectsStore";
import toast from "react-hot-toast";

const domains: ProblemDomain[] = [
  "Energy",
  "Fusion",
  "Climate",
  "Intelligence",
  "Education",
  "Biology",
  "Longevity",
  "Space",
  "Manufacturing",
  "Robotics",
  "Medicine",
];

interface ProblemDialogProps {
  open: boolean;
  onClose: () => void;
  problem: Problem | null;
}

const blank = {
  title: "",
  domain: "Energy" as ProblemDomain,
  description: "",
  importance: "",
  currentProgress: "",
  existingCompanies: [] as string[],
  researchLabs: [] as string[],
  ideas: [] as string[],
  relatedProjectIds: [] as string[],
};

export function ProblemDialog({ open, onClose, problem }: ProblemDialogProps) {
  const add = useProblemsStore((s) => s.add);
  const update = useProblemsStore((s) => s.update);
  const remove = useProblemsStore((s) => s.remove);
  const projects = useProjectsStore((s) => s.items);
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (problem) {
      setForm({
        title: problem.title,
        domain: problem.domain,
        description: problem.description,
        importance: problem.importance,
        currentProgress: problem.currentProgress,
        existingCompanies: problem.existingCompanies,
        researchLabs: problem.researchLabs,
        ideas: problem.ideas,
        relatedProjectIds: problem.relatedProjectIds,
      });
    } else {
      setForm(blank);
    }
  }, [problem, open]);

  function handleSave() {
    if (!form.title.trim()) {
      toast.error("Give this problem a title.");
      return;
    }
    if (problem) {
      update(problem.id, form);
      toast.success("Problem updated");
    } else {
      add(form);
      toast.success("Problem added");
    }
    onClose();
  }

  function handleDelete() {
    if (problem) {
      remove(problem.id);
      toast.success("Problem removed");
      onClose();
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "var(--font-playfair), serif" }}>
        {problem ? "Edit Problem" : "New Problem Worth Solving"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            fullWidth
            autoFocus
          />
          <TextField
            select
            label="Domain"
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value as ProblemDomain })}
            fullWidth
          >
            {domains.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="Why this matters"
            value={form.importance}
            onChange={(e) => setForm({ ...form, importance: e.target.value })}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Current progress (state of the art)"
            value={form.currentProgress}
            onChange={(e) => setForm({ ...form, currentProgress: e.target.value })}
            fullWidth
            multiline
            minRows={2}
          />
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={form.existingCompanies}
            onChange={(_, v) => setForm({ ...form, existingCompanies: v as string[] })}
            renderInput={(params) => <TextField {...params} label="Existing companies" placeholder="Type and press enter" />}
          />
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={form.researchLabs}
            onChange={(_, v) => setForm({ ...form, researchLabs: v as string[] })}
            renderInput={(params) => <TextField {...params} label="Research labs" placeholder="Type and press enter" />}
          />
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={form.ideas}
            onChange={(_, v) => setForm({ ...form, ideas: v as string[] })}
            renderInput={(params) => <TextField {...params} label="Ideas" placeholder="Type and press enter" />}
          />
          <Autocomplete
            multiple
            options={projects.map((p) => p.id)}
            getOptionLabel={(id) => projects.find((p) => p.id === id)?.title ?? id}
            value={form.relatedProjectIds}
            onChange={(_, v) => setForm({ ...form, relatedProjectIds: v })}
            renderInput={(params) => <TextField {...params} label="Related projects" />}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {problem && (
          <IconButton onClick={handleDelete} sx={{ mr: "auto" }} color="error">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
