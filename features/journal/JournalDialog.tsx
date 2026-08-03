"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Autocomplete,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { JournalEntry, Mood } from "@/types";
import { useJournalStore } from "@/store/useJournalStore";
import { nowISO } from "@/utils/date";
import toast from "react-hot-toast";

const moods: { value: Mood; emoji: string }[] = [
  { value: "great", emoji: "🤩" },
  { value: "good", emoji: "🙂" },
  { value: "neutral", emoji: "😐" },
  { value: "low", emoji: "😕" },
  { value: "rough", emoji: "😣" },
];

const blank = {
  date: nowISO(),
  todaysLearning: "",
  questions: "",
  ideas: "",
  mistakes: "",
  insights: "",
  mood: "good" as Mood,
  energy: 3,
  deepWorkHours: 0,
  wins: "",
  gratitude: "",
  tags: [] as string[],
};

export function JournalDialog({ open, onClose, entry }: { open: boolean; onClose: () => void; entry: JournalEntry | null }) {
  const add = useJournalStore((s) => s.add);
  const update = useJournalStore((s) => s.update);
  const remove = useJournalStore((s) => s.remove);
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (entry) {
      const { date, todaysLearning, questions, ideas, mistakes, insights, mood, energy, deepWorkHours, wins, gratitude, tags } = entry;
      setForm({ date, todaysLearning, questions, ideas, mistakes, insights, mood, energy, deepWorkHours, wins, gratitude, tags });
    } else {
      setForm({ ...blank, date: nowISO() });
    }
  }, [entry, open]);

  function handleSave() {
    if (entry) {
      update(entry.id, form);
      toast.success("Entry updated");
    } else {
      add(form);
      toast.success("Journal entry saved");
    }
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: "var(--font-playfair), serif" }}>
        {entry ? "Edit Entry" : "Today's Reflection"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <TextField
              type="date"
              label="Date"
              value={form.date.slice(0, 10)}
              onChange={(e) => setForm({ ...form, date: new Date(e.target.value).toISOString() })}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 200 }}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>Mood</Typography>
            <ToggleButtonGroup
              value={form.mood}
              exclusive
              onChange={(_, v) => v && setForm({ ...form, mood: v })}
            >
              {moods.map((m) => (
                <ToggleButton key={m.value} value={m.value} sx={{ fontSize: "1.1rem", px: 1.5 }}>
                  {m.emoji}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>Energy — {form.energy}/5</Typography>
            <Slider value={form.energy} onChange={(_, v) => setForm({ ...form, energy: v as number })} min={1} max={5} step={1} marks size="small" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="number"
              label="Deep work hours"
              value={form.deepWorkHours}
              onChange={(e) => setForm({ ...form, deepWorkHours: Number(e.target.value) })}
              fullWidth
              slotProps={{ htmlInput: { step: 0.5, min: 0 } }}
            />
          </Grid>
          <Grid size={12}>
            <TextField label="Today's learning" value={form.todaysLearning} onChange={(e) => setForm({ ...form, todaysLearning: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Questions" value={form.questions} onChange={(e) => setForm({ ...form, questions: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Ideas" value={form.ideas} onChange={(e) => setForm({ ...form, ideas: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Mistakes" value={form.mistakes} onChange={(e) => setForm({ ...form, mistakes: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Insights" value={form.insights} onChange={(e) => setForm({ ...form, insights: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Wins" value={form.wins} onChange={(e) => setForm({ ...form, wins: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Gratitude" value={form.gratitude} onChange={(e) => setForm({ ...form, gratitude: e.target.value })} fullWidth multiline minRows={2} />
          </Grid>
          <Grid size={12}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={form.tags}
              onChange={(_, v) => setForm({ ...form, tags: v as string[] })}
              renderInput={(params) => <TextField {...params} label="Tags" />}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        {entry && (
          <IconButton onClick={() => { remove(entry.id); toast.success("Removed"); onClose(); }} sx={{ mr: "auto" }} color="error">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
