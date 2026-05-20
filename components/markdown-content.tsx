"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";

// Mermaid initialized flag
let mermaidInitialized = false;

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Mermaid diagram component - renders mermaid code as SVG
 */
function MermaidDiagram({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function renderDiagram() {
      if (!containerRef.current) return;

      try {
        // Dynamically import mermaid (client-side only)
        const mermaid = (await import("mermaid")).default;

        // Initialize only once
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            securityLevel: "strict",
            fontFamily: "ui-monospace, monospace",
          });
          mermaidInitialized = true;
        }

        const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
        const { svg } = await mermaid.render(id, code);
        setSvg(svg);
        setError("");
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError("Failed to render diagram");
      }
    }

    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="my-4 p-4 bg-muted border border-border rounded">
        <pre className="text-sm font-mono whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * YouTube embed component with responsive container
 */
function YouTubeEmbed({ videoId, title }: { videoId: string; title?: string }) {
  return (
    <div className="my-6">
      <div className="relative w-full pt-[56.25%] bg-black/5 dark:bg-white/5">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {title && title !== "Video Tutorial" && (
        <p className="mt-2 text-sm text-muted-foreground text-center">{title}</p>
      )}
    </div>
  );
}

/**
 * Custom components for react-markdown
 */
const markdownComponents: Components = {
  // Custom link handler - embeds YouTube videos
  a: ({ href, children }) => {
    if (!href) {
      return <span>{children}</span>;
    }

    // Block unsafe URL schemes (javascript:, data:, vbscript:, etc.)
    const scheme = href.split(":")[0].toLowerCase();
    if (!["http", "https", "mailto", ""].includes(scheme) && !href.startsWith("/")) {
      return <span>{children}</span>;
    }

    const videoId = getYouTubeVideoId(href);
    if (videoId) {
      const title = typeof children === "string" ? children :
        Array.isArray(children) ? children.join("") : "Video Tutorial";
      return <YouTubeEmbed videoId={videoId} title={title} />;
    }

    // Regular external link
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground underline decoration-accent underline-offset-[3px] hover:text-accent transition-colors"
      >
        {children}
      </a>
    );
  },
  // Style headers
  h1: ({ children }) => (
    <h1 className="font-heading font-semibold text-[28px] md:text-[32px] leading-[1.15] text-foreground mt-10 mb-5 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading font-semibold text-[22px] md:text-[24px] leading-[1.2] text-foreground mt-10 mb-4 first:mt-0 pb-2 border-b border-border">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading font-semibold text-[18px] md:text-[19px] leading-[1.3] text-foreground mt-8 mb-3">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="font-heading font-semibold text-[16px] leading-[1.3] text-foreground mt-6 mb-2">
      {children}
    </h4>
  ),
  // Style paragraphs
  p: ({ children }) => (
    <p className="mb-5 text-[15px] leading-[1.7] text-foreground">{children}</p>
  ),
  // Style lists
  ul: ({ children }) => (
    <ul className="mb-5 pl-5 list-disc marker:text-accent space-y-1.5 text-[15px] leading-[1.7] text-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 pl-5 list-decimal marker:text-accent marker:font-mono marker:text-[13px] space-y-1.5 text-[15px] leading-[1.7] text-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-[1.65]">{children}</li>,
  // Style code blocks - with Mermaid diagram support
  code: ({ className, children }) => {
    const isInline = !className;

    // Check if this is a mermaid code block
    if (className?.includes("language-mermaid")) {
      const code = String(children).replace(/\n$/, "");
      return <MermaidDiagram code={code} />;
    }

    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 bg-muted border border-border font-mono text-[13px] text-foreground">
          {children}
        </code>
      );
    }
    return (
      <code
        className={`block p-4 bg-muted border border-border font-mono text-[13px] text-foreground overflow-x-auto ${className || ""}`}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="mb-5 overflow-hidden">{children}</pre>,
  // Style blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-[3px] border-accent pl-5 my-6 italic text-[16px] leading-[1.6] text-muted-foreground">
      {children}
    </blockquote>
  ),
  // Style strong/bold
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  // Style em/italic
  em: ({ children }) => <em className="italic">{children}</em>,
  // Style horizontal rules
  hr: () => <hr className="my-10 border-t border-foreground" />,
  // Style tables
  table: ({ children }) => (
    <div className="my-6 border border-border bg-card overflow-x-auto">
      <table className="w-full text-[13px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted border-b border-foreground">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left py-2.5 px-3 font-mono text-[10px] uppercase tracking-[1.3px] text-muted-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="py-2.5 px-3 text-foreground border-b border-border last:border-b-0 align-top leading-[1.5]">
      {children}
    </td>
  ),
};

/**
 * Renders markdown content with GitHub Flavored Markdown support
 * and automatic YouTube video embedding
 */
export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div className={`max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true }]]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
