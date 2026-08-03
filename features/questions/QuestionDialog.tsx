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
import { ResearchQuestion, Difficulty } from "@/types";
import { useQuestionsStore } from "@/store/useQuestionsStore";
import toast from "react-hot-toast";

const difficulties: Difficulty[] = ["Approachable", "Moderate", "Hard", "Frontier"];

const blank = {
  question: "",
  motivation: "",
  importance: "",
  relatedFields: [] as string[],
  difficulty: "Moderate" as Difficulty,
  openProblems: "",
  possibleExperiments: "",
  references: [] as string[],
  personalNotes: "",
};

export function QuestionDialog({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: ResearchQuestion | null;
}) {
  const add = useQuestionsStore((s) => s.add);
  const update = useQuestionsStore((s) => s.update);
  const remove = useQuestionsStore((s) => s.remove);
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (item) {
      const { question, motivation, importance, relatedFields, difficulty, openProblems, possibleExperiments, references, personalNotes } = item;
      setForm({ question, motivation, importance, relatedFields, difficulty, openProblems, possibleExperiments, references, personalNotes });
    } else {
      setForm(blank);
    }
  }, [item, open]);

  function handleSave() {
    if (!form.question.trim()) {
      toast.error("Write the question first.");
      return;
    }
    if (item) {
      update(item.id, form);
      toast.success("Question updated");
    } else {
      add(form);
      toast.success("Question added");
    }
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "var(--font-playfair), serif" }}>
        {item ? "Edit Research Question" : "New Research Question"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <TextField
            label="Question"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            fullWidth
            multiline
            minRows={2}
            autoFocus
          />
          <TextField
            label="Motivation"
            value={form.motivation}
            onChange={(e) => setForm({ ...form, motivation: e.target.value })}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Importance"
            value={form.importance}
            onChange={(e) => setForm({ ...form, importance: e.target.value })}
            fullWidth
            multiline
            minRows={2}
          />
          <Stack direction="row" spacing={2}>
            <Autocomplete
              multiple
              freeSolo
              fullWidth
              options={[]}
              value={form.relatedFields}
              onChange={(_, v) => setForm({ ...form, relatedFields: v as string[] })}
              renderInput={(params) => <TextField {...params} label="Related fields" />}
            />
            <TextField
              select
              label="Difficulty"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
              sx={{ minWidth: 160 }}
            >
              {difficulties.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <TextField
            label="Open problems"
            value={form.openProblems}
            onChange={(e) => setForm({ ...form, openProblems: e.target.value })}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Possible experiments"
            value={form.possibleExperiments}
            onChange={(e) => setForm({ ...form, possibleExperiments: e.target.value })}
            fullWidth
            multiline
            minRows={2}
          />
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={form.references}
            onChange={(_, v) => setForm({ ...form, references: v as string[] })}
            renderInput={(params) => <TextField {...params} label="References" placeholder="arXiv IDs, links…" />}
          />
          <TextField
            label="Personal notes"
            value={form.personalNotes}
            onChange={(e) => setForm({ ...form, personalNotes: e.target.value })}
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {item && (
          <IconButton onClick={() => { remove(item.id); toast.success("Removed"); onClose(); }} sx={{ mr: "auto" }} color="error">
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
