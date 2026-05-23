import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownTextProps {
  text: string;
}

// Links inside a chat bubble should always open in a new tab.
const components: Components = {
  a: ({ href, children, ...rest }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  ),
};

/**
 * Renders chat assistant text as Markdown (GFM: tables, task lists, strikethrough,
 * autolinks). Raw HTML is NOT enabled, so user/LLM output can't inject markup.
 */
export function MarkdownText({ text }: MarkdownTextProps) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
