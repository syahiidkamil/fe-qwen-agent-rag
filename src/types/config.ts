export interface HeroCardRow {
  k: string;
  v: string;
}

export interface HeroCard {
  label: string;
  livePill: string;
  rows: HeroCardRow[];
  chart: { label: string; data: number[] };
}

export interface HeroConfig {
  eyebrow: string;
  title: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
  tags: string[];
  card: HeroCard;
}

export interface TrustConfig {
  count: string;
  sub: string;
  avatars: string[];
}

export interface ProgramItem {
  n: string;
  title: string;
  meta: string;
  featured: boolean;
  bullets: string[];
  cta: string;
}

export interface Section1Config {
  eyebrow: string;
  title: string;
  body: string;
  items: ProgramItem[];
}

export interface StatItem {
  num: string;
  lbl: string;
}

export interface FlowItem {
  n: string;
  t: string;
  d: string;
}

export interface Section2Config {
  eyebrow: string;
  title: string;
  body: string;
  items: FlowItem[];
}

export interface FooterColumn {
  heading: string;
  links: string[];
}

export interface FooterConfig {
  intro: string;
  columns: FooterColumn[];
  bottomLeft: string;
  bottomCenter: string;
  bottomRight: string;
  bigWord: string;
}

export interface LayoutFlags {
  showTrust: boolean;
  showMarquee: boolean;
  showHeroCard: boolean;
  showStats: boolean;
  showFooterBigWord: boolean;
}

export interface WidgetConfig {
  name: string;
  initial: string;
  welcome: string;
  suggestions: string[];
}

export interface LandingConfig {
  brand: string;
  tagline: string;
  nav: string[];
  hero: HeroConfig;
  trust: TrustConfig;
  marquee: string[];
  section1: Section1Config;
  stats: { items: StatItem[] };
  section2: Section2Config;
  footer: FooterConfig;
  layout: LayoutFlags;
  theme: { accent: string };
  widget: WidgetConfig;
}

export type PresetId = "airanext" | "pulse" | "foyer";

export interface PresetEntry {
  id: PresetId;
  label: string;
  config: LandingConfig;
}
