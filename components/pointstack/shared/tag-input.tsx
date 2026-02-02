"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tags...",
  maxTags = 5,
  suggestions = [],
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const normalized = tag.toLowerCase().trim();
    if (normalized && !value.includes(normalized) && value.length < maxTags) {
      onChange([...value, normalized]);
      setInput("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s.toLowerCase())
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 min-h-[42px] border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-0.5 hover:bg-muted rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {value.length < maxTags && (
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && input && (
        <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-40 overflow-auto">
          {filteredSuggestions.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => addTag(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <p className="mt-1 text-xs text-muted-foreground">
        Press Enter or comma to add. {maxTags - value.length} tags remaining.
      </p>
    </div>
  );
}
