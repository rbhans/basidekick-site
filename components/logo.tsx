"use client";

import { useState, useEffect, useRef } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export function Logo({ size = "md", onClick }: LogoProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [displayText, setDisplayText] = useState("basidekick");
  const [cursorVisible, setCursorVisible] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const cursorRef = useRef<NodeJS.Timeout | null>(null);

  const fullText = "basidekick";
  const typingSpeed = 50; // ms per character

  const sizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  useEffect(() => {
    if (isHovering) {
      // Start typing animation
      setDisplayText("");
      setCursorVisible(true);
      let currentIndex = 0;

      const typeNextChar = () => {
        if (currentIndex <= fullText.length) {
          setDisplayText(fullText.slice(0, currentIndex));
          currentIndex++;
          animationRef.current = setTimeout(typeNextChar, typingSpeed);
        } else {
          // Typing complete, blink cursor a few times then hide
          let blinks = 0;
          cursorRef.current = setInterval(() => {
            setCursorVisible((v) => !v);
            blinks++;
            if (blinks >= 6) {
              if (cursorRef.current) clearInterval(cursorRef.current);
              setCursorVisible(false);
            }
          }, 300);
        }
      };

      animationRef.current = setTimeout(typeNextChar, typingSpeed);
    } else {
      // Reset on mouse leave
      if (animationRef.current) clearTimeout(animationRef.current);
      if (cursorRef.current) clearInterval(cursorRef.current);
      setDisplayText(fullText);
      setCursorVisible(false);
    }

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
      if (cursorRef.current) clearInterval(cursorRef.current);
    };
  }, [isHovering]);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`font-mono font-medium ${sizeClasses[size]} transition-colors hover:text-primary`}
    >
      <span className="text-muted-foreground">[</span>
      <span className="inline-block min-w-[7.5ch] pointer-events-none">
        {displayText}
        <span
          className={`pointer-events-none inline-block w-[2px] h-[1em] bg-primary ml-[1px] align-middle transition-opacity ${
            cursorVisible ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
      <span className="text-muted-foreground">]</span>
    </button>
  );
}
