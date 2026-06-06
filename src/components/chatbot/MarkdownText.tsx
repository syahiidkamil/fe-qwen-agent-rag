import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { isValidElement, type ReactNode } from "react";
import { MermaidDiagram } from "@/components/chatbot/MermaidDiagram";
import { hideMermaidMentions } from "@/lib/sanitize-answer";

interface MarkdownTextProps {
  text: string;
}

// Pull the language + source text out of a fenced code block's <code> child.
function fencedCode(children: ReactNode): { lang: string; code: string } | null {
  const child = Array.isArray(children) ? children[0] : children;
  if (!isValidElement(child)) return null;
  const className: string = (child.props as { className?: string })?.className ?? "";
  const match = /language-(\w+)/.exec(className);
  if (!match) return null;
  const raw = (child.props as { children?: ReactNode })?.children;
  const code = String(Array.isArray(raw) ? raw.join("") : raw ?? "").replace(/\n$/, "");
  return { lang: match[1], code };
}

const components: Components = {
  // Links inside a chat bubble should always open in a new tab.
  a: ({ href, children, ...rest }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  ),
  // Render ```mermaid fences as diagrams; every other fence stays a normal code
  // block. Overriding `pre` (not `code`) keeps the diagram <div> out of a <pre>
  // and lets us swap the whole block cleanly.
  pre: ({ children, ...rest }) => {
    const fenced = fencedCode(children);
    if (fenced?.lang === "mermaid") return <MermaidDiagram code={fenced.code} />;
    return <pre {...rest}>{children}</pre>;
  },
};

/**
 * Renders chat assistant text as Markdown (GFM: tables, task lists, strikethrough,
 * autolinks) and renders ```mermaid fences as diagrams. Raw HTML is NOT enabled,
 * so user/LLM output can't inject markup.
 */
export function MarkdownText({ text }: MarkdownTextProps) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {hideMermaidMentions(text)}
      </ReactMarkdown>
    </div>
  );
}
