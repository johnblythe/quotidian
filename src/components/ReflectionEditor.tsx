"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { saveJournalEntry, getJournalEntry } from "@/lib/journal";
import { useToast } from "@/components/Toast";

interface ReflectionEditorProps {
  quoteId: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

type EditorState = "minimal" | "standard" | "focused";

function getEditorState(length: number): EditorState {
  if (length < 100) return "minimal";
  if (length <= 500) return "standard";
  return "focused";
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function ReflectionEditor({
  quoteId,
  initialContent = "",
  onSave,
}: ReflectionEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [showSaved, setShowSaved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();

  const editorState = useMemo(() => getEditorState(content.length), [content.length]);
  const wordCount = useMemo(() => countWords(content), [content]);

  // Load existing entry on mount
  useEffect(() => {
    async function loadEntry() {
      const entry = await getJournalEntry(quoteId);
      if (entry) {
        setContent(entry.content);
      }
      setIsLoaded(true);
    }
    loadEntry();
  }, [quoteId]);

  // Debounced save function
  const debouncedSave = useCallback(
    (newContent: string) => {
      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        await saveJournalEntry(quoteId, newContent);

        // Show saved indicator
        setShowSaved(true);
        showToast("Reflection saved");

        // Clear any existing saved timeout
        if (savedTimeoutRef.current) {
          clearTimeout(savedTimeoutRef.current);
        }

        // Hide saved indicator after 2 seconds
        savedTimeoutRef.current = setTimeout(() => {
          setShowSaved(false);
        }, 2000);
      }, 1000); // 1 second debounce
    },
    [quoteId, showToast]
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  // Auto-grow textarea with content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onSave?.(newContent);
    debouncedSave(newContent);
  };

  return (
    <div
      className={`max-w-[65ch] mx-auto transition-all duration-300 ease-in-out ${
        editorState === "minimal"
          ? "px-6 py-4"
          : editorState === "standard"
          ? "px-6 py-8"
          : "px-8 py-10"
      }`}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        placeholder="What does this stir in you?"
        className={`w-full bg-transparent resize-none outline-none
                   font-serif leading-relaxed
                   placeholder:text-foreground/40
                   border-none focus:ring-0
                   transition-all duration-300 ease-in-out ${
          editorState === "minimal"
            ? "min-h-[80px] text-base"
            : editorState === "standard"
            ? "min-h-[120px] text-lg"
            : "min-h-[160px] text-xl leading-loose"
        }`}
        data-quote-id={quoteId}
      />
      <div className="flex justify-between items-center text-sm text-foreground/40">
        <span
          className={`transition-opacity duration-300 ${
            showSaved ? "opacity-100" : "opacity-0"
          }`}
        >
          Saved
        </span>
        <span
          className={`transition-opacity duration-300 ${
            editorState === "focused" ? "opacity-100" : "opacity-0"
          }`}
        >
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>
    </div>
  );
}
