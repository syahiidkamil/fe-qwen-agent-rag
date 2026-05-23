import type { ChatSource } from "@/types/chat";
import type { KbFile } from "@/types/file";

const TEMPLATES = {
  ai:
    "The AI Engineering track is 16 weeks, project-based, and mentor-led. You'll build a production RAG system with an eval harness, ship agentic workflows, and complete a capstone with one of our 47 hiring partners. Prerequisites: comfortable in Python + at least one shipped backend project.",
  cohort:
    "Cohort 14 opens applications now and starts September 22, 2026. The format is hybrid — twice-weekly in-person at our Jakarta studio plus async work. Tuition is Rp 48M, and we offer ISAs (pay 12% of salary for 18 months once you're hired above the Rp 8M/month floor).",
  schol:
    "We award two kinds of scholarships: a 50% merit scholarship (8 seats per cohort, awarded by panel review) and a 100% diversity scholarship (4 seats per cohort, for under-represented groups in SEA tech). The next deadline is July 30.",
  partner:
    "We currently work with 47 hiring partners across SEA — including fintech, healthtech, and AI-native startups. Cohort 13 placed 92% of graduates within 90 days at companies like Xendit, Halodoc, Ruangguru, and several Y Combinator-backed teams.",
  refund:
    "Full refund within 7 days of cohort start, no questions asked. Pro-rated refund through week 4. After week 4, you can defer to a future cohort at no cost up to 12 months out.",
  tuition:
    "Tuition is Rp 48M total. Three payment paths: (1) full upfront with 8% discount, (2) split into 4 installments over the program, (3) ISA — Rp 4M deposit, then 12% of salary for 18 months after you're hired above the floor.",
  curriculum:
    "The curriculum runs in 4 phases: Foundations (weeks 1-4), Build (weeks 5-9), Specialize (weeks 10-13), and Capstone (weeks 14-16). Each week has 2 mentor sessions, 1 demo day, and a paired project.",
  default:
    "Based on the documents I have indexed, the most relevant sources are below. Want me to pull a specific section, or compare two options side by side?",
} as const;

export interface FakeReply {
  body: string;
  sources: ChatSource[];
}

export function fakeReply(question: string, files: KbFile[]): FakeReply {
  const ingested = files.filter((f) => f.status === "ingested");
  const pool = ingested.length ? ingested : files;
  const q = (question || "").toLowerCase();

  let matches = pool.filter((f) => {
    const n = f.name.toLowerCase();
    return q
      .split(/\s+/)
      .some((w) => w.length > 3 && n.includes(w.slice(0, 5)));
  });
  if (matches.length < 2) {
    matches = [
      ...matches,
      ...pool.filter((f) => !matches.includes(f)),
    ].slice(0, Math.min(3, pool.length));
  }
  const sources: ChatSource[] = matches
    .slice(0, 3)
    .map((f) => ({ id: f.id, name: f.name }));

  let body: string = TEMPLATES.default;
  if (/(ai engineer|ai track|engineering track)/.test(q)) body = TEMPLATES.ai;
  else if (/(cohort|start|when|date|begin|intake)/.test(q))
    body = TEMPLATES.cohort;
  else if (/(scholar|aid|discount|free|sponsor)/.test(q))
    body = TEMPLATES.schol;
  else if (
    /(partner|hire|hiring|employer|company|placement|placed)/.test(q)
  )
    body = TEMPLATES.partner;
  else if (/(refund|defer|cancel|drop)/.test(q)) body = TEMPLATES.refund;
  else if (/(tuition|cost|price|pay|fee|isa)/.test(q))
    body = TEMPLATES.tuition;
  else if (/(curriculum|syllabus|week|module|topic)/.test(q))
    body = TEMPLATES.curriculum;

  return { body, sources };
}
