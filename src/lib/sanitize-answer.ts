/**
 * Hide the diagram-renderer's name from assistant prose.
 *
 * The UI turns ```mermaid fenced blocks into pictures, so a non-technical reader
 * should only ever see "diagram" — never the word "Mermaid", a "Mermaid Code"
 * heading, or "code/syntax" framing. The model is also prompted to avoid this,
 * but prompts only nudge; this is the deterministic guarantee.
 *
 * Fence-safe: lines that open/close a fenced code block, and the code inside,
 * are left untouched — so the ```mermaid info string the renderer keys on is
 * preserved. Only prose outside code fences is rewritten.
 */
export function hideMermaidMentions(md: string): string {
  let inFence = false;
  const out: string[] = [];

  for (const line of md.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      out.push(line); // fence line — keep ```mermaid intact
      continue;
    }
    if (inFence) {
      out.push(line); // code content — never touch
      continue;
    }
    // Drop a heading that's only a renderer label, e.g. "## Mermaid Code".
    if (/^#{1,6}\s*mermaid(\s+code)?\s*$/i.test(line)) continue;

    out.push(
      line
        .replace(/\bin mermaid syntax\b/gi, "")
        .replace(/\bmermaid\s+(?:code|syntax)\b/gi, "diagram")
        .replace(/\bmermaid\s+(diagram|chart|flowchart)\b/gi, "$1")
        .replace(/\bmermaid\b/gi, "diagram")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\s+([,.:;])/g, "$1")
        .trimEnd(),
    );
  }

  return out.join("\n");
}
