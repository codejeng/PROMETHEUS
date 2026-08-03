import { createId } from "@/utils/id";
import {
  Problem,
  ResearchQuestion,
  Paper,
  Project,
  Lab,
  Scholarship,
  TimelineMilestone,
  JournalEntry,
  GraphNode,
  GraphEdge,
} from "@/types";
import dayjs from "dayjs";

const iso = (offsetDays = 0) => dayjs().add(offsetDays, "day").toISOString();

// Fixed ids so knowledge-graph edges can reference them deterministically.
export const seedIds = {
  problemFusion: "prob_fusion",
  problemLongevity: "prob_longevity",
  problemSpace: "prob_space",
  questionPlasma: "q_plasma",
  questionMaterial: "q_material",
  paperTransformer: "paper_transformer",
  paperFusion: "paper_fusion",
  projectPlasmaSim: "proj_plasma_sim",
  projectOrbital: "proj_orbital",
  labMIT: "lab_mit",
  labCaltech: "lab_caltech",
};

export const problemsSeed: Problem[] = [
  {
    id: seedIds.problemFusion,
    title: "Commercial Fusion Energy",
    domain: "Fusion",
    description:
      "Achieving net-positive, grid-connected fusion power at a cost competitive with fossil fuels. The core obstacles are plasma confinement stability, first-wall materials that survive neutron flux, and tritium breeding at scale.",
    importance:
      "Unlocks near-limitless clean baseload energy, ending the climate/energy tradeoff and enabling energy-abundant computation, desalination, and manufacturing.",
    currentProgress:
      "NIF achieved ignition (Q>1) in 2022. Several private tokamak and stellarator companies targeting demo plants in the early 2030s.",
    existingCompanies: ["Commonwealth Fusion Systems", "Helion Energy", "TAE Technologies"],
    researchLabs: ["MIT PSFC", "Princeton PPPL", "General Atomics"],
    ideas: [
      "ML-based real-time disruption prediction for tokamaks",
      "Cheaper high-temperature superconducting magnet manufacturing",
    ],
    relatedProjectIds: [seedIds.projectPlasmaSim],
    createdAt: iso(-40),
    updatedAt: iso(-2),
  },
  {
    id: seedIds.problemLongevity,
    title: "Radical Life Extension",
    domain: "Longevity",
    description:
      "Understanding and intervening on the hallmarks of aging (genomic instability, cellular senescence, mitochondrial dysfunction) to meaningfully extend healthspan.",
    importance:
      "Aging is the largest single risk factor for disease and death worldwide; solving it dwarfs the impact of curing any single illness.",
    currentProgress:
      "Senolytics and partial reprogramming showing promise in animal models; first human trials for combination therapies underway.",
    existingCompanies: ["Altos Labs", "Retro Biosciences", "Unity Biotechnology"],
    researchLabs: ["Buck Institute", "Harvard Sinclair Lab"],
    ideas: ["Biomarker panel for biological age using cheap blood tests"],
    relatedProjectIds: [],
    createdAt: iso(-30),
    updatedAt: iso(-5),
  },
  {
    id: seedIds.problemSpace,
    title: "Multiplanetary Civilization",
    domain: "Space",
    description:
      "Reducing launch cost per kilogram enough to make permanent, self-sustaining settlement of Mars or the Moon economically viable.",
    importance:
      "A backup for civilization and the natural next frontier for human expansion, science, and resource access.",
    currentProgress:
      "Starship reaching orbital test flights; launch costs down ~20x since 2010 with reusability.",
    existingCompanies: ["SpaceX", "Blue Origin", "ICON (space construction)"],
    researchLabs: ["NASA JPL", "Caltech Space Systems"],
    ideas: ["In-situ resource utilization for propellant production on Mars"],
    relatedProjectIds: [seedIds.projectOrbital],
    createdAt: iso(-60),
    updatedAt: iso(-10),
  },
];

export const questionsSeed: ResearchQuestion[] = [
  {
    id: seedIds.questionPlasma,
    question: "Can AI accelerate plasma turbulence simulation enough to enable real-time tokamak control?",
    motivation:
      "Turbulent transport simulations (gyrokinetics) are the computational bottleneck in fusion reactor design loops.",
    importance:
      "Faster simulation directly shortens the design iteration cycle for every fusion startup, potentially by years.",
    relatedFields: ["Plasma Physics", "Machine Learning", "HPC"],
    difficulty: "Frontier",
    openProblems:
      "Surrogate models trained on gyrokinetic codes (GENE, GS2) still struggle to generalize across confinement regimes.",
    possibleExperiments:
      "Train a Fourier Neural Operator on GENE simulation data across a parameter sweep, validate against held-out DIII-D discharge data.",
    references: ["arXiv:2308.00016", "arXiv:2106.05468"],
    personalNotes: "Worth reaching out to the MIT PSFC ML group about compute access.",
    createdAt: iso(-20),
    updatedAt: iso(-1),
  },
  {
    id: seedIds.questionMaterial,
    question: "Can generative models for crystal structures shrink materials discovery from years to weeks?",
    motivation:
      "Battery, superconductor, and catalyst breakthroughs are gated by slow experimental materials screening.",
    importance:
      "A validated generative + active-learning pipeline could 10x the rate of usable materials discoveries per dollar.",
    relatedFields: ["Materials Science", "Generative Models", "DFT"],
    difficulty: "Hard",
    openProblems:
      "Generated candidates often violate thermodynamic stability; DFT validation remains the throughput bottleneck.",
    possibleExperiments:
      "Fine-tune a diffusion model on the Materials Project dataset, filter with a stability classifier, validate top candidates via DFT.",
    references: ["arXiv:2312.03687 (GNoME)"],
    personalNotes: "",
    createdAt: iso(-15),
    updatedAt: iso(-3),
  },
];

export const papersSeed: Paper[] = [
  {
    id: seedIds.paperTransformer,
    title: "Attention Is All You Need",
    authors: ["Vaswani, A.", "Shazeer, N.", "Parmar, N."],
    arxivId: "1706.03762",
    doi: "10.48550/arXiv.1706.03762",
    category: "Machine Learning",
    difficulty: "Moderate",
    status: "Read",
    summary:
      "Introduces the Transformer architecture, replacing recurrence with self-attention for sequence modeling.",
    keyInsight:
      "Attention alone, with positional encodings, is sufficient for state-of-the-art sequence transduction — and it parallelizes far better than RNNs.",
    questions: "How does attention complexity scaling limit context length in practice?",
    critique: "Compute cost analysis is light; later work (efficient attention) fills this gap.",
    ideasGenerated: "Apply attention over plasma simulation timesteps instead of tokens.",
    relatedProjectIds: [seedIds.projectPlasmaSim],
    knowledgeTags: ["transformers", "attention", "deep-learning"],
    hoursRead: 3,
    createdAt: iso(-90),
    updatedAt: iso(-90),
  },
  {
    id: seedIds.paperFusion,
    title: "Magnetic confinement fusion: status and prospects",
    authors: ["Ongena, J.", "Koch, R.", "Wolf, R."],
    doi: "10.1038/nphys3762",
    category: "Plasma Physics",
    difficulty: "Hard",
    status: "Reading",
    summary:
      "Survey of tokamak and stellarator progress, ITER milestones, and remaining physics challenges toward net-positive fusion.",
    keyInsight:
      "Confinement scaling laws (IPB98) remain the best predictive tool, but disruption mitigation is still an open engineering problem.",
    questions: "What's the state of the art in disruption prediction with ML?",
    critique: "",
    ideasGenerated: "",
    relatedProjectIds: [seedIds.projectPlasmaSim],
    knowledgeTags: ["fusion", "tokamak", "plasma"],
    hoursRead: 1.5,
    createdAt: iso(-10),
    updatedAt: iso(-1),
  },
  {
    id: createId(),
    title: "Highly accurate protein structure prediction with AlphaFold",
    authors: ["Jumper, J.", "Evans, R.", "Pritzel, A."],
    doi: "10.1038/s41586-021-03819-2",
    category: "Biology",
    difficulty: "Hard",
    status: "To Read",
    summary: "",
    keyInsight: "",
    questions: "",
    critique: "",
    ideasGenerated: "",
    relatedProjectIds: [],
    knowledgeTags: ["biology", "deep-learning", "protein-folding"],
    hoursRead: 0,
    createdAt: iso(-2),
    updatedAt: iso(-2),
  },
];

export const projectsSeed: Project[] = [
  {
    id: seedIds.projectPlasmaSim,
    title: "Neural Surrogate for Gyrokinetic Plasma Turbulence",
    stage: "Research",
    overview:
      "Building a Fourier Neural Operator surrogate for GENE simulation output to accelerate tokamak confinement predictions.",
    githubUrl: "",
    demoUrl: "",
    progress: 35,
    notes: "Data pipeline from GENE outputs is working; model architecture v2 in progress.",
    impact: "Could shorten fusion reactor design iteration loops from weeks to hours.",
    milestones: [
      { id: createId(), title: "Collect GENE simulation dataset", dueDate: iso(-20), done: true },
      { id: createId(), title: "Train baseline FNO model", dueDate: iso(5), done: false },
      { id: createId(), title: "Validate against DIII-D data", dueDate: iso(30), done: false },
    ],
    tasks: [
      { id: createId(), title: "Normalize simulation output tensors", done: true },
      { id: createId(), title: "Write training loop with mixed precision", done: false },
    ],
    relatedPaperIds: [seedIds.paperTransformer, seedIds.paperFusion],
    relatedProblemIds: [seedIds.problemFusion],
    createdAt: iso(-25),
    updatedAt: iso(-1),
  },
  {
    id: seedIds.projectOrbital,
    title: "Low-Cost CubeSat Attitude Control Firmware",
    stage: "Building",
    overview: "Open-source attitude determination and control firmware for 3U CubeSats using reaction wheels.",
    githubUrl: "https://github.com/example/cubesat-adcs",
    demoUrl: "",
    progress: 60,
    notes: "Kalman filter tuned; integrating magnetorquer desaturation.",
    impact: "Lowers the barrier for student and small-team satellite missions.",
    milestones: [
      { id: createId(), title: "Sensor fusion (IMU + sun sensor)", done: true },
      { id: createId(), title: "Hardware-in-the-loop test", dueDate: iso(14), done: false },
    ],
    tasks: [{ id: createId(), title: "Write desaturation control loop", done: false }],
    relatedPaperIds: [],
    relatedProblemIds: [seedIds.problemSpace],
    createdAt: iso(-50),
    updatedAt: iso(-3),
  },
  {
    id: createId(),
    title: "Personal Research OS (this app)",
    stage: "Ideas",
    overview: "A thinking environment to organize research, ideas, and applications in one place.",
    progress: 10,
    notes: "",
    impact: "Compounding personal research velocity over the next decade.",
    milestones: [],
    tasks: [{ id: createId(), title: "Sketch information architecture", done: true }],
    relatedPaperIds: [],
    relatedProblemIds: [],
    createdAt: iso(-3),
    updatedAt: iso(-1),
  },
];

export const labsSeed: Lab[] = [
  {
    id: seedIds.labMIT,
    professor: "Dr. Anne White",
    university: "MIT",
    researchArea: "Plasma Science & Fusion Center — turbulence and transport",
    country: "USA",
    funding: "DOE, ARPA-E",
    website: "https://www.psfc.mit.edu",
    email: "",
    applicationDeadline: iso(120),
    currentProjects: "Machine-learning accelerated turbulence modeling for SPARC.",
    interestingPapers: "Gyrokinetic ML surrogates, disruption prediction with CNNs.",
    personalNotes: "Dream lab — aligns exactly with plasma-sim project.",
    status: "Dream",
    createdAt: iso(-40),
    updatedAt: iso(-5),
  },
  {
    id: seedIds.labCaltech,
    professor: "Dr. Soon-Jo Chung",
    university: "Caltech",
    researchArea: "Aerospace Robotics & Control Lab",
    country: "USA",
    funding: "NASA JPL, NSF",
    website: "https://aerospacerobotics.caltech.edu",
    email: "",
    applicationDeadline: iso(90),
    currentProjects: "Autonomous spacecraft guidance, swarm robotics for space construction.",
    interestingPapers: "Learning-based guidance for planetary landers.",
    personalNotes: "Reach out after CubeSat firmware is demo-ready.",
    status: "Applying",
    createdAt: iso(-35),
    updatedAt: iso(-7),
  },
];

export const scholarshipsSeed: Scholarship[] = [
  {
    id: createId(),
    name: "Fulbright Science & Technology Award",
    university: "Various (US Universities)",
    country: "USA",
    funding: "Full tuition + stipend + travel",
    requirements: "3 letters of recommendation, SOP, GRE, TOEFL",
    deadline: iso(75),
    status: "Preparing",
    documents: ["Statement of Purpose", "CV", "Transcripts"],
    checklist: [
      { id: createId(), label: "Request recommendation letters", done: true },
      { id: createId(), label: "Draft SOP", done: false },
      { id: createId(), label: "Take TOEFL", done: false },
    ],
    reminder: iso(60),
    createdAt: iso(-20),
    updatedAt: iso(-2),
  },
  {
    id: createId(),
    name: "MIT Presidential Fellowship",
    university: "MIT",
    country: "USA",
    funding: "Full funding, 5 years",
    requirements: "Strong research statement, faculty match",
    deadline: iso(140),
    status: "Researching",
    documents: [],
    checklist: [{ id: createId(), label: "Identify potential PI matches", done: true }],
    createdAt: iso(-10),
    updatedAt: iso(-1),
  },
];

export const timelineSeed: TimelineMilestone[] = [
  {
    id: createId(),
    title: "B.S. in Physics",
    date: iso(-700),
    description: "Graduated with honors, focus on computational physics.",
    category: "Education",
    done: true,
    createdAt: iso(-700),
    updatedAt: iso(-700),
  },
  {
    id: createId(),
    title: "Research Assistant — Plasma ML",
    date: iso(-300),
    description: "Joined a university lab working on ML for fusion diagnostics.",
    category: "Research",
    done: true,
    createdAt: iso(-300),
    updatedAt: iso(-300),
  },
  {
    id: createId(),
    title: "Master's in Applied Physics",
    date: iso(180),
    description: "Targeting programs strong in computational plasma physics.",
    category: "Education",
    done: false,
    createdAt: iso(-5),
    updatedAt: iso(-5),
  },
  {
    id: createId(),
    title: "PhD — Fusion Energy Systems",
    date: iso(700),
    description: "",
    category: "Education",
    done: false,
    createdAt: iso(-5),
    updatedAt: iso(-5),
  },
  {
    id: createId(),
    title: "Research Scientist, Commercial Fusion",
    date: iso(2200),
    description: "",
    category: "Career",
    done: false,
    createdAt: iso(-5),
    updatedAt: iso(-5),
  },
];

export const journalSeed: JournalEntry[] = [
  {
    id: createId(),
    date: iso(0),
    todaysLearning: "Fourier Neural Operators generalize better across resolutions than standard CNNs.",
    questions: "Can I pretrain on a coarser grid and fine-tune on high-res GENE output?",
    ideas: "Try curriculum learning: coarse-to-fine simulation resolution.",
    mistakes: "Spent too long debugging a tensor shape mismatch instead of adding an assert early.",
    insights: "Writing the assumption down before coding would've saved 40 minutes.",
    mood: "good",
    energy: 4,
    deepWorkHours: 3.5,
    wins: "Got the FNO baseline training end to end.",
    gratitude: "Grateful for open-access GENE simulation data.",
    tags: ["fusion", "ml", "deep-work"],
    createdAt: iso(0),
    updatedAt: iso(0),
  },
  {
    id: createId(),
    date: iso(-1),
    todaysLearning: "Read about disruption prediction approaches in tokamaks.",
    questions: "What labeled disruption datasets are public?",
    ideas: "",
    mistakes: "",
    insights: "Most disruption datasets are locked behind collaboration agreements.",
    mood: "neutral",
    energy: 3,
    deepWorkHours: 2,
    wins: "Finished reading the fusion survey paper.",
    gratitude: "",
    tags: ["fusion", "reading"],
    createdAt: iso(-1),
    updatedAt: iso(-1),
  },
];

export const graphNodesSeed: GraphNode[] = [
  { id: "n_prob_fusion", type: "problem", label: "Commercial Fusion Energy", refId: seedIds.problemFusion, x: 0, y: 0 },
  { id: "n_proj_plasma", type: "project", label: "Neural Surrogate for Plasma Turbulence", refId: seedIds.projectPlasmaSim, x: 260, y: -80 },
  { id: "n_paper_transformer", type: "paper", label: "Attention Is All You Need", refId: seedIds.paperTransformer, x: 520, y: -140 },
  { id: "n_paper_fusion", type: "paper", label: "Magnetic Confinement Fusion Survey", refId: seedIds.paperFusion, x: 520, y: 20 },
  { id: "n_lab_mit", type: "lab", label: "MIT PSFC (Dr. Anne White)", refId: seedIds.labMIT, x: 260, y: 120 },
  { id: "n_idea_disruption", type: "idea", label: "ML disruption prediction", x: 780, y: 60 },
  { id: "n_prob_space", type: "problem", label: "Multiplanetary Civilization", refId: seedIds.problemSpace, x: 0, y: 260 },
  { id: "n_proj_cubesat", type: "project", label: "CubeSat ADCS Firmware", refId: seedIds.projectOrbital, x: 260, y: 320 },
];

export const graphEdgesSeed: GraphEdge[] = [
  { id: createId(), source: "n_proj_plasma", target: "n_prob_fusion", type: "supports" },
  { id: createId(), source: "n_proj_plasma", target: "n_paper_transformer", type: "uses" },
  { id: createId(), source: "n_proj_plasma", target: "n_paper_fusion", type: "references" },
  { id: createId(), source: "n_lab_mit", target: "n_prob_fusion", type: "supports" },
  { id: createId(), source: "n_idea_disruption", target: "n_paper_fusion", type: "inspired_by" },
  { id: createId(), source: "n_idea_disruption", target: "n_lab_mit", type: "references" },
  { id: createId(), source: "n_proj_cubesat", target: "n_prob_space", type: "supports" },
];
