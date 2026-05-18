"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          backgroundColor: "#fafaf8",
          color: "#0a0a0a",
          fontFamily:
            "'Archivo', ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div
              className="font-mono text-[11px] uppercase mb-6"
              style={{ letterSpacing: "1.5px", color: "rgba(10,10,10,.64)" }}
            >
              <span style={{ color: "#d11a36" }}>00 /</span> Error
            </div>
            <h2
              className="text-2xl font-semibold mb-3"
              style={{ fontStyle: "italic" }}
            >
              Something went wrong.
            </h2>
            <p style={{ color: "rgba(10,10,10,.64)" }} className="mb-6">
              A critical error occurred. Try refreshing the page.
            </p>
            {error.digest && (
              <p
                className="text-xs mb-6 font-mono"
                style={{ color: "rgba(10,10,10,.44)" }}
              >
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-md transition-colors font-semibold text-sm"
              style={{ backgroundColor: "#0a0a0a", color: "#fafaf8" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
