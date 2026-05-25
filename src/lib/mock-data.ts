import type { LandingConfig, PresetEntry, PresetId } from "@/types/config";
import type { KbFile } from "@/types/file";

export const PRESET_AIRANEXT: LandingConfig = {
  brand: "Airanext Camp",
  tagline: "ai era · next-gen bootcamp",
  nav: ["Programs", "Curriculum", "Outcomes", "Partners", "FAQ"],
  hero: {
    eyebrow: "Next cohort starts September 15",
    title: "Engineers who <em>ship</em> in the AI era.",
    body: "Master LLMs, build production-ready AI applications, and accelerate your career with an intensive, mentor-led engineering bootcamp.",
    ctaPrimary: "Start your application",
    ctaSecondary: "View curriculum",
    tags: ["Mentor-led", "Hire-aligned"],
    card: {
      label: "Cohort 14",
      livePill: "live",
      rows: [
        { k: "Starts", v: "Sept 22, 2026" },
        { k: "Format", v: "Hybrid · Jakarta + remote" },
        { k: "Duration", v: "16 weeks · 24h/week" },
        { k: "Tuition", v: "Rp 48M · ISA available" },
      ],
      chart: {
        label: "Hiring trend · last 6 cohorts",
        data: [38, 52, 44, 60, 71, 65, 78, 84, 76, 88, 92, 95],
      },
    },
  },
  trust: {
    count: "500+ alumni",
    sub: "now shipping at top tech companies",
    avatars: ["#0E8C7E", "#4A55E5", "#D77F1F", "#7A3CC2", "#C53A4C"],
  },
  marquee: [
    "OpenAI",
    "LangChain",
    "Pinecone",
    "Hugging Face",
    "PyTorch",
    "TensorFlow",
    "AWS",
    "GCP",
    "Anthropic",
  ],
  section1: {
    eyebrow: "Programs",
    title: "Choose your path",
    body: "Specialized tracks designed for different engineering backgrounds to accelerate your transition into AI.",
    items: [
      {
        n: "01",
        title: "AI Engineering",
        meta: "For software engineers building with LLMs and generative AI.",
        featured: false,
        bullets: [
          "Prompt engineering & RAG",
          "Agentic workflows",
          "Model deployment & ops",
        ],
        cta: "Learn more",
      },
      {
        n: "02",
        title: "Full-Stack AI",
        meta: "The complete package — frontend interfaces and backend infrastructure for AI products.",
        featured: true,
        bullets: [
          "Everything in AI Engineering",
          "Modern frontend (React / Next.js)",
          "Scalable system design",
        ],
        cta: "Apply for Full-Stack",
      },
      {
        n: "03",
        title: "Data & ML Ops",
        meta: "Infrastructure, data pipelines, and operationalization at scale.",
        featured: false,
        bullets: [
          "Data pipeline orchestration",
          "Model monitoring & CI/CD",
          "Cloud infrastructure (AWS / GCP)",
        ],
        cta: "Learn more",
      },
    ],
  },
  stats: {
    items: [
      { num: "94%", lbl: "Hiring rate" },
      { num: "Rp18M", lbl: "Avg starting salary" },
      { num: "16", lbl: "Weeks intensive" },
      { num: "1:1", lbl: "Expert mentorship" },
    ],
  },
  section2: {
    eyebrow: "How it works",
    title: "Your journey to AI mastery",
    body: "A proven methodology to take you from application to your first day as an AI engineer.",
    items: [
      {
        n: "1",
        t: "Apply & assess",
        d: "Submit your background and complete a technical assessment to ensure a good fit.",
      },
      {
        n: "2",
        t: "Intensive learning",
        d: "16 weeks of rigorous, hands-on building. Ship a real AI project every week.",
      },
      {
        n: "3",
        t: "Capstone project",
        d: "Build a production-grade AI application to showcase in your portfolio.",
      },
      {
        n: "4",
        t: "Career placement",
        d: "Work with our career team to land a role at a top tech company.",
      },
    ],
  },
  footer: {
    intro:
      "An immersive bootcamp for the AI era, based in Jakarta with hybrid cohorts across SEA.",
    columns: [
      {
        heading: "Programs",
        links: ["AI Engineering", "Data & ML", "Full-Stack AI", "Corporate"],
      },
      { heading: "Camp", links: ["About", "Mentors", "Partners", "Blog"] },
      {
        heading: "Contact",
        links: ["halo@airanext.id", "Jakarta · Bandung · Remote", "Staff sign in"],
      },
    ],
    bottomLeft: "© 2026 Airanext Camp",
    bottomCenter: "Made in Jakarta · Cohort 14",
    bottomRight: "v 2.4.0",
    bigWord: "airanext",
  },
  layout: {
    showTrust: true,
    showMarquee: true,
    showHeroCard: true,
    showStats: true,
    showFooterBigWord: true,
  },
  theme: { accent: "#0E8C7E" },
  widget: {
    name: "Aira",
    initial: "A",
    welcome:
      "Hi! I'm Aira — the Airanext assistant. Ask me about programs, schedules, tuition, scholarships, or hiring outcomes.",
    suggestions: [
      "What's the AI Engineering track like?",
      "When does cohort 14 start?",
      "Do you offer scholarships?",
      "Who are your hiring partners?",
    ],
  },
  chat_mode: "public",
};

export const PRESET_PULSE: LandingConfig = {
  brand: "Pulse",
  tagline: "product analytics · faster decisions",
  nav: ["Product", "Pricing", "Customers", "Changelog", "Docs"],
  hero: {
    eyebrow: "v4.0 · now with funnel attribution",
    title: "Product analytics that <em>actually ships</em>.",
    body: "Pulse turns raw events into the four numbers your team should care about. Built for product engineers, not data teams.",
    ctaPrimary: "Start free trial",
    ctaSecondary: "Read the docs",
    tags: ["Engineer-first", "SOC 2 Type II"],
    card: {
      label: "Pulse Pro",
      livePill: "popular",
      rows: [
        { k: "Price", v: "$29 / seat · mo" },
        { k: "Events", v: "50M / month" },
        { k: "Team", v: "Up to 25 seats" },
        { k: "Support", v: "Priority · 4h SLA" },
      ],
      chart: {
        label: "Active workspaces · last 12 weeks",
        data: [42, 48, 55, 53, 61, 68, 74, 79, 85, 88, 92, 96],
      },
    },
  },
  trust: {
    count: "1,800+ teams",
    sub: "now shipping faster with Pulse",
    avatars: ["#4A55E5", "#0E8C7E", "#C53A4C", "#D77F1F", "#7A3CC2"],
  },
  marquee: [
    "Funnels",
    "Cohorts",
    "Retention",
    "Attribution",
    "Session Replay",
    "SQL Console",
    "Feature Flags",
    "Dashboards",
    "Webhooks",
  ],
  section1: {
    eyebrow: "Product",
    title: "One source of truth",
    body: "Pulse ships as three tightly-integrated surfaces. They share schema, identity, and a single event bus — so insights stay consistent.",
    items: [
      {
        n: "01",
        title: "Analytics",
        meta: "Real-time event analytics powered by your own warehouse.",
        featured: false,
        bullets: [
          "Funnels, retention, cohorts under 200ms",
          "SQL console with materialized views",
          "Slack alerts on metric drift",
        ],
        cta: "See it live",
      },
      {
        n: "02",
        title: "Experiments",
        meta: "A/B testing and feature flags with auto-rollback on violation.",
        featured: true,
        bullets: [
          "Bayesian + frequentist engines",
          "SDK for Web, iOS, Android, Node",
          "Auto-rollback on guardrail violation",
        ],
        cta: "Start experimenting",
      },
      {
        n: "03",
        title: "Replay",
        meta: "Session replay and error tracking linked to every funnel.",
        featured: false,
        bullets: [
          "Console + network capture, PII-safe",
          "Linked to every funnel drop-off",
          "30-day retention on all plans",
        ],
        cta: "See it live",
      },
    ],
  },
  stats: {
    items: [
      { num: "120ms", lbl: "P50 query latency" },
      { num: "99.97%", lbl: "Uptime · trailing 90d" },
      { num: "47B", lbl: "Events / day" },
      { num: "4.9/5", lbl: "G2 rating" },
    ],
  },
  section2: {
    eyebrow: "How it works",
    title: "Install once, get to the answer",
    body: "Most teams are answering their first question in under 20 minutes. No data engineer required.",
    items: [
      {
        n: "1",
        t: "Install",
        d: "Drop the SDK or pipe events from Segment, Rudderstack, or your warehouse.",
      },
      {
        n: "2",
        t: "Define",
        d: "Tag the events that matter. We turn your taxonomy into a query-ready schema.",
      },
      {
        n: "3",
        t: "Explore",
        d: "Funnels, cohorts, retention, SQL — all on the same warehouse, sub-second.",
      },
      {
        n: "4",
        t: "Decide",
        d: "Pipe insights to Slack, dashboards, or feature flags. Ship what works.",
      },
    ],
  },
  footer: {
    intro:
      "Product analytics built for engineers. Open SDKs, transparent pricing, no contract required.",
    columns: [
      {
        heading: "Product",
        links: ["Analytics", "Experiments", "Replay", "Changelog"],
      },
      { heading: "Company", links: ["About", "Customers", "Careers", "Press"] },
      {
        heading: "Resources",
        links: ["hello@pulse.io", "San Francisco · Berlin", "Status page"],
      },
    ],
    bottomLeft: "© 2026 Pulse Analytics, Inc.",
    bottomCenter: "Crafted with care · SF + Berlin",
    bottomRight: "v 4.0.2",
    bigWord: "pulse",
  },
  layout: {
    showTrust: true,
    showMarquee: true,
    showHeroCard: true,
    showStats: true,
    showFooterBigWord: true,
  },
  theme: { accent: "#4A55E5" },
  widget: {
    name: "Pulse",
    initial: "P",
    welcome:
      "Hi — I'm the Pulse assistant. Ask me about features, pricing, integrations, or how to set up your first funnel.",
    suggestions: [
      "How does pricing work?",
      "Does Pulse support our warehouse?",
      "Show me a funnel example",
      "What's in the free trial?",
    ],
  },
  chat_mode: "public",
};

export const PRESET_FOYER: LandingConfig = {
  brand: "Foyer",
  tagline: "ideas · in person · once a year",
  nav: ["Speakers", "Schedule", "Venue", "Sponsors", "FAQ"],
  hero: {
    eyebrow: "Foyer 2026 · tickets on sale",
    title: "A conference for people who <em>make things</em>.",
    body: "Three days of talks, workshops, and small-room conversations between the engineers, designers, and writers building the future of consumer software.",
    ctaPrimary: "Buy tickets",
    ctaSecondary: "View the schedule",
    tags: ["Invite-only", "60% sold"],
    card: {
      label: "Foyer 2026",
      livePill: "tickets",
      rows: [
        { k: "Dates", v: "Mar 14–16, 2026" },
        { k: "Venue", v: "Capitol · Singapore" },
        { k: "Speakers", v: "42 confirmed · 6 keynotes" },
        { k: "From", v: "SGD 320 · Early-bird" },
      ],
      chart: {
        label: "Attendees · since 2020",
        data: [22, 28, 38, 46, 58, 70, 82, 88, 95, 100, 96, 99],
      },
    },
  },
  trust: {
    count: "12,000+ alumni",
    sub: "across six editions and four cities",
    avatars: ["#C53A4C", "#D77F1F", "#0E8C7E", "#7A3CC2", "#4A55E5"],
  },
  marquee: [
    "Talks",
    "Workshops",
    "Hallway track",
    "After-parties",
    "Demo night",
    "Founder office hours",
    "Open salons",
    "Field trips",
  ],
  section1: {
    eyebrow: "Programme",
    title: "Three tracks, one shared room",
    body: "Foyer runs three concurrent tracks under one roof. You move between rooms; we'll make the introductions.",
    items: [
      {
        n: "01",
        title: "Build",
        meta: "Engineering and tools — talks from founders who shipped this year.",
        featured: false,
        bullets: [
          "Talks from founders who shipped",
          "Hands-on workshops, 30 seats each",
          "Demo night on Friday evening",
        ],
        cta: "See speakers",
      },
      {
        n: "02",
        title: "Shape",
        meta: "Design and brand — studios on type, motion, identity, and critique.",
        featured: true,
        bullets: [
          "Studios on type, motion, identity",
          "Critique sessions in small rooms",
          "Studio crawls across the city",
        ],
        cta: "See speakers",
      },
      {
        n: "03",
        title: "Tell",
        meta: "Writing and media — reading nights, essays, and salons.",
        featured: false,
        bullets: [
          "Reading nights and open salons",
          "Workshops on essays and newsletters",
          "Off-the-record founder fireside",
        ],
        cta: "See speakers",
      },
    ],
  },
  stats: {
    items: [
      { num: "42", lbl: "Speakers confirmed" },
      { num: "3 days", lbl: "Single-track flow" },
      { num: "800", lbl: "Attendees capped" },
      { num: "4.9/5", lbl: "Alumni NPS" },
    ],
  },
  section2: {
    eyebrow: "The flow",
    title: "Three days, shaped to feel right",
    body: "Foyer is engineered for serendipity. Every minute is either programmed or generously empty.",
    items: [
      {
        n: "1",
        t: "Arrive",
        d: "Friday afternoon: registration, hallway track, opening keynote, dinner across the venue.",
      },
      {
        n: "2",
        t: "Engage",
        d: "Saturday: three concurrent tracks, lunch on the rooftop, demo night, late after-party.",
      },
      {
        n: "3",
        t: "Resolve",
        d: "Sunday: workshops, small-room conversations, closing keynote, optional Monday salons.",
      },
      {
        n: "4",
        t: "Carry",
        d: "After Foyer: alumni Slack, monthly salons in SF, NYC, and Singapore. Year-round.",
      },
    ],
  },
  footer: {
    intro:
      "Foyer is a small, year-once gathering for the people building the next generation of consumer software.",
    columns: [
      {
        heading: "Programme",
        links: ["Speakers", "Schedule", "Workshops", "Demo night"],
      },
      {
        heading: "Practical",
        links: ["Venue", "Travel & hotels", "Visa support", "Code of conduct"],
      },
      {
        heading: "Get in",
        links: ["hello@foyer.cc", "Singapore · year-round", "Press inquiries"],
      },
    ],
    bottomLeft: "© 2026 Foyer Conference",
    bottomCenter: "Made by humans · Singapore",
    bottomRight: "edition 06",
    bigWord: "foyer",
  },
  layout: {
    showTrust: true,
    showMarquee: true,
    showHeroCard: true,
    showStats: true,
    showFooterBigWord: true,
  },
  theme: { accent: "#C53A4C" },
  widget: {
    name: "Foyer",
    initial: "F",
    welcome:
      "Hi — I'm the Foyer concierge. Ask me about tickets, the venue, who's speaking, or how to get a visa letter.",
    suggestions: [
      "When does early-bird end?",
      "Who's speaking?",
      "Can I get a visa letter?",
      "Is there a code of conduct?",
    ],
  },
  chat_mode: "public",
};

export const PRESETS: Record<PresetId, PresetEntry> = {
  airanext: {
    id: "airanext",
    label: "Bootcamp · Airanext",
    config: PRESET_AIRANEXT,
  },
  pulse: { id: "pulse", label: "SaaS · Pulse", config: PRESET_PULSE },
  foyer: { id: "foyer", label: "Event · Foyer", config: PRESET_FOYER },
};

export const DEFAULT_CONFIG: LandingConfig = PRESET_AIRANEXT;

export const SEED_FILES: KbFile[] = [
  {
    id: "f1",
    name: "curriculum-2026-master.pdf",
    size: 2_400_000,
    type: "pdf",
    status: "ingested",
    uploaded: "3 days ago",
    chunks: 184,
    progress: 100,
  },
  {
    id: "f2",
    name: "cohort-14-handbook.pdf",
    size: 980_000,
    type: "pdf",
    status: "ingested",
    uploaded: "3 days ago",
    chunks: 62,
    progress: 100,
  },
  {
    id: "f3",
    name: "scholarship-program-details.docx",
    size: 412_000,
    type: "docx",
    status: "ingested",
    uploaded: "yesterday",
    chunks: 41,
    progress: 100,
  },
  {
    id: "f4",
    name: "refund-and-deferral-policy.md",
    size: 28_000,
    type: "md",
    status: "uploaded",
    uploaded: "1h ago",
    chunks: 0,
    progress: 0,
  },
  {
    id: "f5",
    name: "hiring-partner-roster-Q3.pdf",
    size: 1_600_000,
    type: "pdf",
    status: "uploaded",
    uploaded: "32m ago",
    chunks: 0,
    progress: 0,
  },
  {
    id: "f6",
    name: "FAQ-tuition-and-payment.txt",
    size: 45_000,
    type: "txt",
    status: "ingesting",
    uploaded: "just now",
    chunks: 0,
    progress: 47,
  },
  {
    id: "f7",
    name: "mentor-bios-cohort-14.md",
    size: 96_000,
    type: "md",
    status: "ingested",
    uploaded: "5 days ago",
    chunks: 28,
    progress: 100,
  },
  {
    id: "f8",
    name: "transcript-info-session-may.pdf",
    size: 720_000,
    type: "pdf",
    status: "failed",
    uploaded: "yesterday",
    chunks: 0,
    progress: 0,
    error: "Encrypted PDF · password required",
  },
];
