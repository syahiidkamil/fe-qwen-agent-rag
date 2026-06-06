import { useEffect, useState } from "react";

/**
 * Renders a ```mermaid code block as an SVG diagram.
 *
 * Mermaid is heavy and pulls in d3, so it's loaded LAZILY via dynamic import —
 * the chunk only downloads the first time a diagram actually appears, then the
 * browser caches it. The module is initialized once (singleton promise).
 *
 * `securityLevel: 'strict'` because the diagram source comes from the LLM/OCR
 * (untrusted): labels are sanitized and click/script directives are disabled.
 *
 * Streaming-safe: while the answer is still streaming the fence may be
 * incomplete, so `parse()` (suppressErrors) returns false and we keep showing
 * the raw source as a code block until it becomes valid, then swap in the SVG.
 */
let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      m.default.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "default",
      });
      return m.default;
    });
  }
  return mermaidPromise;
}

// Module-level counter → unique, valid DOM id per render call (mermaid injects
// a temporary element keyed by this id).
let seq = 0;

interface MermaidDiagramProps {
  code: string;
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const src = code.trim();
    if (!src) {
      setSvg(null);
      return;
    }
    const id = `mmd-${seq++}`;
    loadMermaid()
      .then(async (mermaid) => {
        const ok = await mermaid.parse(src, { suppressErrors: true });
        if (!ok) throw new Error("incomplete or invalid mermaid");
        const { svg } = await mermaid.render(id, src);
        if (!cancelled) setSvg(svg);
      })
      .catch(() => {
        // Mid-stream / invalid syntax → fall back to the source code block.
        if (!cancelled) setSvg(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (svg) {
    // Output is sanitized by mermaid (securityLevel: 'strict').
    return <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
  }
  return (
    <pre className="mermaid-pending">
      <code>{code}</code>
    </pre>
  );
}
