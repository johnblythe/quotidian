"use client";

import { useState, useRef, useEffect } from "react";

interface ReflectionEditorProps {
  quoteId: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

export function ReflectionEditor({
  quoteId,
  initialContent = "",
  onSave,
}: ReflectionEditorProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  };

  return (
    <div className="max-w-[65ch] mx-auto px-6 py-8">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        placeholder="What does this stir in you?"
        className="w-full min-h-[120px] bg-transparent resize-none outline-none
                   font-serif text-lg leading-relaxed
                   placeholder:text-foreground/40
                   border-none focus:ring-0"
        data-quote-id={quoteId}
      />
    </div>
  );
}
