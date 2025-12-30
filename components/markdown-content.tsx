"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownContentProps {
  content: string;
  className?: string;
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
  // Style code blocks
  code: ({ className, children }) => {
    const isInline = !className;
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
