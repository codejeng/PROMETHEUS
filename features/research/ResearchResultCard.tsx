import { Card, Typography, Stack, Chip, Button, LinearProgress, CircularProgress, Tooltip } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LibraryAddOutlinedIcon from "@mui/icons-material/LibraryAddOutlined";
import CheckIcon from "@mui/icons-material/Check";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { ExternalPaperResult, ResearchSource } from "@/types";

const sourceLabel: Record<ResearchSource, string> = {
  arxiv: "arXiv",
  semanticScholar: "Semantic Scholar",
  openAlex: "OpenAlex",
  crossref: "Crossref",
};

const sourceColor: Record<ResearchSource, string> = {
  arxiv: "#D97C6B",
  semanticScholar: "#8FB2C9",
  openAlex: "#7FB77E",
  crossref: "#B39DDB",
};

export interface GeneratedSummary {
  summary: string;
  keyInsight: string;
}

export function ResearchResultCard({
  paper,
  alreadyAdded,
  onAdd,
  addLabel,
  addedLabel,
  relevanceLabel,
  canSummarize,
  summarizeLabel,
  summarizingLabel,
  keyInsightLabel,
  summarizing,
  summary,
  onSummarize,
}: {
  paper: ExternalPaperResult;
  alreadyAdded: boolean;
  onAdd: () => void;
  addLabel: string;
  addedLabel: string;
  relevanceLabel: string;
  canSummarize: boolean;
  summarizeLabel: string;
  summarizingLabel: string;
  keyInsightLabel: string;
  summarizing: boolean;
  summary?: GeneratedSummary;
  onSummarize: () => void;
}) {
  const pct = Math.round(paper.relevance * 100);
  return (
    <Card sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          label={sourceLabel[paper.source]}
          size="small"
          sx={{ bgcolor: `${sourceColor[paper.source]}22`, color: sourceColor[paper.source], fontWeight: 600 }}
        />
        {paper.year && <Chip label={paper.year} size="small" variant="outlined" />}
      </Stack>
      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
        {paper.title}
      </Typography>
      {paper.authors.length > 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {paper.authors.slice(0, 5).join(", ")}
          {paper.authors.length > 5 ? " et al." : ""}
        </Typography>
      )}
      {summary ? (
        <Stack spacing={0.5} sx={{ p: 1.25, borderRadius: 2, bgcolor: "action.hover" }}>
          <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>{summary.summary}</Typography>
          <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600 }}>
            {keyInsightLabel}: <Typography component="span" variant="caption" sx={{ color: "text.secondary" }}>{summary.keyInsight}</Typography>
          </Typography>
        </Stack>
      ) : (
        paper.abstract && (
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
            {paper.abstract.slice(0, 200)}
            {paper.abstract.length > 200 ? "…" : ""}
          </Typography>
        )
      )}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
        <Typography variant="caption" sx={{ color: "text.disabled", minWidth: 70 }}>
          {relevanceLabel}
        </Typography>
        <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 5, borderRadius: 3 }} />
        <Typography variant="caption" sx={{ color: "text.disabled", width: 32, textAlign: "right" }}>
          {pct}%
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1.5} sx={{ mt: 1 }} alignItems="center" flexWrap="wrap" useFlexGap>
        {paper.url && (
          <Button
            size="small"
            variant="text"
            startIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {paper.doi ?? paper.arxivId ?? "Source"}
          </Button>
        )}
        <Tooltip title={canSummarize ? "" : summarizeLabel}>
          <span>
            <Button
              size="small"
              variant="outlined"
              disabled={!canSummarize || summarizing || !!summary}
              startIcon={summarizing ? <CircularProgress size={13} /> : <AutoAwesomeOutlinedIcon sx={{ fontSize: 15 }} />}
              onClick={onSummarize}
            >
              {summarizing ? summarizingLabel : summarizeLabel}
            </Button>
          </span>
        </Tooltip>
        <Button
          size="small"
          variant={alreadyAdded ? "outlined" : "contained"}
          disabled={alreadyAdded}
          startIcon={alreadyAdded ? <CheckIcon sx={{ fontSize: 15 }} /> : <LibraryAddOutlinedIcon sx={{ fontSize: 15 }} />}
          onClick={onAdd}
          sx={{ ml: "auto" }}
        >
          {alreadyAdded ? addedLabel : addLabel}
        </Button>
      </Stack>
    </Card>
  );
}
