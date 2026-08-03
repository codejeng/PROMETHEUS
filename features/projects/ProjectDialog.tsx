"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  Grid,
  Typography,
  Checkbox,
  Slider,
  Autocomplete,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { Project, Milestone, TaskItem } from "@/types";
import { useProjectsStore } from "@/store/useProjectsStore";
import { usePapersStore } from "@/store/usePapersStore";
import { useProblemsStore } from "@/store/useProblemsStore";
import { createId } from "@/utils/id";
import { formatDate } from "@/utils/date";
import toast from "react-hot-toast";

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  defaultStage?: Project["stage"];
}

const blank = {
  title: "",
  overview: "",
  githubUrl: "",
  demoUrl: "",
  progress: 0,
  notes: "",
  impact: "",
  milestones: [] as Milestone[],
  tasks: [] as TaskItem[],
  relatedPaperIds: [] as string[],
  relatedProblemIds: [] as string[],
};

export function ProjectDialog({ open, onClose, project, defaultStage }: ProjectDialogProps) {
  const add = useProjectsStore((s) => s.add);
  const update = useProjectsStore((s) => s.update);
  const remove = useProjectsStore((s) => s.remove);
  const papers = usePapersStore((s) => s.items);
  const problems = useProblemsStore((s) => s.items);
  const [form, setForm] = useState(blank);
  const [newMilestone, setNewMilestone] = useState("");
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    if (project) {
      const { title, overview, githubUrl, demoUrl, progress, notes, impact, milestones, tasks, relatedPaperIds, relatedProblemIds } = project;
      setForm({
        title, overview, githubUrl: githubUrl ?? "", demoUrl: demoUrl ?? "", progress, notes, impact,
        milestones, tasks, relatedPaperIds, relatedProblemIds,
      });
    } else {
      setForm(blank);
    }
  }, [project, open]);

  function handleSave() {
    if (!form.title.trim()) {
      toast.error("Give this project a title.");
      return;
    }
    if (project) {
      update(project.id, form);
      toast.success("Project updated");
    } else {
      add({ ...form, stage: defaultStage ?? "Ideas" });
      toast.success("Project created");
    }
    onClose();
  }

  function addMilestone() {
    if (!newMilestone.trim()) return;
    setForm({ ...form, milestones: [...form.milestones, { id: createId(), title: newMilestone, done: false }] });
    setNewMilestone("");
  }

  function addTask() {
    if (!newTask.trim()) return;
    setForm({ ...form, tasks: [...form.tasks, { id: createId(), title: newTask, done: false }] });
    setNewTask("");
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: "var(--font-playfair), serif" }}>
        {project ? "Edit Project" : "New Project"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth autoFocus />
          </Grid>
          <Grid size={12}>
            <TextField label="Overview" value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="GitHub URL" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Demo URL" value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })} fullWidth />
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>Progress — {form.progress}%</Typography>
            <Slider
              value={form.progress}
              onChange={(_, v) => setForm({ ...form, progress: v as number })}
              size="small"
            />
          </Grid>

          <Grid size={12}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Milestones</Typography>
            <Stack spacing={1}>
              {form.milestones.map((m) => (
                <Stack key={m.id} direction="row" alignItems="center" spacing={1}>
                  <Checkbox
                    size="small"
                    checked={m.done}
                    onChange={() =>
                      setForm({
                        ...form,
                        milestones: form.milestones.map((x) => (x.id === m.id ? { ...x, done: !x.done } : x)),
                      })
                    }
                  />
                  <Typography variant="body2" sx={{ flex: 1, textDecoration: m.done ? "line-through" : "none", color: m.done ? "text.disabled" : "text.primary" }}>
                    {m.title} {m.dueDate ? `· ${formatDate(m.dueDate)}` : ""}
                  </Typography>
                  <IconButton size="small" onClick={() => setForm({ ...form, milestones: form.milestones.filter((x) => x.id !== m.id) })}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Add milestone…"
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMilestone()}
                  fullWidth
                />
                <IconButton onClick={addMilestone}><AddIcon fontSize="small" /></IconButton>
              </Stack>
            </Stack>
          </Grid>

          <Grid size={12}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Tasks</Typography>
            <Stack spacing={1}>
              {form.tasks.map((t) => (
                <Stack key={t.id} direction="row" alignItems="center" spacing={1}>
                  <Checkbox
                    size="small"
                    checked={t.done}
                    onChange={() =>
                      setForm({ ...form, tasks: form.tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)) })
                    }
                  />
                  <Typography variant="body2" sx={{ flex: 1, textDecoration: t.done ? "line-through" : "none", color: t.done ? "text.disabled" : "text.primary" }}>
                    {t.title}
                  </Typography>
                  <IconButton size="small" onClick={() => setForm({ ...form, tasks: form.tasks.filter((x) => x.id !== t.id) })}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Add task…"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  fullWidth
                />
                <IconButton onClick={addTask}><AddIcon fontSize="small" /></IconButton>
              </Stack>
            </Stack>
          </Grid>

          <Grid size={12}>
            <TextField label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={12}>
            <TextField label="Impact" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              multiple
              options={papers.map((p) => p.id)}
              getOptionLabel={(id) => papers.find((p) => p.id === id)?.title ?? id}
              value={form.relatedPaperIds}
              onChange={(_, v) => setForm({ ...form, relatedPaperIds: v })}
              renderInput={(params) => <TextField {...params} label="Related papers" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              multiple
              options={problems.map((p) => p.id)}
              getOptionLabel={(id) => problems.find((p) => p.id === id)?.title ?? id}
              value={form.relatedProblemIds}
              onChange={(_, v) => setForm({ ...form, relatedProblemIds: v })}
              renderInput={(params) => <TextField {...params} label="Related problems" />}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {project && (
          <IconButton onClick={() => { remove(project.id); toast.success("Removed"); onClose(); }} sx={{ mr: "auto" }} color="error">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
