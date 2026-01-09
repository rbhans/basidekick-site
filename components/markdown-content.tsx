"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
        className="text-primary hover:underline"
      >
        {children}
      </a>
    );
  },
  // Style headers
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold mt-8 mb-4 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold mt-6 mb-3">{children}</h3>
  ),
  // Style paragraphs
  p: ({ children }) => (
    <p className="mb-4 leading-relaxed">{children}</p>
  ),
  // Style lists
  ul: ({ children }) => (
    <ul className="mb-4 ml-4 list-disc space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-4 list-decimal space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  // Style code blocks - with Mermaid diagram support
  code: ({ className, children }) => {
    const isInline = !className;

    // Check if this is a mermaid code block
    if (className === "language-mermaid") {
      const code = String(children).replace(/\n$/, "");
      return <MermaidDiagram code={code} />;
    }

    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 bg-muted font-mono text-sm rounded">
          {children}
        </code>
      );
    }
    return (
      <code className={`block p-4 bg-muted font-mono text-sm overflow-x-auto ${className || ""}`}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-4 rounded overflow-hidden">{children}</pre>
  ),
  // Style blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground mb-4">
      {children}
    </blockquote>
  ),
  // Style strong/bold
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  // Style horizontal rules
  hr: () => (
    <hr className="my-8 border-border" />
  ),
};

/**
 * Renders markdown content with GitHub Flavored Markdown support
 * and automatic YouTube video embedding
 */
export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
