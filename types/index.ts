// Core domain types for PROMETHEUS.
// These are intentionally shaped so that a future migration to
// Supabase/Postgres/Prisma is a data-layer swap, not a type rewrite:
// every entity has a stable `id`, ISO timestamp fields, and no
// client-only concerns (React state, UI flags) leak into the shape.

export type ID = string;
export type ISODate = string;

export interface BaseEntity {
  id: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ---------- Profile ----------

export interface Profile {
  prefix: string;
  name: string;
  avatarUrl: string;
  updatedAt: ISODate;
}

// ---------- Vision ----------

export interface Vision {
  mission: string;
  coreBeliefs: string;
  tenYearVision: string;
  twentyYearVision: string;
  humanityImpact: string;
  dreamLabs: string;
  dreamMentors: string;
  updatedAt: ISODate;
}

// ---------- Problems Worth Solving ----------

export type ProblemDomain =
  | "Energy"
  | "Fusion"
  | "Climate"
  | "Intelligence"
  | "Education"
  | "Biology"
  | "Longevity"
  | "Space"
  | "Manufacturing"
  | "Robotics"
  | "Medicine";

export interface Problem extends BaseEntity {
  title: string;
  domain: ProblemDomain;
  description: string;
  importance: string;
  currentProgress: string;
  existingCompanies: string[];
  researchLabs: string[];
  ideas: string[];
  relatedProjectIds: ID[];
}

// ---------- Research Questions ----------

export type Difficulty = "Approachable" | "Moderate" | "Hard" | "Frontier";

export interface ResearchQuestion extends BaseEntity {
  question: string;
  motivation: string;
  importance: string;
  relatedFields: string[];
  difficulty: Difficulty;
  openProblems: string;
  possibleExperiments: string;
  references: string[];
  personalNotes: string;
}

// ---------- Reading / Papers ----------

export type ReadingStatus = "To Read" | "Reading" | "Read" | "Reference";

export interface Paper extends BaseEntity {
  title: string;
  authors: string[];
  pdfLink?: string;
  arxivId?: string;
  doi?: string;
  category: string;
  difficulty: Difficulty;
  status: ReadingStatus;
  summary: string;
  keyInsight: string;
  questions: string;
  critique: string;
  ideasGenerated: string;
  relatedProjectIds: ID[];
  knowledgeTags: string[];
  hoursRead: number;
}

// ---------- Knowledge Graph ----------

export type GraphNodeType =
  | "paper"
  | "project"
  | "idea"
  | "problem"
  | "lab"
  | "researcher";

export type GraphEdgeType =
  | "inspired_by"
  | "supports"
  | "uses"
  | "contradicts"
  | "references";

export interface GraphNode {
  id: ID;
  type: GraphNodeType;
  label: string;
  refId?: ID;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: ID;
  source: ID;
  target: ID;
  type: GraphEdgeType;
}

// ---------- Projects ----------

export type ProjectStage =
  | "Ideas"
  | "Planning"
  | "Research"
  | "Building"
  | "Completed";

export interface Milestone {
  id: ID;
  title: string;
  dueDate?: ISODate;
  done: boolean;
}

export interface TaskItem {
  id: ID;
  title: string;
  done: boolean;
}

export interface Project extends BaseEntity {
  title: string;
  stage: ProjectStage;
  overview: string;
  githubUrl?: string;
  demoUrl?: string;
  progress: number; // 0-100
  notes: string;
  impact: string;
  milestones: Milestone[];
  tasks: TaskItem[];
  relatedPaperIds: ID[];
  relatedProblemIds: ID[];
}

// ---------- Labs ----------

export type LabStatus =
  | "Dream"
  | "Applying"
  | "Contacted"
  | "Rejected"
  | "Accepted";

export interface Lab extends BaseEntity {
  professor: string;
  university: string;
  researchArea: string;
  country: string;
  funding: string;
  website?: string;
  email?: string;
  applicationDeadline?: ISODate;
  currentProjects: string;
  interestingPapers: string;
  personalNotes: string;
  status: LabStatus;
}

// ---------- Scholarships ----------

export type ScholarshipStatus =
  | "Researching"
  | "Preparing"
  | "Applied"
  | "Interview"
  | "Accepted"
  | "Rejected";

export interface ChecklistItem {
  id: ID;
  label: string;
  done: boolean;
}

export interface Scholarship extends BaseEntity {
  name: string;
  university: string;
  country: string;
  funding: string;
  requirements: string;
  deadline: ISODate;
  status: ScholarshipStatus;
  documents: string[];
  checklist: ChecklistItem[];
  reminder?: ISODate;
}

// ---------- Timeline ----------

export interface TimelineMilestone extends BaseEntity {
  title: string;
  date: ISODate;
  description: string;
  category: "Education" | "Career" | "Research" | "Personal" | "Milestone";
  done: boolean;
}

// ---------- SOP Builder ----------

export interface SOPVersion {
  id: ID;
  content: SOPSections;
  savedAt: ISODate;
  label: string;
}

export interface SOPSections {
  personalStory: string;
  motivation: string;
  researchExperience: string;
  futureGoals: string;
  whyThisLab: string;
  whyThisUniversity: string;
  whyMe: string;
}

export interface SOPDocument {
  sections: SOPSections;
  versions: SOPVersion[];
  updatedAt: ISODate;
}

// ---------- Journal ----------

export type Mood = "great" | "good" | "neutral" | "low" | "rough";

export interface JournalEntry extends BaseEntity {
  date: ISODate;
  todaysLearning: string;
  questions: string;
  ideas: string;
  mistakes: string;
  insights: string;
  mood: Mood;
  energy: number; // 1-5
  deepWorkHours: number;
  wins: string;
  gratitude: string;
  tags: string[];
}

// ---------- Settings ----------

export interface AppSettings {
  themeMode: "dark" | "light" | "system";
  headingFont: "Playfair Display" | "Inter";
  autosave: boolean;
  autosaveIntervalMs: number;
}

// ---------- Global search ----------

export type SearchableKind =
  | "problem"
  | "question"
  | "paper"
  | "project"
  | "lab"
  | "scholarship"
  | "journal"
  | "milestone";

export interface SearchResult {
  kind: SearchableKind;
  id: ID;
  title: string;
  subtitle?: string;
  href: string;
}

// ---------- Research Engine ----------

export type ResearchSource = "arxiv" | "semanticScholar" | "openAlex" | "crossref";

export interface ExternalPaperResult {
  id: string; // stable id derived from source + source-native id
  source: ResearchSource;
  title: string;
  authors: string[];
  year?: number;
  abstract?: string;
  doi?: string;
  url?: string;
  arxivId?: string;
  relevance: number; // 0-1, keyword-overlap score against the query
  citationCount?: number; // from Semantic Scholar / OpenAlex / Crossref, where available
  publishedDate?: string; // ISO date, where the source exposes a full date (not just year)
}

export interface ResearchSearchResponse {
  query: string;
  results: ExternalPaperResult[];
  sourceStatus: Record<ResearchSource, "ok" | "error" | "empty">;
  errors: Partial<Record<ResearchSource, string>>;
}

// ---------- Research Gap Agent ----------

export interface ReadingOrderItem {
  paper: ExternalPaperResult;
  reason: string;
}

export interface GapAnalysisReport {
  topic: string;
  currentState: string;
  openProblems: string[];
  topLabs: string[];
  mostCitedPapers: ExternalPaperResult[];
  readingOrder: ReadingOrderItem[];
  thesisIdeas: string[];
}

// ---------- Daily Research Briefing ----------

export type NewsSource = "TechCrunch" | "VentureBeat" | "MIT News";

export interface NewsItem {
  title: string;
  source: NewsSource;
  url: string;
  publishedDate?: string;
  snippet?: string;
}

export interface GithubProject {
  name: string;
  url: string;
  description: string;
  stars: number;
  language?: string;
}

export interface ScoredPaper {
  paper: ExternalPaperResult;
  whyItMatters: string;
  connectionToInterests: string;
}

export interface ScoredNewsItem {
  item: NewsItem;
  whyItMatters: string;
  connectionToInterests: string;
}

export interface ScoredProject {
  project: GithubProject;
  whyItMatters: string;
}

export interface DailyBriefingReport {
  date: string; // ISO date this briefing covers
  isQuiet: boolean; // true if there was nothing significant — quietMessage is the only populated field besides date
  quietMessage?: string;
  highlights: string[];
  topPapers: ScoredPaper[];
  topNews: ScoredNewsItem[];
  topProjects: ScoredProject[];
  conferences: string[];
  funding: string[];
  trends: string[];
  researchIdeas: string[];
  researchGapOfTheDay: string;
  questionWorthThinking: string;
  quoteOfTheDay: string;
}

export interface BriefingInterests {
  primaryTopics: string[];
  secondaryTopics: string[];
  updatedAt: ISODate;
}

export type BriefingStageName = "papers" | "news" | "projects" | "ai";
export type BriefingStageStatus = "idle" | "active" | "done" | "error";
export interface BriefingProgressEvent {
  stage: BriefingStageName;
  status: BriefingStageStatus;
  count?: number;
}
export interface BriefingCompleteEvent {
  stage: "complete";
  report: DailyBriefingReport;
}
export interface BriefingErrorEvent {
  stage: "fatal";
  error: string;
}
export type BriefingStreamEvent = BriefingProgressEvent | BriefingCompleteEvent | BriefingErrorEvent;
